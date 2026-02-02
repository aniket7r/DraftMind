"""
DraftMind AI — FastAPI application entry point.
AI-powered LoL draft recommendation tool using GRID esports data.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
