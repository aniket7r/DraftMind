// API Configuration with toggle between real API and mock data
const API_BASE_URL = 'http://localhost:8000';

// Toggle this to switch between real API and mock data
export const USE_MOCK_DATA = false;

export interface TeamTopPick {
  champion_name: string;
  games: number;
  win_rate: number;
}

export interface TeamTopBan {
  champion_name: string;
  count: number;
}

export interface Team {
  id: string;
  name: string;
  acronym: string;
  win_rate: number;
  games_played: number;
  series_played: number;
  top_picks?: TeamTopPick[];
  top_bans?: TeamTopBan[];
}

export interface Champion {
  id: string;
  name: string;
  role: 'top' | 'jungle' | 'mid' | 'bot' | 'support';
  win_rate: number;
  pick_rate: number;
  ban_rate: number;
  image_url: string;
}

export interface DraftAction {
  sequence_number: number;
  action_type: 'ban' | 'pick';
  team_side: 'blue' | 'red';
  champion_name: string;
}

export interface RecommendationRequest {
  current_actions: DraftAction[];
  blue_team_id?: string;
  red_team_id?: string;
  next_action_sequence: number;
}

export interface RecommendationSignals {
  meta: number;
  team: number;
  counter: number;
  composition: number;
}

export interface Recommendation {
  champion_name: string;
  image_url?: string;
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'high' | 'medium' | 'low';
  signals: RecommendationSignals;
  reasons: string[];
  meta_score?: number;
  team_score?: number;
  counter_score?: number;
  composition_score?: number;
}

export interface NextAction {
  sequence_number: number;
  action_type: 'ban' | 'pick';
  team_side: 'blue' | 'red';
}

export interface RecommendationResponse {
  next_action: NextAction;
  recommendations: Recommendation[];
  draft_phase: string;
  acting_team_id: string;
  acting_team_name: string;
}

export interface SimulationRequest {
  blue_picks: string[];
  red_picks: string[];
  blue_team_id?: string;
  red_team_id?: string;
}

export interface DamageProfile {
  physical: number;
  magic: number;
  mixed: number;
}

export interface ScalingProfile {
  early: number;
  mid: number;
  late: number;
}

export interface APICompositionAnalysis {
  team_side: 'blue' | 'red';
  team_name?: string;
  champions: string[];
  damage_profile: DamageProfile;
  cc_score: number;
  scaling_profile: ScalingProfile;
  engage_count: number;
  has_full_role_coverage: boolean;
  composition_type: string;
  composition_description: string;
  strengths: string[];
  weaknesses: string[];
  avg_win_rate: number;
  synergy_score: number;
}

export interface CompositionAnalysis {
  type: string;
  physical_damage: number;
  magic_damage: number;
  cc_rating: number;
  engage_threats: number;
  scaling: 'Early' | 'Mid' | 'Late';
  synergy: number;
  strengths: string[];
  weaknesses: string[];
}

export interface APISimulationResult {
  blue_analysis: APICompositionAnalysis;
  red_analysis: APICompositionAnalysis;
  matchup_notes: string[];
  blue_win_probability: number | null;
}

export interface SimulationResult {
  blue_composition: CompositionAnalysis;
  red_composition: CompositionAnalysis;
  blue_win_probability: number;
  matchup_insights: string[];
}

export interface MetaStats {
  series_count: number;
  games_count: number;
}

export interface NarrationRequest {
  current_actions: DraftAction[];
  blue_team_id?: string;
  red_team_id?: string;
  blue_team_name?: string;
  red_team_name?: string;
  win_probability?: number;
}

export interface NarrationResponse {
  narrative: string;
  tone: 'analytical' | 'excited' | 'cautious';
}

export interface NarrateSpeakResponse extends NarrationResponse {
  audio_base64: string;
}

export interface ChampionSynergy {
  champion_name: string;
  games_together: number;
  win_rate: number;
}

export interface ChampionCounter {
  champion_name: string;
  games_against: number;
  win_rate: number;
}

export interface TeamPick {
  team_id: string;
  team_name: string;
  team_acronym: string;
  games_played: number;
  win_rate: number;
}

export interface ChampionDetail extends Champion {
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_damage: number;
  avg_gold: number;
  avg_vision_score: number;
  avg_cs: number;
  blue_side_picks: number;
  blue_side_win_rate: number;
  red_side_picks: number;
  red_side_win_rate: number;
  synergies: ChampionSynergy[];
  counters: ChampionCounter[];
  picked_by_teams: TeamPick[];
}

export interface TeamChampionPick {
  champion_name: string;
  games: number;
  wins: number;
  win_rate: number;
}

export interface TeamBanData {
  champion_name: string;
  count: number;
  rate: number;
}

