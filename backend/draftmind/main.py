"""
DraftMind AI — FastAPI application entry point.
AI-powered LoL draft recommendation tool using GRID esports data.
"""
import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from draftmind.config import VERSION, MODEL_DIR
from draftmind.data.data_loader import data_store
from draftmind.engine.win_predictor import win_predictor
from draftmind.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load data into memory on startup."""
    print(f"DraftMind AI v{VERSION} starting...")
    data_store.load()
    if data_store.loaded:
        print(f"  Data loaded: {data_store.total_series} series, "
              f"{data_store.total_games} games, "
              f"{data_store.total_champions} champions, "
              f"{len(data_store.team_profiles)} teams")
    else:
        print("  WARNING: No processed data found. Run pipeline scripts first.")

    # Load ML win predictor if model exists
    model_path = MODEL_DIR / "win_model.json"
    if model_path.exists():
        win_predictor.load(model_path)
        print(f"  ML win predictor loaded from {model_path}")
    else:
        print("  ML model not found — using heuristic win predictor")
    yield
    print("DraftMind AI shutting down.")


app = FastAPI(
    title="DraftMind AI",
    description="AI-powered LoL draft recommendation engine using GRID esports data",
    version=VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# ── Serve built frontend (production) ──────────────────────────
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the React SPA for any non-API route."""
        file_path = STATIC_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
