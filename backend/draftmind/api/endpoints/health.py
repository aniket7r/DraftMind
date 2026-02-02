"""Health and metadata endpoints."""
from fastapi import APIRouter
from draftmind.config import VERSION
from draftmind.data.data_loader import data_store

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "ok",
        "version": VERSION,
        "data_loaded": data_store.loaded,
        "series_count": data_store.total_series,
        "game_count": data_store.total_games,
        "champion_count": data_store.total_champions,
    }


@router.get("/api/meta")
def meta():
    date_range = data_store.get_date_range()
    return {
        "total_series": data_store.total_series,
        "total_games": data_store.total_games,
        "total_champions": data_store.total_champions,
        "total_teams": len(data_store.team_profiles),
        "total_players": len(data_store.player_pools),
        "date_range": list(date_range),
    }
