import requests
import time
import json
from pathlib import Path
from draftmind.config import CENTRAL_DATA_URL, FILE_DOWNLOAD_URL, SERIES_STATE_URL, GRID_HEADERS, LOL_TITLE_ID


class GridClient:
    def __init__(self):
        self.central_url = CENTRAL_DATA_URL
        self.ss_url = SERIES_STATE_URL
        self.fd_url = FILE_DOWNLOAD_URL
        self.headers = GRID_HEADERS
        self._request_count = 0

    def _gql(self, url: str, query: str, label: str = "") -> dict | None:
        self._request_count += 1
        if self._request_count % 18 == 0:
            time.sleep(3)
        try:
            resp = requests.post(url, headers=self.headers, json={"query": query}, timeout=30)
        except Exception as e:
            print(f"  NET ERR [{label}]: {e}")
            return None
        if resp.status_code != 200:
            print(f"  ERR [{label}]: HTTP {resp.status_code}")
            return None
        data = resp.json()
        if "errors" in data:
            print(f"  GQL ERR [{label}]: {data['errors'][0]['message'][:150]}")
            return data if data.get("data") else None
        return data

    def get_all_lol_series_ids(self) -> list[str]:
        """Fetch all LoL series IDs from Central Data API with pagination."""
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
            r = self._gql(self.central_url, query, f"series page {page}")
            if not r or not r.get("data"):
                break
            data = r["data"]["allSeries"]
            for edge in data.get("edges", []):
                all_ids.append(edge["node"]["id"])
            total = data.get("totalCount", 0)
            print(f"  Page {page}: {len(all_ids)}/{total} series")
            if not data.get("pageInfo", {}).get("hasNextPage"):
                break
            cursor = data["pageInfo"]["endCursor"]
            time.sleep(3)  # Rate limit: 20 req/min
        return all_ids

    def download_end_state(self, series_id: str) -> dict | None:
        """Download end-state JSON for a series from File Download API."""
        url = f"{self.fd_url}/end-state/grid/series/{series_id}"
        try:
            resp = requests.get(url, headers=self.headers, timeout=60)
            if resp.status_code == 200:
                return resp.json()
            else:
                return None
        except Exception:
            return None

    def get_series_metadata(self, series_ids: list[str]) -> dict:
        """Get team metadata for a batch of series from Central Data API."""
        metadata = {}
        for i in range(0, len(series_ids), 10):
            batch = series_ids[i:i+10]
            for sid in batch:
                query = f"""
                {{
                  series(id: "{sid}") {{
                    id
                    startTimeScheduled
                    tournament {{ id name }}
                    teams {{
                      baseInfo {{ id name nameShortened logoUrl }}
                    }}
                  }}
                }}
                """
                r = self._gql(self.central_url, query, f"meta:{sid}")
                if r and r.get("data", {}).get("series"):
                    metadata[sid] = r["data"]["series"]
                time.sleep(3)
        return metadata
