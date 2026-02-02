"""
Composition analysis engine.
Analyzes team compositions for damage balance, CC, scaling, and archetype.
"""
from draftmind.core.champion_roles import (
    get_champion_meta, get_damage_profile, get_cc_score,
    get_scaling_profile, has_role_coverage, get_engage_champions
)
from draftmind.data.data_loader import data_store
from draftmind.data.champion_metadata import get_champion_image_url


COMPOSITION_ARCHETYPES = {
    "teamfight": "Strong 5v5 teamfight composition with engage and AoE damage",
    "pick": "Pick composition focused on catching enemies out of position",
    "split": "Split-push composition with strong side laners",
    "poke": "Poke composition with long-range abilities",
    "protect": "Protect-the-carry composition built around a hypercarry",
    "dive": "Dive composition that excels at reaching backline targets",
    "balanced": "Balanced composition with no extreme specialization",
}


def classify_composition(champion_names: list[str]) -> str:
    """Classify a team composition archetype."""
    if len(champion_names) < 3:
        return "balanced"

    engage_champs = get_engage_champions()
    engage_count = sum(1 for c in champion_names if c in engage_champs)

    damage = get_damage_profile(champion_names)
    scaling = get_scaling_profile(champion_names)
    cc = get_cc_score(champion_names)

    # Count tags
    tag_counts = {}
    for name in champion_names:
        meta = get_champion_meta(name)
        if meta:
            for tag in meta.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

    assassins = tag_counts.get("assassin", 0)
    mages = tag_counts.get("mage", 0)
    tanks = tag_counts.get("tank", 0)
    marksmen = tag_counts.get("marksman", 0)

    # Classification heuristics
    if engage_count >= 3 and cc >= 2.0:
        return "teamfight"
    if assassins >= 2 and engage_count <= 1:
        return "pick"
    if scaling.get("late", 0) >= 3 and marksmen >= 1:
        return "protect"
    if mages >= 3 and cc < 1.5:
        return "poke"
    if engage_count >= 2 and assassins >= 1:
        return "dive"
    if scaling.get("late", 0) <= 1 and tanks <= 1:
        return "split"

    return "balanced"


def analyze_composition(champion_names: list[str], team_side: str = "",
                        team_id: str = "") -> dict:
    """Full composition analysis for a team."""
    damage = get_damage_profile(champion_names)
    cc = get_cc_score(champion_names)
    scaling = get_scaling_profile(champion_names)
    roles = has_role_coverage(champion_names)
    comp_type = classify_composition(champion_names)

    engage_champs = get_engage_champions()
    engage_count = sum(1 for c in champion_names if c in engage_champs)

    # Calculate strengths and weaknesses
    strengths = []
    weaknesses = []

    # Damage balance
    if damage["physical"] >= 2 and damage["magic"] >= 2:
        strengths.append("Balanced damage profile — hard to itemize against")
    elif damage["physical"] >= 4:
        weaknesses.append("Heavily physical damage — vulnerable to armor stacking")
    elif damage["magic"] >= 4:
        weaknesses.append("Heavily magic damage — vulnerable to MR stacking")

    # CC
    if cc >= 2.5:
        strengths.append("High crowd control — strong teamfight lockdown")
    elif cc <= 1.0:
        weaknesses.append("Low crowd control — limited engage and peel")

    # Engage
    if engage_count >= 2:
        strengths.append(f"{engage_count} engage threats — multiple initiation options")
    elif engage_count == 0:
        weaknesses.append("No reliable engage — dependent on enemy mistakes")

    # Scaling
    if scaling.get("late", 0) >= 3:
        strengths.append("Strong scaling — favored in longer games")
        weaknesses.append("Weak early game — vulnerable to early aggression")
    elif scaling.get("early", 0) >= 3:
        strengths.append("Strong early game — can snowball leads")
        weaknesses.append("Falls off late — needs to close out games quickly")

    # Role coverage
    if roles["complete"]:
        strengths.append("Full role coverage — standard team composition")
    else:
        missing = [r for r in ["top", "jungle", "mid", "bot", "support"]
                   if not roles.get(r)]
        if missing:
            weaknesses.append(f"Non-standard roles: missing {', '.join(missing)} specialist")

    # Average win rate from champion stats
    win_rates = []
    for name in champion_names:
        cs = data_store.champion_stats.get(name)
        if cs:
            win_rates.append(cs["win_rate"])
    avg_wr = sum(win_rates) / len(win_rates) if win_rates else 50.0

    # Synergy score
    synergy_score = compute_synergy_score(champion_names)

    team_name = None
    if team_id:
        profile = data_store.team_profiles.get(team_id)
        if profile:
            team_name = profile["team_name"]

    return {
        "team_side": team_side,
        "team_name": team_name,
        "champions": champion_names,
        "damage_profile": damage,
        "cc_score": round(cc, 2),
        "scaling_profile": scaling,
        "engage_count": engage_count,
        "has_full_role_coverage": roles["complete"],
        "composition_type": comp_type,
        "composition_description": COMPOSITION_ARCHETYPES.get(comp_type, ""),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "avg_win_rate": round(avg_wr, 1),
        "synergy_score": round(synergy_score, 2),
    }


