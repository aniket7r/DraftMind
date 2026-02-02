"""
Pre-compute champion/team/player statistics from draft database.
Input: data/processed/draft_database.json
Output: data/processed/champion_stats.json, team_profiles.json, player_pools.json, champion_pairs.json
"""
import sys
import json
from pathlib import Path
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from draftmind.config import PROCESSED_DIR
from draftmind.core.champion_roles import normalize_champion_name, get_champion_meta
from draftmind.data.champion_metadata import get_champion_image_url


def compute_champion_stats(series_list: list) -> dict:
    """Compute per-champion statistics across all games."""
    stats = defaultdict(lambda: {
        "name": "",
        "total_games": 0,
        "total_wins": 0,
        "total_bans": 0,
        "total_picks": 0,
        "blue_picks": 0,
        "blue_wins": 0,
        "red_picks": 0,
        "red_wins": 0,
        "kills_sum": 0,
        "deaths_sum": 0,
        "assists_sum": 0,
        "damage_sum": 0,
        "gold_sum": 0,
        "vision_sum": 0,
        "cs_sum": 0,
        "games_with_stats": 0,
    })

    total_games = 0

    for series in series_list:
        for game in series["games"]:
            total_games += 1
            winner_side = game["winner_side"]

            # Process draft actions
            picked_champs = {}  # champ_name -> {side, team_id}
            for da in game["draft_actions"]:
                champ = da["champion_name"]
                stats[champ]["name"] = champ

                if da["action_type"] == "ban":
                    stats[champ]["total_bans"] += 1
                elif da["action_type"] == "pick":
                    stats[champ]["total_picks"] += 1
                    side = da["team_side"]
                    picked_champs[champ] = {"side": side, "team_id": da["team_id"]}

                    if side == "blue":
                        stats[champ]["blue_picks"] += 1
                    else:
                        stats[champ]["red_picks"] += 1

            # Process player stats for picked champions
            for side_key in ["blue_team", "red_team"]:
                team = game[side_key]
                team_won = team["won"]

                for player in team["players"]:
                    champ = player["champion_name"]
                    if champ not in stats:
                        continue
                    stats[champ]["total_games"] += 1
                    stats[champ]["games_with_stats"] += 1

                    if team_won:
                        stats[champ]["total_wins"] += 1
                        if team["side"] == "blue":
                            stats[champ]["blue_wins"] += 1
                        else:
                            stats[champ]["red_wins"] += 1

                    stats[champ]["kills_sum"] += player.get("kills", 0)
                    stats[champ]["deaths_sum"] += player.get("deaths", 0)
                    stats[champ]["assists_sum"] += player.get("assists", 0)
                    stats[champ]["damage_sum"] += player.get("damage_dealt", 0)
                    stats[champ]["gold_sum"] += player.get("gold_earned", 0)
                    stats[champ]["vision_sum"] += player.get("vision_score", 0)
                    stats[champ]["cs_sum"] += player.get("cs", 0)

    # Finalize stats
    result = {}
    for champ, s in stats.items():
        games = s["games_with_stats"] or 1
        picks = s["total_picks"] or 1

        meta = get_champion_meta(champ)
        primary_role = meta.primary_role if meta else "unknown"
        tags = meta.tags if meta else []

        result[champ] = {
            "name": champ,
            "image_url": get_champion_image_url(champ),
            "primary_role": primary_role,
            "tags": tags,
            "total_games": total_games,
            "games_played": s["total_games"],
            "wins": s["total_wins"],
            "win_rate": round(s["total_wins"] / max(s["total_games"], 1) * 100, 1),
            "picks": s["total_picks"],
            "pick_rate": round(s["total_picks"] / max(total_games, 1) * 100, 1),
            "bans": s["total_bans"],
            "ban_rate": round(s["total_bans"] / max(total_games, 1) * 100, 1),
            "presence": round((s["total_picks"] + s["total_bans"]) / max(total_games, 1) * 100, 1),
            "blue_picks": s["blue_picks"],
            "blue_wins": s["blue_wins"],
            "blue_win_rate": round(s["blue_wins"] / max(s["blue_picks"], 1) * 100, 1),
            "red_picks": s["red_picks"],
            "red_wins": s["red_wins"],
            "red_win_rate": round(s["red_wins"] / max(s["red_picks"], 1) * 100, 1),
            "avg_kills": round(s["kills_sum"] / games, 1),
            "avg_deaths": round(s["deaths_sum"] / games, 1),
            "avg_assists": round(s["assists_sum"] / games, 1),
            "avg_damage": round(s["damage_sum"] / games),
            "avg_gold": round(s["gold_sum"] / games),
            "avg_vision": round(s["vision_sum"] / games, 1),
            "avg_cs": round(s["cs_sum"] / games, 1),
        }

    return result


