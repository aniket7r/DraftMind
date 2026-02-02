"""
Feature extraction for XGBoost win prediction model.
Extracts ~40 aggregate composition features from champion picks and team data.
Shared between training (scripts/train_win_model.py) and runtime (win_predictor.py).
"""
import math
from draftmind.core.champion_roles import (
    get_champion_meta, get_damage_profile, get_cc_score,
    get_scaling_profile, has_role_coverage, get_engage_champions,
)

FEATURE_NAMES = [
    "blue_avg_wr", "red_avg_wr",
    "blue_avg_pick_rate", "red_avg_pick_rate",
    "blue_avg_presence", "red_avg_presence",
    "blue_physical", "red_physical",
    "blue_magic", "red_magic",
    "blue_mixed", "red_mixed",
    "blue_avg_cc", "red_avg_cc",
    "blue_early", "red_early",
    "blue_mid", "red_mid",
    "blue_late", "red_late",
    "blue_engage", "red_engage",
    "blue_role_coverage", "red_role_coverage",
    "blue_dmg_balance", "red_dmg_balance",
    "blue_avg_synergy", "red_avg_synergy",
    "counter_blue_vs_red", "counter_red_vs_blue",
    "blue_team_wr", "red_team_wr",
    "blue_team_games_log", "red_team_games_log",
    "blue_team_affinity", "red_team_affinity",
    "blue_tanks", "red_tanks",
    "blue_assassins", "red_assassins",
]


def _avg_stat(picks: list[str], champion_stats: dict, key: str,
              default: float = 50.0) -> float:
    """Average a stat across picked champions."""
    vals = []
    for c in picks:
        cs = champion_stats.get(c)
        if cs:
            vals.append(cs.get(key, default))
    return sum(vals) / len(vals) if vals else default


def _damage_balance(picks: list[str]) -> float:
    """Return 0-1 damage balance (1 = perfectly balanced phys/magic)."""
    dmg = get_damage_profile(picks)
    total = sum(dmg.values()) or 1
    return 1.0 - abs(dmg["physical"] - dmg["magic"]) / total


def _avg_synergy(picks: list[str], champion_pairs: dict) -> float:
    """Average synergy win rate between all pairs (normalized 0-1)."""
    synergies = champion_pairs.get("synergies", {})
    scores = []
    for i, c1 in enumerate(picks):
        for c2 in picks[i + 1:]:
            pair = synergies.get(c1, {}).get(c2)
            if not pair:
                pair = synergies.get(c2, {}).get(c1)
            if pair and pair.get("games", 0) >= 2:
                scores.append(pair["win_rate"] / 100.0)
    return sum(scores) / len(scores) if scores else 0.5


def _counter_score(my_picks: list[str], opp_picks: list[str],
                   champion_pairs: dict) -> float:
    """Average counter win rate of my_picks vs opp_picks (0-1)."""
    counters = champion_pairs.get("counters", {})
    scores = []
    for mine in my_picks:
        for opp in opp_picks:
            matchup = counters.get(mine, {}).get(opp)
            if matchup and matchup.get("games", 0) >= 2:
                scores.append(matchup["win_rate"] / 100.0)
    return sum(scores) / len(scores) if scores else 0.5


def _team_affinity(picks: list[str], team_id: str | None,
                   team_profiles: dict) -> float:
    """Average affinity of picks for a given team (0-1)."""
    if not team_id:
        return 0.0
    profile = team_profiles.get(team_id)
    if not profile:
        return 0.0
    team_picks = profile.get("champion_picks", {})
    total_games = profile.get("total_games", 1) or 1
    scores = []
    for c in picks:
        cd = team_picks.get(c)
        if cd:
            freq = cd["games"] / total_games
            wr = cd["wins"] / max(cd["games"], 1)
            scores.append(freq * wr)
    return sum(scores) / len(scores) if scores else 0.0


def _tag_count(picks: list[str], tag: str) -> int:
    """Count champions with a specific tag."""
    count = 0
    for c in picks:
        meta = get_champion_meta(c)
        if meta and tag in meta.tags:
            count += 1
    return count


