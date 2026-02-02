import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MODEL_DIR = DATA_DIR / "models"

GRID_API_KEY = os.getenv("GRID_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CENTRAL_DATA_URL = "https://api-op.grid.gg/central-data/graphql"
SERIES_STATE_URL = "https://api-op.grid.gg/live-data-feed/series-state/graphql"
FILE_DOWNLOAD_URL = "https://api.grid.gg/file-download"

LOL_TITLE_ID = "3"

GRID_HEADERS = {
    "x-api-key": GRID_API_KEY,
    "Content-Type": "application/json",
}

DATA_DRAGON_VERSION = "14.1.1"
DATA_DRAGON_BASE = f"https://ddragon.leagueoflegends.com/cdn/{DATA_DRAGON_VERSION}"
CHAMPION_IMAGE_URL = f"{DATA_DRAGON_BASE}/img/champion/{{champion_key}}.png"

VERSION = "1.0.0"