def compute_champion_pairs(series_list: list) -> dict:
    """Compute champion synergy and counter stats."""
    # Synergy: teammates in same game
    synergy = defaultdict(lambda: defaultdict(lambda: {"games": 0, "wins": 0}))
    # Counter: opponents in same game
    counter = defaultdict(lambda: defaultdict(lambda: {"games": 0, "wins": 0}))

    for series in series_list:
        for game in series["games"]:
            blue_team = game["blue_team"]
            red_team = game["red_team"]

            blue_champs = [p["champion_name"] for p in blue_team["players"]]
            red_champs = [p["champion_name"] for p in red_team["players"]]
            blue_won = blue_team["won"]

            # Synergies (same team)
            for i, c1 in enumerate(blue_champs):
                for c2 in blue_champs[i+1:]:
                    synergy[c1][c2]["games"] += 1
                    synergy[c2][c1]["games"] += 1
                    if blue_won:
                        synergy[c1][c2]["wins"] += 1
                        synergy[c2][c1]["wins"] += 1

            for i, c1 in enumerate(red_champs):
                for c2 in red_champs[i+1:]:
                    synergy[c1][c2]["games"] += 1
                    synergy[c2][c1]["games"] += 1
                    if not blue_won:
                        synergy[c1][c2]["wins"] += 1
                        synergy[c2][c1]["wins"] += 1

            # Counters (opposing teams) - from blue perspective
            for c1 in blue_champs:
                for c2 in red_champs:
                    counter[c1][c2]["games"] += 1
                    counter[c2][c1]["games"] += 1
                    if blue_won:
                        counter[c1][c2]["wins"] += 1
                    else:
                        counter[c2][c1]["wins"] += 1

    # Convert to serializable format with min 2 games threshold
    result = {
        "synergies": {},
        "counters": {},
    }

    for champ, partners in synergy.items():
        pairs = {}
        for partner, data in partners.items():
            if data["games"] >= 2:
                pairs[partner] = {
                    "games": data["games"],
                    "wins": data["wins"],
                    "win_rate": round(data["wins"] / data["games"] * 100, 1),
                }
        if pairs:
            result["synergies"][champ] = dict(sorted(pairs.items(),
                key=lambda x: (-x[1]["games"], -x[1]["win_rate"])))

    for champ, opponents in counter.items():
        matchups = {}
        for opp, data in opponents.items():
            if data["games"] >= 2:
                matchups[opp] = {
                    "games": data["games"],
                    "wins": data["wins"],
                    "win_rate": round(data["wins"] / data["games"] * 100, 1),
                }
        if matchups:
            result["counters"][champ] = dict(sorted(matchups.items(),
                key=lambda x: (-x[1]["games"], -x[1]["win_rate"])))

    return result


