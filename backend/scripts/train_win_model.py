"""
Train XGBoost win prediction model from draft_database.json.
Outputs: data/models/win_model.json

Usage:
    cd backend
    python -m scripts.train_win_model
"""
import sys
import json
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from draftmind.config import PROCESSED_DIR, MODEL_DIR
from draftmind.engine.feature_extraction import extract_features, FEATURE_NAMES


def load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    print("=" * 60)
    print("TRAIN WIN PREDICTION MODEL")
    print("=" * 60)

    # Load data
    db = load_json(PROCESSED_DIR / "draft_database.json")
    champion_stats = load_json(PROCESSED_DIR / "champion_stats.json")
    champion_pairs = load_json(PROCESSED_DIR / "champion_pairs.json")
    team_profiles = load_json(PROCESSED_DIR / "team_profiles.json")

    print(f"Loaded {db['total_games']} games from {db['total_series']} series")

    # Extract features from each game
    X = []
    y = []
    skipped = 0

    for series in db["series"]:
        for game in series["games"]:
            # Extract picks per side
            blue_picks = []
            red_picks = []
            blue_team_id = game.get("blue_team", {}).get("team_id")
            red_team_id = game.get("red_team", {}).get("team_id")

            for action in game["draft_actions"]:
                if action["action_type"] == "pick":
                    if action["team_side"] == "blue":
                        blue_picks.append(action["champion_name"])
                    elif action["team_side"] == "red":
                        red_picks.append(action["champion_name"])

            if len(blue_picks) < 3 or len(red_picks) < 3:
                skipped += 1
                continue

            features = extract_features(
                blue_picks, red_picks,
                blue_team_id, red_team_id,
                champion_stats, champion_pairs, team_profiles,
            )
            X.append(features)
            y.append(1 if game["winner_side"] == "blue" else 0)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)

    print(f"Feature matrix: {X.shape[0]} games x {X.shape[1]} features")
    print(f"Skipped: {skipped} games (incomplete picks)")
    print(f"Blue wins: {y.sum()} ({y.mean()*100:.1f}%)")
    print()

    # Cross-validation
    from sklearn.model_selection import StratifiedKFold
    from xgboost import XGBClassifier

    params = dict(
        max_depth=3,
        n_estimators=150,
        learning_rate=0.05,
        reg_lambda=3.0,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        use_label_encoder=False,
        random_state=42,
    )

    print("5-fold stratified cross-validation...")
    kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fold_accs = []

    for fold, (train_idx, val_idx) in enumerate(kf.split(X, y), 1):
        model = XGBClassifier(**params)
        model.fit(X[train_idx], y[train_idx], verbose=False)
        preds = model.predict(X[val_idx])
        acc = (preds == y[val_idx]).mean()
        fold_accs.append(acc)
        print(f"  Fold {fold}: {acc*100:.1f}% accuracy")

    mean_acc = np.mean(fold_accs)
    print(f"  Mean: {mean_acc*100:.1f}% (+/- {np.std(fold_accs)*100:.1f}%)")
    print()

    # Train final model on all data
    print("Training final model on all data...")
    final_model = XGBClassifier(**params)
    final_model.fit(X, y, verbose=False)

    # Save model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODEL_DIR / "win_model.json"
    final_model.save_model(str(model_path))
    print(f"Model saved to: {model_path}")
    print(f"File size: {model_path.stat().st_size / 1024:.1f} KB")

    # Feature importance
    print("\nTop 15 features by importance:")
    importances = final_model.feature_importances_
    ranked = sorted(zip(FEATURE_NAMES, importances), key=lambda x: -x[1])
    for name, imp in ranked[:15]:
        bar = "#" * int(imp * 200)
        print(f"  {name:25s} {imp:.4f} {bar}")

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
