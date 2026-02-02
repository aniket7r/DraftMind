"""
Tier 3: Opponent draft pattern detection.
Analyzes a team's draft DNA: ban priorities, pick preferences,
comfort picks, one-trick alerts, composition tendencies.
"""
from draftmind.data.data_loader import data_store
from draftmind.data.champion_metadata import get_champion_image_url


def detect_patterns(team_id: str) -> dict | None:
    """Full pattern analysis for a team."""
    profile = data_store.team_profiles.get(team_id)
    if not profile:
        return None

    total_games = profile["total_games"] or 1

    return {
        "team_id": team_id,
        "team_name": profile["team_name"],
        "total_games": total_games,
        "ban_priorities": _analyze_ban_priorities(profile),
        "first_pick_preferences": _analyze_first_picks(profile),
        "comfort_picks": _analyze_comfort_picks(profile),
        "one_trick_alerts": _detect_one_tricks(profile),
        "composition_tendencies": _analyze_comp_tendencies(profile),
        "adaptation_between_games": _detect_adaptation(team_id),
        "ban_recommendations": _generate_ban_recommendations(team_id, profile),
    }


def _analyze_ban_priorities(profile: dict) -> dict:
    """Analyze what a team bans and what gets banned against them."""
    total = profile["total_games"] or 1

    bans_by = []
    for champ, count in list(profile.get("champion_bans_by", {}).items())[:10]:
        bans_by.append({
            "champion": champ,
            "image_url": get_champion_image_url(champ),
            "count": count,
            "rate": round(count / total * 100, 1),
        })

    bans_against = []
    for champ, count in list(profile.get("champion_bans_against", {}).items())[:10]:
        bans_against.append({
            "champion": champ,
            "image_url": get_champion_image_url(champ),
            "count": count,
            "rate": round(count / total * 100, 1),
        })

    first_ban_blue = []
    for champ, count in list(profile.get("first_ban_blue", {}).items())[:5]:
        first_ban_blue.append({
            "champion": champ,
            "count": count,
        })

    first_ban_red = []
    for champ, count in list(profile.get("first_ban_red", {}).items())[:5]:
        first_ban_red.append({
            "champion": champ,
            "count": count,
        })

    return {
        "bans_by_team": bans_by,
        "bans_against_team": bans_against,
        "first_ban_blue": first_ban_blue,
        "first_ban_red": first_ban_red,
    }


def _analyze_first_picks(profile: dict) -> dict:
    """Analyze first-pick preferences when on blue side."""
    first_picks = []
    for champ, count in list(profile.get("first_pick_blue", {}).items())[:5]:
        # Get win rate with this first pick
        picks = profile.get("champion_picks", {})
        pick_data = picks.get(champ, {})
        wr = round(pick_data.get("wins", 0) / max(pick_data.get("games", 1), 1) * 100, 1) if pick_data else 0

        first_picks.append({
            "champion": champ,
            "image_url": get_champion_image_url(champ),
            "count": count,
            "win_rate": wr,
        })

    return {
        "blue_side_first_picks": first_picks,
        "blue_games": profile.get("blue_games", 0),
    }


def _analyze_comfort_picks(profile: dict) -> list[dict]:
    """Identify comfort picks: high pick rate + above average win rate."""
    total = profile["total_games"] or 1
    picks = profile.get("champion_picks", {})
    team_wr = profile.get("win_rate", 50)

    comfort = []
    for champ, data in picks.items():
        games = data["games"]
        wins = data["wins"]
        pick_rate = games / total * 100
        wr = wins / max(games, 1) * 100

        # Comfort pick: picked in >15% of games with above-team win rate
        if pick_rate >= 15 and games >= 3:
            comfort.append({
                "champion": champ,
                "image_url": get_champion_image_url(champ),
                "games": games,
                "wins": wins,
                "pick_rate": round(pick_rate, 1),
                "win_rate": round(wr, 1),
                "above_average": wr > team_wr,
            })

    comfort.sort(key=lambda x: (-x["pick_rate"], -x["win_rate"]))
    return comfort[:10]


def _detect_one_tricks(profile: dict) -> list[dict]:
    """Detect players who rely heavily on 1-2 champions."""
    alerts = []
    player_pools = profile.get("player_pools", {})

    for pname, champions in player_pools.items():
        if not champions:
            continue

        total_player_games = sum(d["games"] for d in champions.values())
        if total_player_games < 3:
            continue

        sorted_champs = sorted(champions.items(), key=lambda x: -x[1]["games"])

        # Check if top champion is >60% of games
        top_champ, top_data = sorted_champs[0]
        top_rate = top_data["games"] / total_player_games * 100

        if top_rate >= 50:
            alerts.append({
                "player_name": pname,
                "champion": top_champ,
                "image_url": get_champion_image_url(top_champ),
                "games": top_data["games"],
                "total_games": total_player_games,
                "pick_rate": round(top_rate, 1),
                "win_rate": round(top_data["wins"] / max(top_data["games"], 1) * 100, 1),
                "unique_champions": len(champions),
                "severity": "high" if top_rate >= 70 else "medium",
            })

    alerts.sort(key=lambda x: -x["pick_rate"])
    return alerts


