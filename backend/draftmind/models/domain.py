from dataclasses import dataclass, field
from typing import Optional


@dataclass
class DraftActionRecord:
    sequence_number: int
    action_type: str  # "ban" or "pick"
    team_id: str
    champion_name: str
    champion_id: str


@dataclass
class PlayerRecord:
    player_id: str
    player_name: str
    champion_name: str
    champion_id: str
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    damage_dealt: float = 0
    damage_per_minute: float = 0
    gold_earned: float = 0
    gold_per_minute: float = 0
    vision_score: float = 0
    kda: float = 0


@dataclass
class TeamGameRecord:
    team_id: str
    team_name: str
    side: str  # "blue" or "red"
    won: bool
    players: list[PlayerRecord] = field(default_factory=list)
    total_kills: int = 0
    total_deaths: int = 0
    total_gold: float = 0
    objectives_completed: dict = field(default_factory=dict)


@dataclass
class GameRecord:
    series_id: str
    game_sequence: int
    draft_actions: list[DraftActionRecord] = field(default_factory=list)
    blue_team: Optional[TeamGameRecord] = None
    red_team: Optional[TeamGameRecord] = None
    duration_seconds: float = 0
    winner_side: str = ""
    date: str = ""
    tournament_name: str = ""


@dataclass
class ChampionProfile:
    name: str
    grid_id: str
    total_games: int = 0
    total_wins: int = 0
    total_bans: int = 0
    total_picks: int = 0
    total_available_games: int = 0  # games where this champ could have been picked
    blue_games: int = 0
    blue_wins: int = 0
    red_games: int = 0
    red_wins: int = 0
    avg_kills: float = 0
    avg_deaths: float = 0
    avg_assists: float = 0
    avg_damage: float = 0
    avg_gold: float = 0
    # Synergies: {champion_name: {games: int, wins: int}}
    synergies: dict = field(default_factory=dict)
    # Counters: {champion_name: {games: int, wins: int}}
    counters: dict = field(default_factory=dict)
    # Teams that pick this: {team_id: {games: int, wins: int}}
    picked_by_teams: dict = field(default_factory=dict)


@dataclass
class PlayerPool:
    player_id: str
    player_name: str
    team_id: str
    team_name: str
    champions: dict = field(default_factory=dict)  # {champ_name: {games, wins}}


@dataclass
class TeamProfile:
    team_id: str
    team_name: str
    team_name_short: str = ""
    total_games: int = 0
    total_wins: int = 0
    blue_games: int = 0
    blue_wins: int = 0
    red_games: int = 0
    red_wins: int = 0
    champion_picks: dict = field(default_factory=dict)  # {champ: {games, wins}}
    champion_bans_by: dict = field(default_factory=dict)  # bans this team made: {champ: count}
    champion_bans_against: dict = field(default_factory=dict)  # bans against this team: {champ: count}
    player_pools: dict = field(default_factory=dict)  # {player_name: {champ: {games, wins}}}
    first_pick_blue: dict = field(default_factory=dict)  # {champ: count} when blue side first pick
    first_ban_blue: dict = field(default_factory=dict)  # {champ: count} first ban on blue
    first_ban_red: dict = field(default_factory=dict)  # first ban on red
    recent_results: list = field(default_factory=list)  # list of "W"/"L" strings, most recent first
    tournaments: set = field(default_factory=set)
    logo_url: str = ""
