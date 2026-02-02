"""
Parse raw GRID end-state JSONs into structured draft database.
Input: data/raw/series_*.json
Output: data/processed/draft_database.json
"""
import sys
import json
import re
from pathlib import Path
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from draftmind.config import RAW_DIR, PROCESSED_DIR
from draftmind.core.champion_roles import normalize_champion_name

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def parse_duration(iso_duration: str) -> float:
    """Parse ISO 8601 duration (PT28M16.013S) to seconds."""
    if not iso_duration:
        return 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?', iso_duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = float(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


def parse_game(series_id: str, game_data: dict, game_index: int) -> dict | None:
    """Parse a single game from end-state JSON into structured record."""
    if not game_data.get("finished"):
        return None

    draft_actions = game_data.get("draftActions", [])
    if len(draft_actions) < 10:  # Need at least bans to be useful
        return None

    teams = game_data.get("teams", [])
    if len(teams) != 2:
        return None

    # Build team ID -> side mapping
    team_side_map = {}
    team_name_map = {}
    for team in teams:
        team_side_map[str(team["id"])] = team["side"]
        team_name_map[str(team["id"])] = team.get("name", "Unknown")

    # Parse draft actions
    parsed_draft = []
    for da in sorted(draft_actions, key=lambda x: int(x.get("sequenceNumber", 0))):
        seq = int(da.get("sequenceNumber", 0))
        if seq < 1 or seq > 20:
            continue
        drafter_id = str(da.get("drafter", {}).get("id", ""))
        champion_name = da.get("draftable", {}).get("name", "")
        champion_id = da.get("draftable", {}).get("id", "")
        action_type = da.get("type", "")

        if not champion_name or not action_type:
            continue

        champion_name = normalize_champion_name(champion_name)
        side = team_side_map.get(drafter_id, "unknown")

        parsed_draft.append({
            "sequence_number": seq,
            "action_type": action_type,
            "team_id": drafter_id,
            "team_side": side,
            "champion_name": champion_name,
            "champion_id": champion_id,
        })

    if len(parsed_draft) < 10:
        return None

    # Parse teams
    parsed_teams = {}
    for team in teams:
        tid = str(team["id"])
        side = team["side"]

        # Parse players
        players = []
        for p in team.get("players", []):
            char = p.get("character", {})
            champion_name = normalize_champion_name(char.get("name", ""))
            assists = p.get("killAssistsReceived", 0)
            kills = p.get("kills", 0)
            deaths = p.get("deaths", 0)

            players.append({
                "player_id": str(p.get("id", "")),
                "player_name": p.get("name", ""),
                "champion_name": champion_name,
                "champion_id": char.get("id", ""),
                "kills": kills,
                "deaths": deaths,
                "assists": assists,
                "damage_dealt": p.get("damageDealt", 0),
                "damage_per_minute": p.get("damagePerMinute", 0),
                "gold_earned": p.get("totalMoneyEarned", 0),
                "gold_per_minute": p.get("moneyPerMinute", 0),
                "vision_score": p.get("visionScore", 0),
                "kda": p.get("kdaRatio", 0),
                "cs": sum(uk.get("count", 0) for uk in p.get("unitKills", [])
                         if uk.get("unitName") == "minion"),
            })

        # Parse objectives
        objectives = {}
        for obj in team.get("objectives", []):
            obj_type = obj.get("type", "")
            objectives[obj_type] = {
                "count": obj.get("completionCount", 0),
                "first": obj.get("completedFirst", False),
            }

        parsed_teams[side] = {
            "team_id": tid,
            "team_name": team.get("name", ""),
            "side": side,
            "won": team.get("won", False),
            "kills": team.get("kills", 0),
            "deaths": team.get("deaths", 0),
            "total_gold": team.get("totalMoneyEarned", 0),
            "damage_dealt": team.get("damageDealt", 0),
            "vision_score": team.get("visionScore", 0),
            "structures_destroyed": team.get("structuresDestroyed", 0),
            "objectives": objectives,
            "players": players,
        }

    if "blue" not in parsed_teams or "red" not in parsed_teams:
        return None

    duration = parse_duration(game_data.get("duration", ""))
    winner_side = "blue" if parsed_teams["blue"]["won"] else "red"
    patch = game_data.get("titleVersion", {}).get("name", "")
    started_at = game_data.get("startedAt", "")

    return {
        "series_id": series_id,
        "game_sequence": game_index + 1,
        "draft_actions": parsed_draft,
        "blue_team": parsed_teams["blue"],
        "red_team": parsed_teams["red"],
        "duration_seconds": duration,
        "winner_side": winner_side,
        "date": started_at[:10] if started_at else "",
        "patch": patch,
    }