def compute_team_profiles(series_list: list) -> dict:
    """Compute per-team profiles with draft patterns."""
    teams = defaultdict(lambda: {
        "team_id": "",
        "team_name": "",
        "total_games": 0,
        "total_wins": 0,
        "blue_games": 0,
        "blue_wins": 0,
        "red_games": 0,
        "red_wins": 0,
        "champion_picks": defaultdict(lambda: {"games": 0, "wins": 0}),
        "champion_bans_by": defaultdict(int),
        "champion_bans_against": defaultdict(int),
        "first_pick_blue": defaultdict(int),
        "first_ban_blue": defaultdict(int),
        "first_ban_red": defaultdict(int),
        "player_pools": defaultdict(lambda: defaultdict(lambda: {"games": 0, "wins": 0})),
        "recent_results": [],
        "series_ids": set(),
    })

    for series in series_list:
        for game in series["games"]:
            blue_team = game["blue_team"]
            red_team = game["red_team"]

            for team_data in [blue_team, red_team]:
                tid = team_data["team_id"]
                side = team_data["side"]
                won = team_data["won"]
                t = teams[tid]

                t["team_id"] = tid
                t["team_name"] = team_data["team_name"]
                t["total_games"] += 1
                t["series_ids"].add(game["series_id"])

                if won:
                    t["total_wins"] += 1
                if side == "blue":
                    t["blue_games"] += 1
                    if won:
                        t["blue_wins"] += 1
                else:
                    t["red_games"] += 1
                    if won:
                        t["red_wins"] += 1

                t["recent_results"].append("W" if won else "L")

                # Player pools
                for player in team_data["players"]:
                    pname = player["player_name"]
                    champ = player["champion_name"]
                    t["player_pools"][pname][champ]["games"] += 1
                    if won:
                        t["player_pools"][pname][champ]["wins"] += 1

            # Draft patterns per team
            for da in game["draft_actions"]:
                tid = da["team_id"]
                champ = da["champion_name"]
                side = da["team_side"]

                if da["action_type"] == "ban":
                    teams[tid]["champion_bans_by"][champ] += 1
                    # Determine opponent
                    opp_tid = (blue_team["team_id"] if tid == red_team["team_id"]
                               else red_team["team_id"])
                    teams[opp_tid]["champion_bans_against"][champ] += 1

                    # First ban tracking
                    if da["sequence_number"] == 1 and side == "blue":
                        teams[tid]["first_ban_blue"][champ] += 1
                    elif da["sequence_number"] == 2 and side == "red":
                        teams[tid]["first_ban_red"][champ] += 1

                elif da["action_type"] == "pick":
                    teams[tid]["champion_picks"][champ]["games"] += 1
                    # Check if this pick won
                    team_won = (blue_team["won"] if tid == blue_team["team_id"]
                                else red_team["won"])
                    if team_won:
                        teams[tid]["champion_picks"][champ]["wins"] += 1

                    # First pick tracking (sequence 7 = blue first pick)
                    if da["sequence_number"] == 7 and side == "blue":
                        teams[tid]["first_pick_blue"][champ] += 1

    # Finalize and serialize
    result = {}
    for tid, t in teams.items():
        total = t["total_games"] or 1
        result[tid] = {
            "team_id": tid,
            "team_name": t["team_name"],
            "total_games": t["total_games"],
            "total_wins": t["total_wins"],
            "win_rate": round(t["total_wins"] / total * 100, 1),
            "blue_games": t["blue_games"],
            "blue_wins": t["blue_wins"],
            "blue_win_rate": round(t["blue_wins"] / max(t["blue_games"], 1) * 100, 1),
            "red_games": t["red_games"],
            "red_wins": t["red_wins"],
            "red_win_rate": round(t["red_wins"] / max(t["red_games"], 1) * 100, 1),
            "series_count": len(t["series_ids"]),
            "champion_picks": dict(sorted(
                {k: dict(v) for k, v in t["champion_picks"].items()}.items(),
                key=lambda x: -x[1]["games"])),
            "champion_bans_by": dict(sorted(
                dict(t["champion_bans_by"]).items(), key=lambda x: -x[1])),
            "champion_bans_against": dict(sorted(
                dict(t["champion_bans_against"]).items(), key=lambda x: -x[1])),
            "first_pick_blue": dict(sorted(
                dict(t["first_pick_blue"]).items(), key=lambda x: -x[1])),
            "first_ban_blue": dict(sorted(
                dict(t["first_ban_blue"]).items(), key=lambda x: -x[1])),
            "first_ban_red": dict(sorted(
                dict(t["first_ban_red"]).items(), key=lambda x: -x[1])),
            "player_pools": {
                pname: dict(sorted(
                    {champ: dict(data) for champ, data in champs.items()}.items(),
                    key=lambda x: -x[1]["games"]))
                for pname, champs in t["player_pools"].items()
            },
            "recent_results": t["recent_results"][-20:],  # Last 20 games
        }

    return result


