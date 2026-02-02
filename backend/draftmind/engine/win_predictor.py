"""
Runtime XGBoost win predictor singleton.
Loaded at startup from data/models/win_model.json.
"""
import math
from pathlib import Path

from draftmind.engine.feature_extraction import extract_features
from draftmind.data.data_loader import data_store

# Temperature scaling factor.  T > 1 softens overconfident predictions.
# The model is trained on aggregate stats that include leakage, so raw
# probabilities cluster near 0 and 1.  T=4 maps ~0.02 → ~0.28, ~0.98 → ~0.72.
TEMPERATURE = 4.0


def _temperature_scale(prob: float, temperature: float = TEMPERATURE) -> float:
    """Apply temperature scaling to a probability to reduce overconfidence."""
    prob = max(1e-7, min(1 - 1e-7, prob))  # avoid log(0)
    logit = math.log(prob / (1 - prob))
    scaled_logit = logit / temperature
    return 1.0 / (1.0 + math.exp(-scaled_logit))


class WinPredictor:
    """Singleton XGBoost-based win probability predictor."""

    def __init__(self):
        self.model = None
        self.ready = False

    def load(self, model_path: Path):
        """Load a saved XGBoost model."""
        from xgboost import XGBClassifier
        self.model = XGBClassifier()
        self.model.load_model(str(model_path))
        self.ready = True

    def predict(self, blue_picks: list[str], red_picks: list[str],
                blue_team_id: str | None = None,
                red_team_id: str | None = None) -> float:
        """Return blue-side win probability, clamped to [0.25, 0.75]."""
        if not self.ready or not self.model:
            raise RuntimeError("Model not loaded")

        features = extract_features(
            blue_picks, red_picks,
            blue_team_id, red_team_id,
            data_store.champion_stats,
            data_store.champion_pairs,
            data_store.team_profiles,
        )
        raw_prob = self.model.predict_proba([features])[0][1]  # P(blue wins)
        prob = _temperature_scale(raw_prob)
        return max(0.25, min(0.75, round(prob, 3)))


# Global singleton
win_predictor = WinPredictor()
