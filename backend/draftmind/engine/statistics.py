"""
Tier 1: Statistical intelligence engine.
Provides champion stats, team stats, and meta analysis.
"""
from draftmind.data.data_loader import data_store
from draftmind.data.champion_metadata import get_champion_image_url


def get_champion_list(sort_by: str = "presence", limit: int = 50, role: str = "") -> list[dict]:
    """Get sorted list of champions with stats."""
    champs = list(data_store.champion_stats.values())

    if role:
        champs = [c for c in champs if c.get("primary_role") == role]

    valid_sorts = {"presence", "win_rate", "pick_rate", "ban_rate", "games_played", "name"}
    if sort_by not in valid_sorts:
        sort_by = "presence"

    reverse = sort_by != "name"
    champs.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

    return champs[:limit]


def get_champion_detail(name: str) -> dict | None:
    """Get detailed stats for a champion including synergies and counters."""
    # Try exact match first, then case-insensitive
    stats = data_store.champion_stats.get(name)
    if not stats:
        name_lower = name.lower()
        for k, v in data_store.champion_stats.items():
            if k.lower() == name_lower:
                stats = v
                name = k
                break
    if not stats:
        return None

    result = dict(stats)

    # Add synergies
    synergies_data = data_store.champion_pairs.get("synergies", {}).get(name, {})
    result["synergies"] = [
        {"champion": k, "image_url": get_champion_image_url(k), **v}
        for k, v in list(synergies_data.items())[:10]
    ]

    # Add counters
    counters_data = data_store.champion_pairs.get("counters", {}).get(name, {})
    result["counters"] = [
        {"champion": k, "image_url": get_champion_image_url(k), **v}
        for k, v in list(counters_data.items())[:10]
    ]

    # Add teams that pick this champion
    teams_picking = []
    for tid, profile in data_store.team_profiles.items():
        picks = profile.get("champion_picks", {})
        if name in picks:
            teams_picking.append({
                "team_id": tid,
                "team_name": profile["team_name"],
                "games": picks[name]["games"],
                "wins": picks[name]["wins"],
                "win_rate": round(picks[name]["wins"] / max(picks[name]["games"], 1) * 100, 1),
            })
    teams_picking.sort(key=lambda x: -x["games"])
    result["picked_by_teams"] = teams_picking[:10]

    return result


def get_team_list(search: str = "", limit: int = 20) -> list[dict]:
    """Get list of teams with summary stats."""
    teams = []
    for tid, profile in data_store.team_profiles.items():
        if search and search.lower() not in profile["team_name"].lower():
            continue

        top_picks = [
            {"champion": k, "games": v["games"], "wins": v["wins"],
             "win_rate": round(v["wins"] / max(v["games"], 1) * 100, 1),
             "image_url": get_champion_image_url(k)}
            for k, v in list(profile.get("champion_picks", {}).items())[:5]
        ]
        top_bans = [
            {"champion": k, "count": v}
            for k, v in list(profile.get("champion_bans_by", {}).items())[:5]
        ]

        teams.append({
            "team_id": tid,
            "team_name": profile["team_name"],
            "total_games": profile["total_games"],
            "total_wins": profile["total_wins"],
            "win_rate": profile["win_rate"],
            "series_count": profile["series_count"],
            "top_picks": top_picks,
            "top_bans": top_bans,
        })

    teams.sort(key=lambda x: -x["total_games"])
    return teams[:limit]


def get_team_detail(team_id: str) -> dict | None:
    """Get detailed team profile."""
    return data_store.team_profiles.get(team_id)


def get_meta_score(champion_name: str) -> float:
    """Calculate meta relevance score for a champion (0-1)."""
    stats = data_store.champion_stats.get(champion_name)
    if not stats:
        return 0.0

    games = stats["games_played"]
    # Sample size dampening: need 10+ games for full confidence
    confidence = min(games / 10, 1.0)

    # Combine win rate (normalized around 50%) and presence
    wr_component = (stats["win_rate"] - 40) / 25  # 40% = 0, 65% = 1
    presence_component = stats["presence"] / 100
    pick_component = stats["pick_rate"] / 50

    raw_score = (wr_component * 0.4 + presence_component * 0.3 + pick_component * 0.3)
    # Dampen by confidence — low-sample champions regress toward 0.3
    score = 0.3 * (1 - confidence) + raw_score * confidence
    return max(0, min(1, score))


def get_team_affinity_score(champion_name: str, team_id: str) -> float:
    """Calculate how well a champion fits a team's style (0-1)."""
    profile = data_store.team_profiles.get(team_id)
    if not profile:
        return 0.0

    picks = profile.get("champion_picks", {})
    champ_data = picks.get(champion_name)
    if not champ_data:
        return 0.1  # Small base score for unknown

    total_team_games = profile["total_games"] or 1
    pick_freq = champ_data["games"] / total_team_games
    champ_wr = champ_data["wins"] / max(champ_data["games"], 1)

    # Check player mastery
    max_player_games = 0
    for pname, pool in profile.get("player_pools", {}).items():
        if champion_name in pool:
            max_player_games = max(max_player_games, pool[champion_name]["games"])

    player_mastery = min(max_player_games / 5, 1.0)  # 5+ games = full mastery

    score = (pick_freq * 0.3 + champ_wr * 0.4 + player_mastery * 0.3)
    return max(0, min(1, score))
