"""Analysis endpoints: matchups and pattern detection."""
from fastapi import APIRouter, Query, HTTPException
from draftmind.data.data_loader import data_store
from draftmind.data.champion_metadata import get_champion_image_url
from draftmind.engine.pattern_detector import detect_patterns

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/matchup")
def get_matchup(
    team1: str = Query(..., description="First team ID"),
    team2: str = Query(..., description="Second team ID"),
):
    t1 = data_store.team_profiles.get(team1)
    t2 = data_store.team_profiles.get(team2)

    if not t1:
        raise HTTPException(status_code=404, detail=f"Team '{team1}' not found")
    if not t2:
        raise HTTPException(status_code=404, detail=f"Team '{team2}' not found")

    # Find shared priority picks
    t1_picks = set(list(t1.get("champion_picks", {}).keys())[:15])
    t2_picks = set(list(t2.get("champion_picks", {}).keys())[:15])
    shared_picks = sorted(t1_picks & t2_picks)

    # Find shared priority bans
    t1_bans = set(list(t1.get("champion_bans_by", {}).keys())[:10])
    t2_bans = set(list(t2.get("champion_bans_by", {}).keys())[:10])
    shared_bans = sorted(t1_bans & t2_bans)

    # Generate ban recommendations against each team
    from draftmind.engine.pattern_detector import _generate_ban_recommendations
    ban_recs_vs_t1 = _generate_ban_recommendations(team1, t1)
    ban_recs_vs_t2 = _generate_ban_recommendations(team2, t2)

    return {
        "team1": {
            "team_id": team1,
            "team_name": t1["team_name"],
            "total_games": t1["total_games"],
            "win_rate": t1["win_rate"],
        },
        "team2": {
            "team_id": team2,
            "team_name": t2["team_name"],
            "total_games": t2["total_games"],
            "win_rate": t2["win_rate"],
        },
        "shared_priority_picks": [
            {"champion": c, "image_url": get_champion_image_url(c)} for c in shared_picks
        ],
        "shared_priority_bans": [
            {"champion": c, "image_url": get_champion_image_url(c)} for c in shared_bans
        ],
        "ban_recommendations_vs_team1": ban_recs_vs_t1,
        "ban_recommendations_vs_team2": ban_recs_vs_t2,
    }


@router.get("/patterns/{team_id}")
def get_patterns(team_id: str):
    result = detect_patterns(team_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Team '{team_id}' not found")
    return result