def estimate_win_probability(blue_analysis: dict, red_analysis: dict,
                             blue_team_id: str | None = None,
                             red_team_id: str | None = None) -> float:
    """Estimate blue-side win probability from composition analysis signals.

    Uses ML model if available, otherwise falls back to heuristic.
    """
    from draftmind.engine.win_predictor import win_predictor
    if win_predictor.ready:
        try:
            return win_predictor.predict(
                blue_analysis["champions"], red_analysis["champions"],
                blue_team_id, red_team_id)
        except Exception:
            pass  # Fall through to heuristic

    # Heuristic fallback
    score = 0.0  # Accumulates advantage for blue (positive = blue favored)

    # 1. Champion win rate advantage (strongest signal, +-0.10 max)
    blue_wr = blue_analysis["avg_win_rate"]  # already 0-100
    red_wr = red_analysis["avg_win_rate"]
    wr_diff = (blue_wr - red_wr) / 100  # e.g., 54-50 = 0.04
    score += max(-0.10, min(0.10, wr_diff * 2))

    # 2. Synergy advantage (+-0.05 max)
    syn_diff = blue_analysis["synergy_score"] - red_analysis["synergy_score"]
    score += max(-0.05, min(0.05, syn_diff * 0.5))

    # 3. CC advantage (+-0.04 max)
    cc_diff = blue_analysis["cc_score"] - red_analysis["cc_score"]
    score += max(-0.04, min(0.04, cc_diff * 0.02))

    # 4. Engage advantage (+-0.03 max)
    eng_diff = blue_analysis["engage_count"] - red_analysis["engage_count"]
    score += max(-0.03, min(0.03, eng_diff * 0.015))

    # 5. Damage balance bonus (+-0.03 max — team with balanced damage gets edge)
    blue_dmg = blue_analysis["damage_profile"]
    red_dmg = red_analysis["damage_profile"]
    blue_total = sum(blue_dmg.values()) or 1
    red_total = sum(red_dmg.values()) or 1
    blue_balance = 1.0 - abs(blue_dmg["physical"] - blue_dmg["magic"]) / blue_total
    red_balance = 1.0 - abs(red_dmg["physical"] - red_dmg["magic"]) / red_total
    score += max(-0.03, min(0.03, (blue_balance - red_balance) * 0.06))

    # 6. Role coverage bonus (+-0.02)
    if blue_analysis["has_full_role_coverage"] and not red_analysis["has_full_role_coverage"]:
        score += 0.02
    elif red_analysis["has_full_role_coverage"] and not blue_analysis["has_full_role_coverage"]:
        score -= 0.02

    # 7. Team historical win rate (+-0.08 max, if both teams provided)
    if blue_team_id and red_team_id:
        blue_profile = data_store.team_profiles.get(blue_team_id)
        red_profile = data_store.team_profiles.get(red_team_id)
        if blue_profile and red_profile:
            team_wr_diff = (blue_profile["win_rate"] - red_profile["win_rate"]) / 100
            score += max(-0.08, min(0.08, team_wr_diff * 1.5))

    # Convert score to probability (0.5 centered, clamped to [0.25, 0.75])
    probability = 0.5 + score
    return max(0.25, min(0.75, round(probability, 3)))


def compute_synergy_score(champion_names: list[str]) -> float:
    """Compute average synergy score between all pairs in the team."""
    synergies = data_store.champion_pairs.get("synergies", {})
    scores = []

    for i, c1 in enumerate(champion_names):
        for c2 in champion_names[i+1:]:
            pair_data = synergies.get(c1, {}).get(c2)
            if pair_data and pair_data["games"] >= 2:
                # Normalize win rate to 0-1 scale centered on 50%
                scores.append((pair_data["win_rate"] - 30) / 40)

    return sum(scores) / len(scores) if scores else 0.5


def get_counter_score(champion_name: str, opponent_picks: list[str]) -> float:
    """Score how well a champion counters the opponent's picks (0-1)."""
    if not opponent_picks:
        return 0.5

    counters = data_store.champion_pairs.get("counters", {})
    champ_counters = counters.get(champion_name, {})

    scores = []
    for opp in opponent_picks:
        matchup = champ_counters.get(opp)
        if matchup and matchup["games"] >= 2:
            scores.append(matchup["win_rate"] / 100)

    return sum(scores) / len(scores) if scores else 0.5


def score_composition_fit(champion_name: str, existing_picks: list[str]) -> float:
    """Score how well a champion fits with existing team picks (0-1)."""
    if not existing_picks:
        return 0.5

    proposed = existing_picks + [champion_name]

    # Damage balance reward
    damage = get_damage_profile(proposed)
    total = sum(damage.values()) or 1
    balance = 1.0 - abs(damage["physical"] - damage["magic"]) / total
    damage_score = balance * 0.3

    # CC contribution
    new_cc = get_cc_score(proposed)
    old_cc = get_cc_score(existing_picks)
    cc_bonus = min((new_cc - old_cc) * 0.5, 0.2) if new_cc > old_cc else 0
    cc_score = 0.1 + cc_bonus

    # Role coverage
    roles = has_role_coverage(proposed)
    old_roles = has_role_coverage(existing_picks)
    new_roles_filled = sum(1 for v in roles.values() if v and isinstance(v, bool))
    old_roles_filled = sum(1 for v in old_roles.values() if v and isinstance(v, bool))
    role_score = 0.2 if new_roles_filled > old_roles_filled else 0.1

    # Engage check
    meta = get_champion_meta(champion_name)
    engage_champs = get_engage_champions()
    current_engage = sum(1 for c in existing_picks if c in engage_champs)
    engage_score = 0.15 if (meta and meta.is_engage and current_engage < 2) else 0.05

    # Synergy with existing picks
    synergy_score = 0
    synergies = data_store.champion_pairs.get("synergies", {})
    for pick in existing_picks:
        pair = synergies.get(champion_name, {}).get(pick)
        if pair and pair["games"] >= 2:
            synergy_score += (pair["win_rate"] - 45) / 100
    synergy_score = max(0, min(0.25, synergy_score / max(len(existing_picks), 1) + 0.1))

    total_score = damage_score + cc_score + role_score + engage_score + synergy_score
    return max(0, min(1, total_score))
