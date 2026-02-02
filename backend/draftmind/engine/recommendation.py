"""
Multi-signal draft recommendation engine.
Orchestrates all tiers to produce ranked champion recommendations.
"""
from draftmind.data.data_loader import data_store
from draftmind.data.champion_metadata import get_champion_image_url
from draftmind.core.draft_rules import (
    get_action_at, get_draft_phase, get_available_champions, SEQUENCE_MAP
)
from draftmind.core.champion_roles import ALL_CHAMPION_NAMES, normalize_champion_name
from draftmind.engine.statistics import get_meta_score, get_team_affinity_score
from draftmind.engine.composition_scorer import (
    get_counter_score, score_composition_fit, analyze_composition
)

# Scoring weights for picks
PICK_WEIGHTS = {
    "meta": 0.20,
    "team_affinity": 0.30,
    "counter": 0.25,
    "composition": 0.25,
}

# Scoring weights for bans
BAN_WEIGHTS = {
    "opponent_priority": 0.40,
    "opponent_frequency": 0.30,
    "meta": 0.20,
    "counter": 0.10,
}


def recommend(current_actions: list[dict], blue_team_id: str | None = None,
              red_team_id: str | None = None,
              next_sequence: int | None = None) -> dict:
    """Generate top recommendations for the next draft action."""

    # Determine next action
    if next_sequence is None:
        next_sequence = len(current_actions) + 1

    if next_sequence > 20:
        return {"error": "Draft is complete", "recommendations": []}

    action_type, acting_side = get_action_at(next_sequence)
    if action_type == "unknown":
        return {"error": f"Invalid sequence number: {next_sequence}", "recommendations": []}

    phase = get_draft_phase(next_sequence)

    # Determine acting team
    acting_team_id = blue_team_id if acting_side == "blue" else red_team_id
    opponent_team_id = red_team_id if acting_side == "blue" else blue_team_id

    # Parse current state
    banned = []
    blue_picks = []
    red_picks = []
    for a in current_actions:
        champ = normalize_champion_name(a.get("champion_name", ""))
        if a.get("action_type") == "ban":
            banned.append(champ)
        elif a.get("action_type") == "pick":
            if a.get("team_side") == "blue":
                blue_picks.append(champ)
            else:
                red_picks.append(champ)

    my_picks = blue_picks if acting_side == "blue" else red_picks
    opp_picks = red_picks if acting_side == "blue" else blue_picks

    # Available champions
    all_champs = set(data_store.champion_stats.keys()) | ALL_CHAMPION_NAMES
    used = set(banned) | set(blue_picks) | set(red_picks)
    available = all_champs - used

    # Score each available champion
    scored = []
    for champ in available:
        if champ not in data_store.champion_stats:
            continue  # Skip unknown champions

        if action_type == "pick":
            scores = _score_pick(champ, acting_team_id, my_picks, opp_picks)
        else:
            scores = _score_ban(champ, acting_team_id, opponent_team_id, opp_picks)

        total = scores["total"]
        reasons = _generate_reasons(champ, scores, action_type, acting_team_id, opponent_team_id)

        scored.append({
            "champion_name": champ,
            "image_url": get_champion_image_url(champ),
            "score": round(total, 3),
            "confidence": _get_confidence(champ, scores),
            "reasons": reasons,
            "meta_score": round(scores.get("meta", 0), 3),
            "team_score": round(scores.get("team_affinity", scores.get("opponent_priority", 0)), 3),
            "counter_score": round(scores.get("counter", 0), 3),
            "composition_score": round(scores.get("composition", scores.get("opponent_frequency", 0)), 3),
        })

    # Sort by total score, take top 5
    scored.sort(key=lambda x: -x["score"])
    top_5 = scored[:5]

    # Get acting team info
    acting_team_name = None
    if acting_team_id:
        profile = data_store.team_profiles.get(acting_team_id)
        if profile:
            acting_team_name = profile["team_name"]

    return {
        "next_action": {
            "sequence_number": next_sequence,
            "action_type": action_type,
            "team_side": acting_side,
        },
        "recommendations": top_5,
        "draft_phase": phase,
        "acting_team_id": acting_team_id,
        "acting_team_name": acting_team_name,
    }


