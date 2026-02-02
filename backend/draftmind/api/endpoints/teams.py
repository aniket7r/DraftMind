"""Team data endpoints."""
from fastapi import APIRouter, Query, HTTPException
from draftmind.engine.statistics import get_team_list, get_team_detail

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("")
def list_teams(
    search: str = Query("", description="Search by team name"),
    limit: int = Query(20, ge=1, le=100),
):
    return get_team_list(search=search, limit=limit)


@router.get("/{team_id}")
def get_team(team_id: str):
    result = get_team_detail(team_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Team '{team_id}' not found")
    return result