def compute_player_pools(series_list: list) -> dict:
    """Compute per-player champion pools."""
    players = defaultdict(lambda: {
        "player_id": "",
        "player_name": "",
        "team_id": "",
        "team_name": "",
        "total_games": 0,
        "champions": defaultdict(lambda: {
            "games": 0, "wins": 0,
            "kills_sum": 0, "deaths_sum": 0, "assists_sum": 0,
        }),
    })

    for series in series_list:
        for game in series["games"]:
            for side_key in ["blue_team", "red_team"]:
                team = game[side_key]
                won = team["won"]

                for player in team["players"]:
                    pid = player["player_id"]
                    champ = player["champion_name"]
                    p = players[pid]

                    p["player_id"] = pid
                    p["player_name"] = player["player_name"]
                    p["team_id"] = team["team_id"]
                    p["team_name"] = team["team_name"]
                    p["total_games"] += 1

                    c = p["champions"][champ]
                    c["games"] += 1
                    if won:
                        c["wins"] += 1
                    c["kills_sum"] += player.get("kills", 0)
                    c["deaths_sum"] += player.get("deaths", 0)
                    c["assists_sum"] += player.get("assists", 0)

    # Finalize
    result = {}
    for pid, p in players.items():
        champs = {}
        for champ, data in p["champions"].items():
            games = data["games"] or 1
            champs[champ] = {
                "games": data["games"],
                "wins": data["wins"],
                "win_rate": round(data["wins"] / games * 100, 1),
                "avg_kills": round(data["kills_sum"] / games, 1),
                "avg_deaths": round(data["deaths_sum"] / games, 1),
                "avg_assists": round(data["assists_sum"] / games, 1),
            }
        result[pid] = {
            "player_id": pid,
            "player_name": p["player_name"],
            "team_id": p["team_id"],
            "team_name": p["team_name"],
            "total_games": p["total_games"],
            "unique_champions": len(champs),
            "champions": dict(sorted(champs.items(), key=lambda x: -x[1]["games"])),
        }

    return result


def main():
    print("=" * 60)
    print("COMPUTE STATISTICS")
    print("=" * 60)

    db_path = PROCESSED_DIR / "draft_database.json"
    if not db_path.exists():
        print("ERROR: draft_database.json not found. Run build_draft_database.py first.")
        return

    print("Loading draft database...")
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)

    series_list = db["series"]
    print(f"  {db['total_series']} series, {db['total_games']} games, {len(db['unique_champions'])} champions")

    # 1. Champion Stats
    print("\nComputing champion statistics...")
    champ_stats = compute_champion_stats(series_list)
    champ_path = PROCESSED_DIR / "champion_stats.json"
    with open(champ_path, "w", encoding="utf-8") as f:
        json.dump(champ_stats, f, indent=2)
    print(f"  {len(champ_stats)} champions -> {champ_path}")

    # 2. Champion Pairs (Synergies & Counters)
    print("\nComputing champion pairs...")
    pairs = compute_champion_pairs(series_list)
    pairs_path = PROCESSED_DIR / "champion_pairs.json"
    with open(pairs_path, "w", encoding="utf-8") as f:
        json.dump(pairs, f, indent=2)
    print(f"  {len(pairs['synergies'])} synergy champs, {len(pairs['counters'])} counter champs -> {pairs_path}")

    # 3. Team Profiles
    print("\nComputing team profiles...")
    team_profiles = compute_team_profiles(series_list)
    team_path = PROCESSED_DIR / "team_profiles.json"
    with open(team_path, "w", encoding="utf-8") as f:
        json.dump(team_profiles, f, indent=2)
    print(f"  {len(team_profiles)} teams -> {team_path}")

    # 4. Player Pools
    print("\nComputing player pools...")
    player_pools = compute_player_pools(series_list)
    player_path = PROCESSED_DIR / "player_pools.json"
    with open(player_path, "w", encoding="utf-8") as f:
        json.dump(player_pools, f, indent=2)
    print(f"  {len(player_pools)} players -> {player_path}")

    # Print top champions
    print("\n--- Top 10 Champions by Presence ---")
    sorted_champs = sorted(champ_stats.values(), key=lambda x: -x["presence"])
    for c in sorted_champs[:10]:
        print(f"  {c['name']:15s} | Presence: {c['presence']:5.1f}% | WR: {c['win_rate']:5.1f}% | Picks: {c['picks']:4d} | Bans: {c['bans']:4d}")

    # Print Cloud9 teams if present
    c9_ids = ["47351", "3990", "46189"]
    print("\n--- Cloud9 Teams ---")
    for cid in c9_ids:
        if cid in team_profiles:
            t = team_profiles[cid]
            print(f"  {t['team_name']:25s} | Games: {t['total_games']:3d} | WR: {t['win_rate']:5.1f}% | Series: {t['series_count']}")

    print(f"\n{'='*60}")
    print("STATISTICS COMPUTATION COMPLETE")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