def _score_pick(champ: str, team_id: str | None,
                my_picks: list[str], opp_picks: list[str]) -> dict:
    """Score a champion for a pick action."""
    meta = get_meta_score(champ)
    team_aff = get_team_affinity_score(champ, team_id) if team_id else 0.3
    counter = get_counter_score(champ, opp_picks)
    comp = score_composition_fit(champ, my_picks)

    total = (
        meta * PICK_WEIGHTS["meta"] +
        team_aff * PICK_WEIGHTS["team_affinity"] +
        counter * PICK_WEIGHTS["counter"] +
        comp * PICK_WEIGHTS["composition"]
    )

    return {
        "meta": meta,
        "team_affinity": team_aff,
        "counter": counter,
        "composition": comp,
        "total": total,
    }


def _score_ban(champ: str, team_id: str | None,
               opponent_id: str | None, opp_picks: list[str]) -> dict:
    """Score a champion for a ban action."""
    meta = get_meta_score(champ)

    # Opponent priority: how much the opponent wants this champion
    opp_priority = 0.0  # Default 0 if no opponent data — don't ban blindly
    opp_freq = 0.0
    has_opponent_data = False
    if opponent_id:
        opp_profile = data_store.team_profiles.get(opponent_id)
        if opp_profile:
            picks = opp_profile.get("champion_picks", {})
            opp_games = opp_profile["total_games"] or 1
            champ_data = picks.get(champ)
            if champ_data:
                has_opponent_data = True
                wr = champ_data["wins"] / max(champ_data["games"], 1)
                freq = champ_data["games"] / opp_games
                opp_priority = min(wr * freq * 3, 1.0)
                opp_freq = min(freq * 2, 1.0)

    # Counter: banning a champion that counters our picks
    counter = 0.1
    if opp_picks:
        counter = get_counter_score(champ, opp_picks) * 0.5

    # For bans, heavily favor champions with actual opponent data
    total = (
        opp_priority * BAN_WEIGHTS["opponent_priority"] +
        opp_freq * BAN_WEIGHTS["opponent_frequency"] +
        meta * BAN_WEIGHTS["meta"] +
        counter * BAN_WEIGHTS["counter"]
    )

    # Bonus for champions with opponent data (data-driven bans beat pure meta)
    if has_opponent_data:
        total += 0.05

    return {
        "opponent_priority": opp_priority,
        "opponent_frequency": opp_freq,
        "meta": meta,
        "counter": counter,
        "total": total,
    }


def _generate_reasons(champ: str, scores: dict, action_type: str,
                      team_id: str | None, opponent_id: str | None) -> list[str]:
    """Generate human-readable reasons for a recommendation."""
    reasons = []
    stats = data_store.champion_stats.get(champ, {})

    if action_type == "pick":
        # Meta reason
        if scores.get("meta", 0) > 0.6:
            reasons.append(f"Strong meta pick ({stats.get('presence', 0):.0f}% presence, {stats.get('win_rate', 0):.0f}% WR)")

        # Team affinity reason
        if team_id and scores.get("team_affinity", 0) > 0.4:
            profile = data_store.team_profiles.get(team_id, {})
            picks = profile.get("champion_picks", {})
            if champ in picks:
                wr = picks[champ]["wins"] / max(picks[champ]["games"], 1) * 100
                reasons.append(f"Team comfort pick ({picks[champ]['games']} games, {wr:.0f}% WR)")

        # Counter reason
        if scores.get("counter", 0) > 0.55:
            reasons.append("Favorable matchups against opponent's picks")

        # Composition reason
        if scores.get("composition", 0) > 0.5:
            reasons.append("Good composition fit (damage balance, role coverage)")

    else:  # ban
        if scores.get("opponent_priority", 0) > 0.4 and opponent_id:
            profile = data_store.team_profiles.get(opponent_id, {})
            picks = profile.get("champion_picks", {})
            if champ in picks:
                reasons.append(f"High priority for opponent ({picks[champ]['games']} games)")

        if scores.get("meta", 0) > 0.6:
            reasons.append(f"Strong meta champion ({stats.get('presence', 0):.0f}% presence)")

        if scores.get("opponent_frequency", 0) > 0.3 and opponent_id:
            reasons.append("Frequently picked by opponent")

    if not reasons:
        if action_type == "pick":
            reasons.append(f"{stats.get('win_rate', 50):.0f}% win rate across {stats.get('games_played', 0)} games")
        else:
            reasons.append(f"{stats.get('presence', 0):.0f}% presence in pro play")

    return reasons