def extract_features(blue_picks: list[str], red_picks: list[str],
                     blue_team_id: str | None, red_team_id: str | None,
                     champion_stats: dict, champion_pairs: dict,
                     team_profiles: dict) -> list[float]:
    """Extract 40 features for win prediction.

    Returns a list of 40 floats in the order defined by FEATURE_NAMES.
    """
    engage_set = set(get_engage_champions())

    # 1-6: Champion stat averages (normalized to 0-1)
    blue_avg_wr = _avg_stat(blue_picks, champion_stats, "win_rate", 50.0) / 100
    red_avg_wr = _avg_stat(red_picks, champion_stats, "win_rate", 50.0) / 100
    blue_avg_pr = _avg_stat(blue_picks, champion_stats, "pick_rate", 10.0) / 100
    red_avg_pr = _avg_stat(red_picks, champion_stats, "pick_rate", 10.0) / 100
    blue_avg_pres = _avg_stat(blue_picks, champion_stats, "presence", 20.0) / 100
    red_avg_pres = _avg_stat(red_picks, champion_stats, "presence", 20.0) / 100

    # 7-12: Damage type counts
    blue_dmg = get_damage_profile(blue_picks)
    red_dmg = get_damage_profile(red_picks)

    # 13-14: CC scores
    blue_cc = get_cc_score(blue_picks)
    red_cc = get_cc_score(red_picks)

    # 15-20: Scaling distribution
    blue_scl = get_scaling_profile(blue_picks)
    red_scl = get_scaling_profile(red_picks)

    # 21-22: Engage count
    blue_eng = sum(1 for c in blue_picks if c in engage_set)
    red_eng = sum(1 for c in red_picks if c in engage_set)

    # 23-24: Role coverage
    blue_roles = has_role_coverage(blue_picks)
    red_roles = has_role_coverage(red_picks)

    # 25-26: Damage balance
    blue_bal = _damage_balance(blue_picks)
    red_bal = _damage_balance(red_picks)

    # 27-28: Synergy
    blue_syn = _avg_synergy(blue_picks, champion_pairs)
    red_syn = _avg_synergy(red_picks, champion_pairs)

    # 29-30: Counter scores
    c_blue_vs_red = _counter_score(blue_picks, red_picks, champion_pairs)
    c_red_vs_blue = _counter_score(red_picks, blue_picks, champion_pairs)

    # 31-34: Team data
    blue_prof = team_profiles.get(blue_team_id or "", {})
    red_prof = team_profiles.get(red_team_id or "", {})
    blue_twr = (blue_prof.get("win_rate", 50.0) / 100) if blue_prof else 0.5
    red_twr = (red_prof.get("win_rate", 50.0) / 100) if red_prof else 0.5
    blue_tg = math.log1p(blue_prof.get("total_games", 0)) / 6.0 if blue_prof else 0.0
    red_tg = math.log1p(red_prof.get("total_games", 0)) / 6.0 if red_prof else 0.0

    # 35-36: Team champion affinity
    blue_aff = _team_affinity(blue_picks, blue_team_id, team_profiles)
    red_aff = _team_affinity(red_picks, red_team_id, team_profiles)

    # 37-40: Tag counts
    blue_tanks = _tag_count(blue_picks, "tank")
    red_tanks = _tag_count(red_picks, "tank")
    blue_assassins = _tag_count(blue_picks, "assassin")
    red_assassins = _tag_count(red_picks, "assassin")

    return [
        blue_avg_wr, red_avg_wr,
        blue_avg_pr, red_avg_pr,
        blue_avg_pres, red_avg_pres,
        blue_dmg["physical"], red_dmg["physical"],
        blue_dmg["magic"], red_dmg["magic"],
        blue_dmg["mixed"], red_dmg["mixed"],
        blue_cc, red_cc,
        blue_scl["early"], red_scl["early"],
        blue_scl["mid"], red_scl["mid"],
        blue_scl["late"], red_scl["late"],
        blue_eng, red_eng,
        1.0 if blue_roles["complete"] else 0.0,
        1.0 if red_roles["complete"] else 0.0,
        blue_bal, red_bal,
        blue_syn, red_syn,
        c_blue_vs_red, c_red_vs_blue,
        blue_twr, red_twr,
        blue_tg, red_tg,
        blue_aff, red_aff,
        blue_tanks, red_tanks,
        blue_assassins, red_assassins,
    ]