def _analyze_comp_tendencies(profile: dict) -> dict:
    """Analyze composition tendencies from game data."""
    picks = profile.get("champion_picks", {})

    # Count roles from most-picked champions
    from draftmind.core.champion_roles import get_champion_meta
    tag_counts = {}
    role_counts = {}

    for champ, data in picks.items():
        meta = get_champion_meta(champ)
        if meta:
            for tag in meta.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + data["games"]
            role_counts[meta.primary_role] = role_counts.get(meta.primary_role, 0) + data["games"]

    # Determine tendencies
    total_picks = sum(d["games"] for d in picks.values()) or 1
    tendencies = {}

    for tag, count in sorted(tag_counts.items(), key=lambda x: -x[1]):
        tendencies[tag] = round(count / total_picks * 100, 1)

    return {
        "tag_distribution": tendencies,
        "role_distribution": {k: round(v / total_picks * 100, 1)
                              for k, v in sorted(role_counts.items(), key=lambda x: -x[1])},
    }


def _detect_adaptation(team_id: str) -> list[str]:
    """Detect how a team adapts between games in a series."""
    db = data_store.draft_database
    if not db.get("series"):
        return []

    notes = []
    series_count = 0

    for series in db["series"]:
        # Check if this team played in the series
        if team_id not in series.get("teams", {}):
            continue
        series_count += 1

        games = series.get("games", [])
        if len(games) < 2:
            continue

        # Compare bans between game 1 and game 2
        g1_bans = set()
        g2_bans = set()
        g1_picks = set()
        g2_picks = set()

        for da in games[0].get("draft_actions", []):
            if da["team_id"] == team_id:
                if da["action_type"] == "ban":
                    g1_bans.add(da["champion_name"])
                else:
                    g1_picks.add(da["champion_name"])

        if len(games) > 1:
            for da in games[1].get("draft_actions", []):
                if da["team_id"] == team_id:
                    if da["action_type"] == "ban":
                        g2_bans.add(da["champion_name"])
                    else:
                        g2_picks.add(da["champion_name"])

        ban_changes = g2_bans - g1_bans
        pick_overlap = g1_picks & g2_picks

        if ban_changes and series_count <= 3:
            notes.append(f"Changed bans between G1-G2: added {', '.join(ban_changes)}")
        if pick_overlap and series_count <= 3:
            notes.append(f"Repeated picks G1-G2: {', '.join(pick_overlap)}")

    if not notes:
        notes.append("Insufficient multi-game series data for adaptation analysis")

    return notes[:5]


def _generate_ban_recommendations(team_id: str, profile: dict) -> list[dict]:
    """Generate ban recommendations against this team."""
    recommendations = []
    total = profile["total_games"] or 1

    # Strategy 1: Ban their highest win-rate comfort picks
    picks = profile.get("champion_picks", {})
    for champ, data in picks.items():
        if data["games"] < 3:
            continue
        wr = data["wins"] / data["games"] * 100
        pick_rate = data["games"] / total * 100
        if wr >= 55 and pick_rate >= 15:
            recommendations.append({
                "champion": champ,
                "image_url": get_champion_image_url(champ),
                "reason": f"High win rate comfort pick ({wr:.0f}% WR in {data['games']} games)",
                "priority": "high",
                "impact_score": round((wr / 100) * (pick_rate / 100), 3),
            })

    # Strategy 2: Ban one-trick targets
    for alert in _detect_one_tricks(profile):
        if alert["severity"] == "high":
            recommendations.append({
                "champion": alert["champion"],
                "image_url": alert["image_url"],
                "reason": f"One-trick for {alert['player_name']} ({alert['pick_rate']:.0f}% pick rate)",
                "priority": "high",
                "impact_score": round(alert["pick_rate"] / 100, 3),
            })

    # Strategy 3: Ban their first-pick priorities
    for champ, count in list(profile.get("first_pick_blue", {}).items())[:3]:
        if count >= 2:
            already = any(r["champion"] == champ for r in recommendations)
            if not already:
                recommendations.append({
                    "champion": champ,
                    "image_url": get_champion_image_url(champ),
                    "reason": f"First pick priority ({count} times on blue side)",
                    "priority": "medium",
                    "impact_score": round(count / max(profile.get("blue_games", 1), 1), 3),
                })

    recommendations.sort(key=lambda x: -x["impact_score"])
    return recommendations[:5]
