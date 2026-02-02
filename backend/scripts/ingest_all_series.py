"""
Ingest all LoL series end-state data from GRID API.
Downloads end-state JSON for each series into data/raw/.
Run this first — it takes ~30 minutes.
"""
import sys
import os
import json
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from draftmind.config import (
    CENTRAL_DATA_URL, FILE_DOWNLOAD_URL, GRID_HEADERS, LOL_TITLE_ID, RAW_DIR
)

RAW_DIR.mkdir(parents=True, exist_ok=True)


def get_all_series_ids() -> list[str]:
    """Fetch all LoL series IDs with pagination."""
    all_ids = []
    cursor = None
    page = 0
    while True:
        page += 1
        after_clause = f', after: "{cursor}"' if cursor else ""
        query = f"""
        {{
          allSeries(first: 50, orderBy: StartTimeScheduled, orderDirection: DESC,
                    filter: {{ titleId: "{LOL_TITLE_ID}" }}{after_clause}) {{
            totalCount
            pageInfo {{ hasNextPage endCursor }}
            edges {{
              node {{ id }}
            }}
          }}
        }}
        """
        resp = requests.post(CENTRAL_DATA_URL, headers=GRID_HEADERS,
                             json={"query": query}, timeout=30)
        if resp.status_code != 200:
            print(f"  ERROR page {page}: HTTP {resp.status_code}")
            break
        data = resp.json()
        if "errors" in data:
            print(f"  GQL ERROR: {data['errors'][0]['message'][:150]}")
            break
        series_data = data["data"]["allSeries"]
        for edge in series_data.get("edges", []):
            all_ids.append(edge["node"]["id"])
        total = series_data.get("totalCount", 0)
        has_next = series_data.get("pageInfo", {}).get("hasNextPage", False)
        print(f"  Page {page}: {len(all_ids)}/{total} series IDs collected")
        if not has_next:
            break
        cursor = series_data["pageInfo"]["endCursor"]
        time.sleep(3)  # 20 req/min rate limit
    return all_ids


def download_end_state(series_id: str) -> bool:
    """Download end-state JSON for a single series."""
    out_path = RAW_DIR / f"series_{series_id}.json"
    if out_path.exists():
        return True  # Already downloaded
    url = f"{FILE_DOWNLOAD_URL}/end-state/grid/series/{series_id}"
    try:
        resp = requests.get(url, headers=GRID_HEADERS, timeout=60)
        if resp.status_code == 200:
            data = resp.json()
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f)
            return True
        else:
            return False
    except Exception as e:
        return False


def main():
    print("=" * 60)
    print("GRID Data Ingestion — Downloading all LoL series")
    print("=" * 60)

    # Step 1: Get all series IDs
    print("\nStep 1: Fetching series IDs from Central Data API...")
    series_ids = get_all_series_ids()
    print(f"  Total series IDs: {len(series_ids)}")

    # Save series IDs for reference
    ids_path = RAW_DIR / "series_ids.json"
    with open(ids_path, "w") as f:
        json.dump(series_ids, f)

    # Step 2: Download end-state for each series
    print(f"\nStep 2: Downloading end-state data for {len(series_ids)} series...")

    # Check which are already downloaded
    existing = {p.stem.replace("series_", "") for p in RAW_DIR.glob("series_*.json")
                if p.stem != "series_ids"}
    remaining = [sid for sid in series_ids if sid not in existing]
    print(f"  Already downloaded: {len(existing)}")
    print(f"  Remaining: {len(remaining)}")

    success = len(existing)
    failed = 0
    total = len(series_ids)

    for i, sid in enumerate(remaining):
        ok = download_end_state(sid)
        if ok:
            success += 1
        else:
            failed += 1
        if (i + 1) % 10 == 0 or i == len(remaining) - 1:
            print(f"  Progress: {success}/{total} downloaded, {failed} failed ({i+1}/{len(remaining)} this run)")
        # Rate limit: ~1 per second
        time.sleep(1)

    print(f"\n{'='*60}")
    print(f"INGESTION COMPLETE")
    print(f"  Success: {success}/{total}")
    print(f"  Failed: {failed}")
    print(f"  Saved to: {RAW_DIR}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
