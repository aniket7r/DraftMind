"""
Load pre-computed JSON data into memory at startup.
All data is served from memory — no runtime database or API dependency.
"""
import json
from pathlib import Path
from draftmind.config import PROCESSED_DIR


class DataStore:
    """In-memory data store for all pre-computed statistics."""

    def __init__(self):
        self.champion_stats: dict = {}
        self.champion_pairs: dict = {}
        self.team_profiles: dict = {}
        self.player_pools: dict = {}
        self.draft_database: dict = {}
        self.loaded = False
        self.total_series = 0
        self.total_games = 0
        self.total_champions = 0

    def load(self, data_dir: Path | None = None):
        """Load all processed data files into memory."""
        d = data_dir or PROCESSED_DIR

        # Champion stats
        champ_path = d / "champion_stats.json"
        if champ_path.exists():
            with open(champ_path, "r", encoding="utf-8") as f:
                self.champion_stats = json.load(f)

        # Champion pairs (synergies & counters)
        pairs_path = d / "champion_pairs.json"
        if pairs_path.exists():
            with open(pairs_path, "r", encoding="utf-8") as f:
                self.champion_pairs = json.load(f)

        # Team profiles
        team_path = d / "team_profiles.json"
        if team_path.exists():
            with open(team_path, "r", encoding="utf-8") as f:
                self.team_profiles = json.load(f)

        # Player pools
        player_path = d / "player_pools.json"
        if player_path.exists():
            with open(player_path, "r", encoding="utf-8") as f:
                self.player_pools = json.load(f)

        # Draft database (for pattern detection)
        db_path = d / "draft_database.json"
        if db_path.exists():
            with open(db_path, "r", encoding="utf-8") as f:
                self.draft_database = json.load(f)
            self.total_series = self.draft_database.get("total_series", 0)
            self.total_games = self.draft_database.get("total_games", 0)

        self.total_champions = len(self.champion_stats)
        self.loaded = bool(self.champion_stats)

    def get_date_range(self) -> tuple[str, str]:
        """Get the date range of the data."""
        if not self.draft_database.get("series"):
            return ("", "")
        dates = []
        for s in self.draft_database["series"]:
            for g in s.get("games", []):
                d = g.get("date", "")
                if d:
                    dates.append(d)
        if not dates:
            return ("", "")
        return (min(dates), max(dates))


# Global singleton
data_store = DataStore()