export interface PlayerPool {
  player_name: string;
  champions: {
    champion_name: string;
    games: number;
    win_rate: number;
  }[];
}

export interface TeamDetail extends Team {
  wins: number;
  losses: number;
  blue_side_games: number;
  blue_side_win_rate: number;
  red_side_games: number;
  red_side_win_rate: number;
  recent_form: ('W' | 'L')[];
  champion_picks: TeamChampionPick[];
  bans_by_team: TeamBanData[];
  bans_against_team: TeamBanData[];
  player_pools: PlayerPool[];
}

export interface DraftPattern {
  bans_by_team: { champion_name: string; count: number; rate: number }[];
  bans_against_team: { champion_name: string; count: number; rate: number }[];
  first_pick_blue: { champion_name: string; count: number; win_rate: number }[];
  first_pick_red: { champion_name: string; count: number; win_rate: number }[];
  comfort_picks: { champion_name: string; pick_rate: number; win_rate: number; games: number; above_average: boolean }[];
  one_tricks: { player_name: string; champion_name: string; games: number; total_games: number; percentage: number }[];
  composition_tags: { tag: string; percentage: number }[];
  adaptation_notes: string[];
}

export interface MatchupAnalysis {
  team1: { id: string; name: string; acronym: string; win_rate: number; games: number };
  team2: { id: string; name: string; acronym: string; win_rate: number; games: number };
  head_to_head?: { team1_wins: number; team2_wins: number };
  shared_priority_picks: string[];
  shared_priority_bans: string[];
  ban_recommendations_vs_team1: { champion_name: string; reason: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  ban_recommendations_vs_team2: { champion_name: string; reason: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[];
}

// ─── Generic fetch wrapper ───────────────────────────────────

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// ─── Normalizers: Backend → Frontend ─────────────────────────

function normalizeRecommendation(rec: Recommendation): Recommendation {
  return {
    ...rec,
    confidence: rec.confidence.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW',
    signals: rec.signals || {
      meta: rec.meta_score ?? 0,
      team: rec.team_score ?? 0,
      counter: rec.counter_score ?? 0,
      composition: rec.composition_score ?? 0,
    },
  };
}

function normalizeComposition(comp: APICompositionAnalysis): CompositionAnalysis {
  const { early, mid, late } = comp.scaling_profile;
  let scaling: 'Early' | 'Mid' | 'Late' = 'Mid';
  if (early >= mid && early >= late) scaling = 'Early';
  else if (late >= mid && late >= early) scaling = 'Late';

  // Backend returns damage_profile as champion counts (e.g. {physical: 1, magic: 2, mixed: 1})
  // Convert to percentages for the frontend
  const dmg = comp.damage_profile;
  const totalDmg = dmg.physical + dmg.magic + dmg.mixed;

  return {
    type: comp.composition_type,
    physical_damage: totalDmg > 0 ? (dmg.physical / totalDmg) * 100 : 0,
    magic_damage: totalDmg > 0 ? (dmg.magic / totalDmg) * 100 : 0,
    cc_rating: comp.cc_score,
    engage_threats: comp.engage_count,
    scaling,
    synergy: comp.synergy_score,
    strengths: comp.strengths,
    weaknesses: comp.weaknesses,
  };
}

function normalizeSimulationResult(result: APISimulationResult): SimulationResult {
  return {
    blue_composition: normalizeComposition(result.blue_analysis),
    red_composition: normalizeComposition(result.red_analysis),
    blue_win_probability: result.blue_win_probability ?? 0.5,
    matchup_insights: result.matchup_notes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTeamList(raw: any[]): Team[] {
  return raw.map(t => ({
    id: t.team_id,
    name: t.team_name,
    acronym: t.team_name?.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase() || '',
    win_rate: t.win_rate,
    games_played: t.total_games,
    series_played: t.series_count,
    top_picks: (t.top_picks || []).map((p: { champion: string; games: number; wins: number; win_rate: number }) => ({
      champion_name: p.champion,
      games: p.games,
      win_rate: p.win_rate,
    })),
    top_bans: (t.top_bans || []).map((b: { champion: string; count: number }) => ({
      champion_name: b.champion,
      count: b.count,
    })),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeChampionList(raw: any[]): Champion[] {
  return raw.map(c => ({
    id: c.name,
    name: c.name,
    role: c.primary_role || 'mid',
    win_rate: c.win_rate,
    pick_rate: c.pick_rate,
    ban_rate: c.ban_rate,
    image_url: c.image_url,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeChampionDetail(raw: any): ChampionDetail {
  return {
    id: raw.name,
    name: raw.name,
    role: raw.primary_role || 'mid',
    win_rate: raw.win_rate,
    pick_rate: raw.pick_rate,
    ban_rate: raw.ban_rate,
    image_url: raw.image_url,
    avg_kills: raw.avg_kills,
    avg_deaths: raw.avg_deaths,
    avg_assists: raw.avg_assists,
    avg_damage: raw.avg_damage,
    avg_gold: raw.avg_gold,
    avg_vision_score: raw.avg_vision ?? 0,
    avg_cs: raw.avg_cs,
    blue_side_picks: raw.blue_picks,
    blue_side_win_rate: raw.blue_win_rate,
    red_side_picks: raw.red_picks,
    red_side_win_rate: raw.red_win_rate,
    synergies: (raw.synergies || []).map((s: { champion: string; games: number; win_rate: number }) => ({
      champion_name: s.champion,
      games_together: s.games,
      win_rate: s.win_rate,
    })),
    counters: (raw.counters || []).map((c: { champion: string; games: number; win_rate: number }) => ({
      champion_name: c.champion,
      games_against: c.games,
      win_rate: c.win_rate,
    })),
    picked_by_teams: (raw.picked_by_teams || []).map((t: { team_id: string; team_name: string; games: number; win_rate: number }) => ({
      team_id: t.team_id,
      team_name: t.team_name,
      team_acronym: t.team_name?.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase() || '',
      games_played: t.games,
      win_rate: t.win_rate,
    })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTeamDetail(raw: any): TeamDetail {
  // Convert champion_picks dict to array
  const championPicks: TeamChampionPick[] = Object.entries(raw.champion_picks || {}).map(
    ([name, data]: [string, any]) => ({
      champion_name: name,
      games: data.games,
      wins: data.wins,
      win_rate: Math.round((data.wins / Math.max(data.games, 1)) * 1000) / 10,
    })
  );

  // Convert champion_bans_by dict to array
  const bansByTeam: TeamBanData[] = Object.entries(raw.champion_bans_by || {}).map(
    ([name, count]: [string, any]) => ({
      champion_name: name,
      count: count as number,
      rate: Math.round(((count as number) / Math.max(raw.total_games, 1)) * 1000) / 10,
    })
  );

  // Convert champion_bans_against dict to array
  const bansAgainst: TeamBanData[] = Object.entries(raw.champion_bans_against || {}).map(
    ([name, count]: [string, any]) => ({
      champion_name: name,
      count: count as number,
      rate: Math.round(((count as number) / Math.max(raw.total_games, 1)) * 1000) / 10,
    })
  );

  // Convert player_pools dict to array
  const playerPools: PlayerPool[] = Object.entries(raw.player_pools || {}).map(
    ([playerName, champs]: [string, any]) => ({
      player_name: playerName,
      champions: Object.entries(champs).map(([champName, data]: [string, any]) => ({
        champion_name: champName,
        games: data.games,
        win_rate: Math.round((data.wins / Math.max(data.games, 1)) * 1000) / 10,
      })),
    })
  );

  return {
    id: raw.team_id,
    name: raw.team_name,
    acronym: raw.team_name?.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase() || '',
    win_rate: raw.win_rate,
    games_played: raw.total_games,
    series_played: raw.series_count,
    wins: raw.total_wins,
    losses: raw.total_games - raw.total_wins,
    blue_side_games: raw.blue_games,
    blue_side_win_rate: raw.blue_win_rate,
    red_side_games: raw.red_games,
    red_side_win_rate: raw.red_win_rate,
    recent_form: (raw.recent_results || []) as ('W' | 'L')[],
    champion_picks: championPicks,
    bans_by_team: bansByTeam,
    bans_against_team: bansAgainst,
    player_pools: playerPools,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePatterns(raw: any): DraftPattern {
  // Ban priorities
  const banPriorities = raw.ban_priorities || {};
  const bansByTeam = (banPriorities.bans_by_team || []).map((b: any) => ({
    champion_name: b.champion,
    count: b.count,
    rate: b.rate,
  }));
  const bansAgainstTeam = (banPriorities.bans_against_team || []).map((b: any) => ({
    champion_name: b.champion,
    count: b.count,
    rate: b.rate,
  }));

  // First pick preferences
  const fp = raw.first_pick_preferences || {};
  const firstPickBlue = (fp.blue_side_first_picks || []).map((p: any) => ({
    champion_name: p.champion,
    count: p.count,
    win_rate: p.win_rate,
  }));
  const firstPickRed = (fp.red_side_first_picks || []).map((p: any) => ({
    champion_name: p.champion,
    count: p.count,
    win_rate: p.win_rate,
  }));

  // Comfort picks — backend returns percentages as raw numbers (46.2 = 46.2%)
  // Convert to 0-1 range for frontend display
  const comfortPicks = (raw.comfort_picks || []).map((c: any) => ({
    champion_name: c.champion,
    pick_rate: c.pick_rate / 100,
    win_rate: c.win_rate / 100,
    games: c.games,
    above_average: c.above_average,
  }));

  // One tricks
  const oneTricks = (raw.one_trick_alerts || []).map((o: any) => ({
    player_name: o.player_name,
    champion_name: o.champion,
    games: o.games,
    total_games: o.total_games,
    percentage: o.pick_rate / 100,
  }));

  const compTendencies = raw.composition_tendencies || {};
  const tagDist = compTendencies.tag_distribution || {};
  const compositionTags = Object.entries(tagDist).map(([tag, pct]: [string, any]) => ({
    tag,
    percentage: pct as number,
  }));

  return {
    bans_by_team: bansByTeam,
    bans_against_team: bansAgainstTeam,
    first_pick_blue: firstPickBlue,
    first_pick_red: firstPickRed,
    comfort_picks: comfortPicks,
    one_tricks: oneTricks,
    composition_tags: compositionTags,
    adaptation_notes: raw.adaptation_between_games || [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMatchup(raw: any): MatchupAnalysis {
  return {
    team1: {
      id: raw.team1?.team_id,
      name: raw.team1?.team_name,
      acronym: raw.team1?.team_name?.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase() || '',
      win_rate: raw.team1?.win_rate,
      games: raw.team1?.total_games,
    },
    team2: {
      id: raw.team2?.team_id,
      name: raw.team2?.team_name,
      acronym: raw.team2?.team_name?.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase() || '',
      win_rate: raw.team2?.win_rate,
      games: raw.team2?.total_games,
    },
    shared_priority_picks: (raw.shared_priority_picks || []).map((p: any) => p.champion || p),
    shared_priority_bans: (raw.shared_priority_bans || []).map((b: any) => b.champion || b),
    ban_recommendations_vs_team1: (raw.ban_recommendations_vs_team1 || []).map((r: any) => ({
      champion_name: r.champion,
      reason: r.reason,
      priority: (r.priority || 'MEDIUM').toUpperCase(),
    })),
    ban_recommendations_vs_team2: (raw.ban_recommendations_vs_team2 || []).map((r: any) => ({
      champion_name: r.champion,
      reason: r.reason,
      priority: (r.priority || 'MEDIUM').toUpperCase(),
    })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMeta(raw: any): MetaStats {
  return {
    series_count: raw.total_series,
    games_count: raw.total_games,
  };
}

// ─── Health check ────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// ─── API functions with normalization ────────────────────────

export const api = {
  getTeams: async (limit = 56): Promise<Team[]> => {
    const raw = await fetchAPI<any[]>(`/api/teams?limit=${limit}`);
    return normalizeTeamList(raw);
  },

  getChampions: async (limit = 200): Promise<Champion[]> => {
    const raw = await fetchAPI<any[]>(`/api/champions?limit=${limit}`);
    return normalizeChampionList(raw);
  },

  getChampionDetail: async (name: string): Promise<ChampionDetail> => {
    const raw = await fetchAPI<any>(`/api/champions/${encodeURIComponent(name)}`);
    return normalizeChampionDetail(raw);
  },

  getTeamDetail: async (id: string): Promise<TeamDetail> => {
    const raw = await fetchAPI<any>(`/api/teams/${id}`);
    return normalizeTeamDetail(raw);
  },

  getTeamPatterns: async (id: string): Promise<DraftPattern> => {
    const raw = await fetchAPI<any>(`/api/analysis/patterns/${id}`);
    return normalizePatterns(raw);
  },

  getMatchupAnalysis: async (team1: string, team2: string): Promise<MatchupAnalysis> => {
    const raw = await fetchAPI<any>(`/api/analysis/matchup?team1=${team1}&team2=${team2}`);
    return normalizeMatchup(raw);
  },

  getMeta: async (): Promise<MetaStats> => {
    const raw = await fetchAPI<any>('/api/meta');
    return normalizeMeta(raw);
  },

  getRecommendations: async (data: RecommendationRequest): Promise<RecommendationResponse> => {
    const response = await fetchAPI<RecommendationResponse>('/api/draft/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      ...response,
      recommendations: response.recommendations.map(normalizeRecommendation),
    };
  },

  simulateDraft: async (data: SimulationRequest): Promise<SimulationResult> => {
    const response = await fetchAPI<APISimulationResult>('/api/draft/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeSimulationResult(response);
  },

  getNarration: async (data: NarrationRequest): Promise<NarrationResponse> => {
    return fetchAPI<NarrationResponse>('/api/draft/narrate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getNarrationWithAudio: async (data: NarrationRequest): Promise<NarrateSpeakResponse> => {
    return fetchAPI<NarrateSpeakResponse>('/api/draft/narrate-speak', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
