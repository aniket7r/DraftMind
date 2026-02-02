"""
Pydantic request/response models for the API.
"""
from pydantic import BaseModel, Field
from typing import Optional


# ─── Health / Meta ────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    data_loaded: bool
    series_count: int
    game_count: int
    champion_count: int


class MetaResponse(BaseModel):
    total_series: int
    total_games: int
    total_champions: int
    total_teams: int
    total_players: int
    date_range: list[str]


# ─── Champions ────────────────────────────────────────────────

class ChampionSummary(BaseModel):
    name: str
    image_url: str
    primary_role: str
    win_rate: float
    pick_rate: float
    ban_rate: float
    presence: float
    games_played: int
    picks: int
    bans: int


class ChampionDetail(BaseModel):
    name: str
    image_url: str
    primary_role: str
    tags: list[str]
    total_games: int
    games_played: int
    wins: int
    win_rate: float
    picks: int
    pick_rate: float
    bans: int
    ban_rate: float
    presence: float
    blue_picks: int
    blue_wins: int
    blue_win_rate: float
    red_picks: int
    red_wins: int
    red_win_rate: float
    avg_kills: float
    avg_deaths: float
    avg_assists: float
    avg_damage: float
    avg_gold: float
    avg_vision: float
    avg_cs: float
    synergies: list[dict] = []
    counters: list[dict] = []
    picked_by_teams: list[dict] = []


# ─── Teams ────────────────────────────────────────────────────

class TeamSummary(BaseModel):
    team_id: str
    team_name: str
    total_games: int
    total_wins: int
    win_rate: float
    series_count: int
    top_picks: list[dict] = []
    top_bans: list[dict] = []


class TeamDetail(BaseModel):
    team_id: str
    team_name: str
    total_games: int
    total_wins: int
    win_rate: float
    blue_games: int
    blue_wins: int
    blue_win_rate: float
    red_games: int
    red_wins: int
    red_win_rate: float
    series_count: int
    champion_picks: dict
    champion_bans_by: dict
    champion_bans_against: dict
    first_pick_blue: dict
    first_ban_blue: dict
    first_ban_red: dict
    player_pools: dict
    recent_results: list[str]


# ─── Draft Recommendation ────────────────────────────────────

class DraftAction(BaseModel):
    sequence_number: int
    action_type: str  # "ban" or "pick"
    team_side: str  # "blue" or "red"
    champion_name: str


class DraftRecommendRequest(BaseModel):
    current_actions: list[DraftAction] = Field(default_factory=list)
    blue_team_id: Optional[str] = None
    red_team_id: Optional[str] = None
    next_action_sequence: Optional[int] = None


class RecommendedChampion(BaseModel):
    champion_name: str
    image_url: str
    score: float
    confidence: str  # "high", "medium", "low"
    reasons: list[str]
    meta_score: float = 0
    team_score: float = 0
    counter_score: float = 0
    composition_score: float = 0


class DraftRecommendResponse(BaseModel):
    next_action: dict  # {sequence_number, action_type, team_side}
    recommendations: list[RecommendedChampion]
    draft_phase: str
    acting_team_id: Optional[str] = None
    acting_team_name: Optional[str] = None


# ─── Draft Simulation ────────────────────────────────────────

class DraftSimulateRequest(BaseModel):
    blue_picks: list[str]  # 5 champion names
    red_picks: list[str]  # 5 champion names
    blue_team_id: Optional[str] = None
    red_team_id: Optional[str] = None


class TeamCompositionAnalysis(BaseModel):
    team_side: str
    team_name: Optional[str] = None
    champions: list[str]
    damage_profile: dict  # {physical: n, magic: n, mixed: n}
    cc_score: float
    scaling_profile: dict  # {early: n, mid: n, late: n}
    engage_count: int
    has_full_role_coverage: bool
    composition_type: str  # "teamfight", "pick", "split", "poke", etc.
    strengths: list[str]
    weaknesses: list[str]
    avg_win_rate: float
    synergy_score: float


class DraftSimulateResponse(BaseModel):
    blue_analysis: TeamCompositionAnalysis
    red_analysis: TeamCompositionAnalysis
    matchup_notes: list[str]
    blue_win_probability: Optional[float] = None


# ─── Analysis ─────────────────────────────────────────────────

class MatchupRequest(BaseModel):
    team1_id: str
    team2_id: str


class MatchupResponse(BaseModel):
    team1: dict
    team2: dict
    shared_priority_picks: list[str]
    shared_priority_bans: list[str]
    ban_recommendations: list[dict]


class PatternResponse(BaseModel):
    team_id: str
    team_name: str
    ban_priorities: dict
    first_pick_preferences: dict
    comfort_picks: list[dict]
    one_trick_alerts: list[dict]
    composition_tendencies: dict
    adaptation_between_games: list[str]


# ─── Draft Narration ─────────────────────────────────────────

class NarrationRequest(BaseModel):
    current_actions: list[DraftAction] = Field(default_factory=list)
    blue_team_id: Optional[str] = None
    red_team_id: Optional[str] = None
    blue_team_name: Optional[str] = None
    red_team_name: Optional[str] = None
    win_probability: Optional[float] = None


class NarrationResponse(BaseModel):
    narrative: str
    tone: str  # "analytical", "excited", "cautious"
