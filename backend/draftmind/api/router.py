"""Top-level API router. Mounts all endpoint sub-routers."""
from fastapi import APIRouter
from draftmind.api.endpoints import health, champions, teams, draft, analysis, narrator, tts

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(champions.router)
api_router.include_router(teams.router)
api_router.include_router(draft.router)
api_router.include_router(analysis.router)
api_router.include_router(narrator.router)
api_router.include_router(tts.router)