def _get_confidence(champ: str, scores: dict) -> str:
    """Determine confidence level based on data quality."""
    stats = data_store.champion_stats.get(champ, {})
    games = stats.get("games_played", 0)

    if games >= 20 and scores["total"] > 0.5:
        return "high"
    elif games >= 10 or scores["total"] > 0.4:
        return "medium"
    return "low"


def simulate_draft(blue_picks: list[str], red_picks: list[str],
                   blue_team_id: str | None = None,
                   red_team_id: str | None = None) -> dict:
    """Simulate a complete draft and analyze both compositions."""
    blue_analysis = analyze_composition(blue_picks, "blue", blue_team_id or "")
    red_analysis = analyze_composition(red_picks, "red", red_team_id or "")

    # Matchup notes
    notes = []

    # Damage comparison
    blue_dmg = blue_analysis["damage_profile"]
    red_dmg = red_analysis["damage_profile"]
    if blue_dmg["magic"] > red_dmg["magic"] + 1:
        notes.append("Blue side has significantly more magic damage")
    elif red_dmg["magic"] > blue_dmg["magic"] + 1:
        notes.append("Red side has significantly more magic damage")

    # CC comparison
    if blue_analysis["cc_score"] > red_analysis["cc_score"] + 0.5:
        notes.append("Blue side has superior crowd control")
    elif red_analysis["cc_score"] > blue_analysis["cc_score"] + 0.5:
        notes.append("Red side has superior crowd control")

    # Scaling comparison
    blue_late = blue_analysis["scaling_profile"].get("late", 0)
    red_late = red_analysis["scaling_profile"].get("late", 0)
    if blue_late > red_late + 1:
        notes.append("Blue side scales better — red needs to close out early")
    elif red_late > blue_late + 1:
        notes.append("Red side scales better — blue needs to close out early")

    # Engage comparison
    if blue_analysis["engage_count"] > red_analysis["engage_count"] + 1:
        notes.append("Blue side has more engage tools")
    elif red_analysis["engage_count"] > blue_analysis["engage_count"] + 1:
        notes.append("Red side has more engage tools")

    # Win rate comparison
    blue_wr = blue_analysis["avg_win_rate"]
    red_wr = red_analysis["avg_win_rate"]
    if abs(blue_wr - red_wr) > 3:
        favored = "Blue" if blue_wr > red_wr else "Red"
        notes.append(f"{favored} side champions have higher average win rates")

    if not notes:
        notes.append("Relatively even draft — game will likely be decided by execution")

    # Estimate win probability from composition signals
    from draftmind.engine.composition_scorer import estimate_win_probability
    win_prob = estimate_win_probability(blue_analysis, red_analysis,
                                         blue_team_id, red_team_id)

    return {
        "blue_analysis": blue_analysis,
        "red_analysis": red_analysis,
        "matchup_notes": notes,
        "blue_win_probability": win_prob,
    }
