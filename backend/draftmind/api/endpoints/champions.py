"""Champion data endpoints."""
from fastapi import APIRouter, Query, HTTPException
from draftmind.engine.statistics import get_champion_list, get_champion_detail

router = APIRouter(prefix="/api/champions", tags=["champions"])


@router.get("")
def list_champions(
    sort: str = Query("presence", description="Sort by: presence, win_rate, pick_rate, ban_rate, games_played, name"),
    limit: int = Query(50, ge=1, le=200),
    role: str = Query("", description="Filter by role: top, jungle, mid, bot, support"),
):
    return get_champion_list(sort_by=sort, limit=limit, role=role)


@router.get("/{name}")
def get_champion(name: str):
    result = get_champion_detail(name)
    if not result:
        raise HTTPException(status_code=404, detail=f"Champion '{name}' not found")
    return result