def parse_series(series_id: str, raw_data: dict) -> dict | None:
    """Parse a complete series from end-state JSON."""
    ss = raw_data.get("seriesState", {})
    if not ss.get("finished"):
        return None

    games_data = ss.get("games", [])
    if not games_data:
        return None

    # Series-level teams
    series_teams = {}
    for team in ss.get("teams", []):
        tid = str(team["id"])
        series_teams[tid] = {
            "team_id": tid,
            "team_name": team.get("name", ""),
            "score": team.get("score", 0),
            "won": team.get("won", False),
        }

    # Parse each game
    games = []
    for i, gd in enumerate(games_data):
        game = parse_game(series_id, gd, i)
        if game:
            games.append(game)

    if not games:
        return None

    return {
        "series_id": series_id,
        "format": ss.get("format", ""),
        "teams": series_teams,
        "games": games,
        "total_games": len(games),
        "started_at": ss.get("startedAt", ""),
    }


def main():
    print("=" * 60)
    print("BUILD DRAFT DATABASE")
    print("=" * 60)

    raw_files = sorted(RAW_DIR.glob("series_*.json"))
    raw_files = [f for f in raw_files if f.name != "series_ids.json"]
    print(f"Found {len(raw_files)} raw series files")

    all_series = []
    total_games = 0
    failed = 0
    champion_names_seen = set()

    for i, fp in enumerate(raw_files):
        try:
            with open(fp, "r", encoding="utf-8") as f:
                raw = json.load(f)
            series_id = fp.stem.replace("series_", "")
            result = parse_series(series_id, raw)
            if result:
                all_series.append(result)
                total_games += result["total_games"]
                for game in result["games"]:
                    for da in game["draft_actions"]:
                        champion_names_seen.add(da["champion_name"])
            else:
                failed += 1
        except Exception as e:
            failed += 1
            if i < 5:
                print(f"  Error parsing {fp.name}: {e}")

        if (i + 1) % 100 == 0:
            print(f"  Processed {i+1}/{len(raw_files)} files ({len(all_series)} series, {total_games} games)")

    print(f"\nParsing complete:")
    print(f"  Series: {len(all_series)}")
    print(f"  Games: {total_games}")
    print(f"  Failed: {failed}")
    print(f"  Unique champions: {len(champion_names_seen)}")

    # Save database
    db_path = PROCESSED_DIR / "draft_database.json"
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump({
            "total_series": len(all_series),
            "total_games": total_games,
            "unique_champions": sorted(champion_names_seen),
            "series": all_series,
        }, f)
    print(f"\nSaved to: {db_path}")
    print(f"File size: {db_path.stat().st_size / 1024 / 1024:.1f} MB")

    # Also save series metadata for API use
    metadata = {}
    for s in all_series:
        for tid, team in s["teams"].items():
            if tid not in metadata:
                metadata[tid] = {
                    "team_id": tid,
                    "team_name": team["team_name"],
                    "series_count": 0,
                }
            metadata[tid]["series_count"] += 1

    meta_path = PROCESSED_DIR / "series_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved team metadata to: {meta_path}")

    print(f"\n{'='*60}")
    print("DATABASE BUILD COMPLETE")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
