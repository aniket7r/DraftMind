import type { 
  Team, 
  Champion, 
  Recommendation, 
  SimulationResult, 
  MetaStats,
  CompositionAnalysis,
  ChampionDetail,
  ChampionSynergy,
  ChampionCounter,
  TeamPick,
  TeamDetail,
  DraftPattern,
  MatchupAnalysis
} from './api';

// Riot Data Dragon CDN base URL
const DDRAGON_VERSION = '14.1.1';
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

export const getChampionImageUrl = (championName: string): string => {
  // Handle special champion name → Data Dragon key mappings
  const SPECIAL_KEYS: Record<string, string> = {
    'Wukong': 'MonkeyKing',
    "Kai'Sa": 'Kaisa',
    "Kha'Zix": 'Khazix',
    "Cho'Gath": 'Chogath',
    "Vel'Koz": 'Velkoz',
    "Rek'Sai": 'RekSai',
    "Kog'Maw": 'KogMaw',
    "Bel'Veth": 'Belveth',
    "K'Sante": 'KSante',
    'Renata Glasc': 'Renata',
    'Nunu & Willump': 'Nunu',
  };

  if (SPECIAL_KEYS[championName]) {
    return `${DDRAGON_BASE}/img/champion/${SPECIAL_KEYS[championName]}.png`;
  }

  // Default: strip spaces, apostrophes, periods
  const formattedName = championName.replace(/['\s.]/g, '');
  return `${DDRAGON_BASE}/img/champion/${formattedName}.png`;
};

export const getChampionSplashUrl = (championName: string): string => {
  const SPECIAL_KEYS: Record<string, string> = {
    'Wukong': 'MonkeyKing',
    "Kai'Sa": 'Kaisa',
    "Kha'Zix": 'Khazix',
    "Cho'Gath": 'Chogath',
    "Vel'Koz": 'Velkoz',
    "Rek'Sai": 'RekSai',
    "Kog'Maw": 'KogMaw',
    "Bel'Veth": 'Belveth',
    "K'Sante": 'KSante',
    'Renata Glasc': 'Renata',
    'Nunu & Willump': 'Nunu',
  };

  const key = SPECIAL_KEYS[championName] || championName.replace(/['\s.]/g, '');
  return `${DDRAGON_BASE}/img/champion/splash/${key}_0.jpg`;
};

// Base mock teams data (will be enhanced with top picks/bans)
const baseTeams = [
  { id: '47351', name: 'Cloud9 Kia', acronym: 'C9', win_rate: 0.68, games_played: 47, series_played: 23 },
  { id: '340', name: 'T1', acronym: 'T1', win_rate: 0.75, games_played: 52, series_played: 26 },
  { id: '341', name: 'Gen.G', acronym: 'GEN', win_rate: 0.72, games_played: 48, series_played: 24 },
  { id: '342', name: 'JD Gaming', acronym: 'JDG', win_rate: 0.71, games_played: 45, series_played: 22 },
  { id: '343', name: 'Bilibili Gaming', acronym: 'BLG', win_rate: 0.69, games_played: 44, series_played: 21 },
  { id: '344', name: 'Weibo Gaming', acronym: 'WBG', win_rate: 0.65, games_played: 42, series_played: 20 },
  { id: '345', name: 'G2 Esports', acronym: 'G2', win_rate: 0.64, games_played: 40, series_played: 19 },
  { id: '346', name: 'Fnatic', acronym: 'FNC', win_rate: 0.62, games_played: 38, series_played: 18 },
  { id: '347', name: 'Team Liquid', acronym: 'TL', win_rate: 0.60, games_played: 36, series_played: 17 },
  { id: '348', name: 'NRG', acronym: 'NRG', win_rate: 0.55, games_played: 34, series_played: 16 },
  { id: '349', name: 'FlyQuest', acronym: 'FLY', win_rate: 0.58, games_played: 35, series_played: 17 },
  { id: '350', name: '100 Thieves', acronym: '100T', win_rate: 0.52, games_played: 32, series_played: 15 },
  { id: '351', name: 'Evil Geniuses', acronym: 'EG', win_rate: 0.50, games_played: 30, series_played: 14 },
  { id: '352', name: 'Dignitas', acronym: 'DIG', win_rate: 0.45, games_played: 28, series_played: 13 },
  { id: '353', name: 'Golden Guardians', acronym: 'GG', win_rate: 0.42, games_played: 26, series_played: 12 },
  { id: '354', name: 'Immortals', acronym: 'IMT', win_rate: 0.40, games_played: 24, series_played: 11 },
  { id: '355', name: 'Dplus KIA', acronym: 'DK', win_rate: 0.67, games_played: 43, series_played: 21 },
  { id: '356', name: 'Hanwha Life Esports', acronym: 'HLE', win_rate: 0.63, games_played: 41, series_played: 20 },
  { id: '357', name: 'KT Rolster', acronym: 'KT', win_rate: 0.58, games_played: 37, series_played: 18 },
  { id: '358', name: 'DRX', acronym: 'DRX', win_rate: 0.54, games_played: 35, series_played: 17 },
];

// All League of Legends champions with roles
const championData: { name: string; role: 'top' | 'jungle' | 'mid' | 'bot' | 'support' }[] = [
  // Top laners
  { name: 'Aatrox', role: 'top' },
  { name: 'Camille', role: 'top' },
  { name: 'Darius', role: 'top' },
  { name: 'Fiora', role: 'top' },
  { name: 'Gangplank', role: 'top' },
  { name: 'Gnar', role: 'top' },
  { name: 'Gwen', role: 'top' },
  { name: 'Irelia', role: 'top' },
  { name: 'Jax', role: 'top' },
  { name: 'Jayce', role: 'top' },
  { name: 'Kennen', role: 'top' },
  { name: 'Kled', role: 'top' },
  { name: 'Malphite', role: 'top' },
  { name: 'Mordekaiser', role: 'top' },
  { name: 'Ornn', role: 'top' },
  { name: 'Renekton', role: 'top' },
  { name: 'Riven', role: 'top' },
  { name: 'Rumble', role: 'top' },
  { name: 'Sett', role: 'top' },
  { name: 'Shen', role: 'top' },
  { name: 'Teemo', role: 'top' },
  { name: 'Tryndamere', role: 'top' },
  { name: 'Urgot', role: 'top' },
  { name: 'Volibear', role: 'top' },
  { name: 'Yorick', role: 'top' },
  { name: 'KSante', role: 'top' },
  { name: 'Gragas', role: 'top' },
  { name: 'Cho\'Gath', role: 'top' },
  
  // Junglers
  { name: 'Elise', role: 'jungle' },
  { name: 'Evelynn', role: 'jungle' },
  { name: 'Graves', role: 'jungle' },
  { name: 'Hecarim', role: 'jungle' },
  { name: 'Jarvan IV', role: 'jungle' },
  { name: 'Karthus', role: 'jungle' },
  { name: 'Kayn', role: 'jungle' },
  { name: 'Kha\'Zix', role: 'jungle' },
  { name: 'Kindred', role: 'jungle' },
  { name: 'Lee Sin', role: 'jungle' },
  { name: 'Lillia', role: 'jungle' },
  { name: 'Maokai', role: 'jungle' },
  { name: 'Master Yi', role: 'jungle' },
  { name: 'Nidalee', role: 'jungle' },
  { name: 'Nocturne', role: 'jungle' },
  { name: 'Nunu', role: 'jungle' },
  { name: 'Olaf', role: 'jungle' },
  { name: 'Rek\'Sai', role: 'jungle' },
  { name: 'Rengar', role: 'jungle' },
  { name: 'Sejuani', role: 'jungle' },
  { name: 'Shaco', role: 'jungle' },
  { name: 'Taliyah', role: 'jungle' },
  { name: 'Udyr', role: 'jungle' },
  { name: 'Vi', role: 'jungle' },
  { name: 'Viego', role: 'jungle' },
  { name: 'Warwick', role: 'jungle' },
  { name: 'Wukong', role: 'jungle' },
  { name: 'Xin Zhao', role: 'jungle' },
  { name: 'Zac', role: 'jungle' },
  { name: 'Belveth', role: 'jungle' },
  { name: 'Briar', role: 'jungle' },
  
  // Mid laners
  { name: 'Ahri', role: 'mid' },
  { name: 'Akali', role: 'mid' },
  { name: 'Anivia', role: 'mid' },
  { name: 'Annie', role: 'mid' },
  { name: 'Aurelion Sol', role: 'mid' },
  { name: 'Azir', role: 'mid' },
  { name: 'Cassiopeia', role: 'mid' },
  { name: 'Corki', role: 'mid' },
  { name: 'Diana', role: 'mid' },
  { name: 'Ekko', role: 'mid' },
  { name: 'Fizz', role: 'mid' },
  { name: 'Galio', role: 'mid' },
  { name: 'Kassadin', role: 'mid' },
  { name: 'Katarina', role: 'mid' },
  { name: 'LeBlanc', role: 'mid' },
  { name: 'Lissandra', role: 'mid' },
  { name: 'Lux', role: 'mid' },
  { name: 'Malzahar', role: 'mid' },
  { name: 'Neeko', role: 'mid' },
  { name: 'Orianna', role: 'mid' },
  { name: 'Qiyana', role: 'mid' },
  { name: 'Ryze', role: 'mid' },
  { name: 'Sylas', role: 'mid' },
  { name: 'Syndra', role: 'mid' },
  { name: 'Talon', role: 'mid' },
  { name: 'Twisted Fate', role: 'mid' },
  { name: 'Veigar', role: 'mid' },
  { name: 'Vel\'Koz', role: 'mid' },
  { name: 'Viktor', role: 'mid' },
  { name: 'Vladimir', role: 'mid' },
  { name: 'Xerath', role: 'mid' },
  { name: 'Yasuo', role: 'mid' },
  { name: 'Yone', role: 'mid' },
  { name: 'Zed', role: 'mid' },
  { name: 'Zoe', role: 'mid' },
  { name: 'Hwei', role: 'mid' },
  { name: 'Naafiri', role: 'mid' },
  
  // Bot laners (ADC)
  { name: 'Aphelios', role: 'bot' },
  { name: 'Ashe', role: 'bot' },
  { name: 'Caitlyn', role: 'bot' },
  { name: 'Draven', role: 'bot' },
  { name: 'Ezreal', role: 'bot' },
  { name: 'Jhin', role: 'bot' },
  { name: 'Jinx', role: 'bot' },
  { name: 'Kai\'Sa', role: 'bot' },
  { name: 'Kalista', role: 'bot' },
  { name: 'Kog\'Maw', role: 'bot' },
  { name: 'Lucian', role: 'bot' },
  { name: 'Miss Fortune', role: 'bot' },
  { name: 'Samira', role: 'bot' },
  { name: 'Senna', role: 'bot' },
  { name: 'Sivir', role: 'bot' },
  { name: 'Tristana', role: 'bot' },
  { name: 'Twitch', role: 'bot' },
  { name: 'Varus', role: 'bot' },
  { name: 'Vayne', role: 'bot' },
  { name: 'Xayah', role: 'bot' },
  { name: 'Zeri', role: 'bot' },
  { name: 'Nilah', role: 'bot' },
  { name: 'Smolder', role: 'bot' },
  
  // Supports
  { name: 'Alistar', role: 'support' },
  { name: 'Bard', role: 'support' },
  { name: 'Blitzcrank', role: 'support' },
  { name: 'Brand', role: 'support' },
  { name: 'Braum', role: 'support' },
  { name: 'Janna', role: 'support' },
  { name: 'Karma', role: 'support' },
  { name: 'Leona', role: 'support' },
  { name: 'Lulu', role: 'support' },
  { name: 'Morgana', role: 'support' },
  { name: 'Nami', role: 'support' },
  { name: 'Nautilus', role: 'support' },
  { name: 'Pyke', role: 'support' },
  { name: 'Rakan', role: 'support' },
  { name: 'Rell', role: 'support' },
  { name: 'Renata Glasc', role: 'support' },
  { name: 'Seraphine', role: 'support' },
  { name: 'Sona', role: 'support' },
  { name: 'Soraka', role: 'support' },
  { name: 'Tahm Kench', role: 'support' },
  { name: 'Taric', role: 'support' },
  { name: 'Thresh', role: 'support' },
  { name: 'Yuumi', role: 'support' },
  { name: 'Zilean', role: 'support' },
  { name: 'Zyra', role: 'support' },
  { name: 'Milio', role: 'support' },
];

// Generate mock champions with stats
export const mockChampions: Champion[] = championData.map((champ, index) => ({
  id: String(index + 1),
  name: champ.name,
  role: champ.role,
  win_rate: 0.45 + Math.random() * 0.15, // 45-60% win rate
  pick_rate: 0.02 + Math.random() * 0.15, // 2-17% pick rate
  ban_rate: 0.01 + Math.random() * 0.20, // 1-21% ban rate
  image_url: getChampionImageUrl(champ.name),
}));

// Champion names for team pick/ban generation
const championNames = championData.map(c => c.name);

// Seeded random for consistent team data
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate mock teams with top picks and bans
export const mockTeams: Team[] = baseTeams.map((team, index) => {
  const rand = seededRandom(index + 42);
  const shuffled = [...championNames].sort(() => rand() - 0.5);
  
  const top_picks = shuffled.slice(0, 5).map(name => ({
    champion_name: name,
    games: Math.floor(5 + rand() * 25),
    win_rate: 0.45 + rand() * 0.25,
  }));
  
  const top_bans = shuffled.slice(5, 8).map(name => ({
    champion_name: name,
    count: Math.floor(5 + rand() * 20),
  }));
  
  return { ...team, top_picks, top_bans };
});

// Mock meta stats
export const mockMeta: MetaStats = {
  series_count: 941,
  games_count: 2282,
};

// Generate mock recommendations
export const generateMockRecommendations = (
  currentActions: { champion_name: string }[],
  nextSequence: number
): Recommendation[] => {
  const usedChampions = new Set(currentActions.map(a => a.champion_name));
  const availableChampions = mockChampions.filter(c => !usedChampions.has(c.name));
  
  // Pick 5 random champions for recommendations
  const shuffled = availableChampions.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);
  
  return selected.map((champ, index) => {
    const score = 0.85 - (index * 0.08) + (Math.random() * 0.1 - 0.05);
    const confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 
      score > 0.7 ? 'HIGH' : score > 0.5 ? 'MEDIUM' : 'LOW';
    
    const reasons = [
      `Strong meta pick with ${(champ.win_rate * 100).toFixed(1)}% win rate`,
      `Favorable matchups against opponent's composition`,
      `High synergy with current team picks`,
    ];
    
    if (index === 0) {
      reasons.unshift('Team comfort pick based on historical performance');
    }
    
    return {
      champion_name: champ.name,
      score: Math.max(0.3, Math.min(1, score)),
      confidence,
      signals: {
        meta: 0.3 + Math.random() * 0.6,
        team: 0.3 + Math.random() * 0.6,
        counter: 0.2 + Math.random() * 0.6,
        composition: 0.3 + Math.random() * 0.5,
      },
      reasons: reasons.slice(0, 2 + Math.floor(Math.random() * 2)),
    };
  });
};

// Generate mock simulation result
export const generateMockSimulation = (
  bluePicks: string[],
  redPicks: string[]
): SimulationResult => {
  const compTypes = ['Teamfight', 'Dive', 'Poke', 'Split Push', 'Protect the Carry', 'Pick'];
  const scalings: ('Early' | 'Mid' | 'Late')[] = ['Early', 'Mid', 'Late'];
  
  const generateComp = (picks: string[]): CompositionAnalysis => ({
    type: compTypes[Math.floor(Math.random() * compTypes.length)],
    physical_damage: 30 + Math.random() * 40,
    magic_damage: 30 + Math.random() * 40,
    cc_rating: 1.5 + Math.random() * 2,
    engage_threats: Math.floor(1 + Math.random() * 3),
    scaling: scalings[Math.floor(Math.random() * scalings.length)],
    synergy: 0.4 + Math.random() * 0.5,
    strengths: [
      'Strong teamfight presence',
      'Good objective control',
      'High burst damage',
    ].slice(0, 2 + Math.floor(Math.random() * 2)),
    weaknesses: [
      'Vulnerable to poke',
      'Lacks engage tools',
      'Weak early game',
    ].slice(0, 1 + Math.floor(Math.random() * 2)),
  });
  
  return {
    blue_composition: generateComp(bluePicks),
    red_composition: generateComp(redPicks),
    blue_win_probability: 0.35 + Math.random() * 0.3,
    matchup_insights: [
      'Blue side has stronger teamfight potential',
      'Red side scales better into late game',
      'Key matchup: Top lane will be decisive',
      'Dragon control favors blue side composition',
    ].slice(0, 2 + Math.floor(Math.random() * 3)),
  };
};

// Generate mock champion detail
export const generateMockChampionDetail = (championName: string): ChampionDetail | null => {
  const champion = mockChampions.find(
    c => c.name.toLowerCase() === championName.toLowerCase()
  );
  
  if (!champion) return null;

  // Get other champions for synergies and counters
  const otherChampions = mockChampions.filter(c => c.id !== champion.id);
  const shuffled = otherChampions.sort(() => Math.random() - 0.5);
  
  const synergies: ChampionSynergy[] = shuffled.slice(0, 5).map(c => ({
    champion_name: c.name,
    games_together: Math.floor(50 + Math.random() * 200),
    win_rate: 0.52 + Math.random() * 0.15, // Higher win rates for synergies
  }));
  
  const counters: ChampionCounter[] = shuffled.slice(5, 10).map(c => ({
    champion_name: c.name,
    games_against: Math.floor(30 + Math.random() * 150),
    win_rate: 0.35 + Math.random() * 0.15, // Lower win rates for counters
  }));
  
  const picked_by_teams: TeamPick[] = mockTeams.slice(0, 8).map(team => ({
    team_id: team.id,
    team_name: team.name,
    team_acronym: team.acronym,
    games_played: Math.floor(5 + Math.random() * 30),
    win_rate: 0.4 + Math.random() * 0.35,
  }));

  const totalGames = Math.floor(champion.pick_rate * mockMeta.games_count);
  const blueSidePicks = Math.floor(totalGames * (0.45 + Math.random() * 0.1));
  const redSidePicks = totalGames - blueSidePicks;

  return {
    ...champion,
    avg_kills: 2 + Math.random() * 6,
    avg_deaths: 1.5 + Math.random() * 4,
    avg_assists: 3 + Math.random() * 8,
    avg_damage: 15000 + Math.random() * 20000,
    avg_gold: 10000 + Math.random() * 8000,
    avg_vision_score: 20 + Math.random() * 40,
    avg_cs: 150 + Math.random() * 150,
    blue_side_picks: blueSidePicks,
    blue_side_win_rate: champion.win_rate + (Math.random() * 0.08 - 0.04),
    red_side_picks: redSidePicks,
    red_side_win_rate: champion.win_rate + (Math.random() * 0.08 - 0.04),
    synergies,
    counters,
    picked_by_teams,
  };
};

// Player names for mock data
const playerNames = ['Zeus', 'Oner', 'Faker', 'Gumayusi', 'Keria', 'Chovy', 'Canyon', 'ShowMaker', 'Ruler', 'BeryL'];

// Generate mock team detail
export const generateMockTeamDetail = (teamId: string): TeamDetail | null => {
  const team = mockTeams.find(t => t.id === teamId);
  if (!team) return null;

  const rand = seededRandom(parseInt(teamId) || 42);
  const shuffledChamps = [...mockChampions].sort(() => rand() - 0.5);
  
  const wins = Math.round(team.games_played * team.win_rate);
  const losses = team.games_played - wins;
  
  const blueSideGames = Math.floor(team.games_played * (0.45 + rand() * 0.1));
  const redSideGames = team.games_played - blueSideGames;

  // Generate champion picks
  const champion_picks = shuffledChamps.slice(0, 15).map(c => {
    const games = Math.floor(3 + rand() * 20);
    const winRate = 0.4 + rand() * 0.35;
    return {
      champion_name: c.name,
      games,
      wins: Math.round(games * winRate),
      win_rate: winRate,
    };
  }).sort((a, b) => b.games - a.games);

  // Generate bans by team
  const bans_by_team = shuffledChamps.slice(15, 25).map(c => ({
    champion_name: c.name,
    count: Math.floor(3 + rand() * 15),
    rate: 0.1 + rand() * 0.3,
  })).sort((a, b) => b.count - a.count);

  // Generate bans against team
  const bans_against_team = shuffledChamps.slice(0, 10).map(c => ({
    champion_name: c.name,
    count: Math.floor(5 + rand() * 20),
    rate: 0.15 + rand() * 0.35,
  })).sort((a, b) => b.count - a.count);

  // Generate recent form
  const recent_form: ('W' | 'L')[] = Array.from({ length: 10 }, () => 
    rand() < team.win_rate ? 'W' : 'L'
  );

  // Generate player pools
  const player_pools = playerNames.slice(0, 5).map((name, idx) => ({
    player_name: `${name}`,
    champions: shuffledChamps.slice(idx * 8, idx * 8 + Math.floor(4 + rand() * 6)).map(c => ({
      champion_name: c.name,
      games: Math.floor(3 + rand() * 15),
      win_rate: 0.45 + rand() * 0.25,
    })).sort((a, b) => b.games - a.games),
  }));

  return {
    ...team,
    wins,
    losses,
    blue_side_games: blueSideGames,
    blue_side_win_rate: team.win_rate + (rand() * 0.08 - 0.04),
    red_side_games: redSideGames,
    red_side_win_rate: team.win_rate + (rand() * 0.08 - 0.04),
    recent_form,
    champion_picks,
    bans_by_team,
    bans_against_team,
    player_pools,
  };
};

// Generate mock draft patterns
export const generateMockDraftPatterns = (teamId: string): DraftPattern => {
  const rand = seededRandom(parseInt(teamId) || 42);
  const shuffled = [...mockChampions].sort(() => rand() - 0.5);

  const first_pick_blue = shuffled.slice(0, 5).map(c => ({
    champion_name: c.name,
    count: Math.floor(2 + rand() * 8),
    win_rate: 0.45 + rand() * 0.25,
  }));

  const first_pick_red = shuffled.slice(5, 10).map(c => ({
    champion_name: c.name,
    count: Math.floor(1 + rand() * 6),
    win_rate: 0.45 + rand() * 0.25,
  }));

  const comfort_picks = shuffled.slice(0, 8).map(c => ({
    champion_name: c.name,
    pick_rate: 0.1 + rand() * 0.2,
    win_rate: 0.5 + rand() * 0.2,
    games: Math.floor(5 + rand() * 20),
    above_average: rand() > 0.4,
  }));

  // Generate one-tricks (20% chance per player)
  const one_tricks = playerNames.slice(0, 5)
    .filter(() => rand() < 0.2)
    .map(name => ({
      player_name: name,
      champion_name: shuffled[Math.floor(rand() * 20)].name,
      games: Math.floor(10 + rand() * 10),
      total_games: 20,
      percentage: 0.5 + rand() * 0.3,
    }));

  const composition_tags = [
    { tag: 'Fighter', percentage: 15 + rand() * 20 },
    { tag: 'Mage', percentage: 20 + rand() * 15 },
    { tag: 'Tank', percentage: 15 + rand() * 15 },
    { tag: 'Assassin', percentage: 10 + rand() * 15 },
    { tag: 'Marksman', percentage: 18 + rand() * 5 },
    { tag: 'Support', percentage: 10 + rand() * 10 },
  ];

  const adaptation_notes = [
    'Team tends to pivot to scaling compositions after losing game 1',
    'Frequently swaps ADC priority based on opponent bans',
    'Shows comfort on engage supports after losing early games',
    'Prioritizes comfort picks over meta when behind in series',
  ].slice(0, 2 + Math.floor(rand() * 2));

  const bans_by_team = shuffled.slice(0, 6).map(c => ({
    champion_name: c.name,
    count: Math.floor(5 + rand() * 20),
    rate: 5 + rand() * 25,
  }));

  const bans_against_team = shuffled.slice(3, 9).map(c => ({
    champion_name: c.name,
    count: Math.floor(3 + rand() * 15),
    rate: 3 + rand() * 20,
  }));

  return {
    bans_by_team,
    bans_against_team,
    first_pick_blue,
    first_pick_red,
    comfort_picks,
    one_tricks,
    composition_tags,
    adaptation_notes,
  };
};

// Generate mock matchup analysis
export const generateMockMatchupAnalysis = (team1Id: string, team2Id: string): MatchupAnalysis | null => {
  const team1 = mockTeams.find(t => t.id === team1Id);
  const team2 = mockTeams.find(t => t.id === team2Id);
  
  if (!team1 || !team2) return null;

  const rand = seededRandom(parseInt(team1Id) + parseInt(team2Id));
  const shuffled = [...mockChampions].sort(() => rand() - 0.5);

  const shared_priority_picks = shuffled.slice(0, 4).map(c => c.name);
  const shared_priority_bans = shuffled.slice(10, 14).map(c => c.name);

  const priorities: ('HIGH' | 'MEDIUM' | 'LOW')[] = ['HIGH', 'MEDIUM', 'LOW'];
  const reasons = [
    'High comfort pick with strong win rate',
    'Key engage threat in team compositions',
    'One-trick vulnerability detected',
    'Forces opponent off preferred strategy',
    'Denies key synergy with other picks',
  ];

  const ban_recommendations_vs_team1 = shuffled.slice(0, 4).map((c, i) => ({
    champion_name: c.name,
    reason: reasons[Math.floor(rand() * reasons.length)],
    priority: priorities[Math.min(i, 2)],
  }));

  const ban_recommendations_vs_team2 = shuffled.slice(4, 8).map((c, i) => ({
    champion_name: c.name,
    reason: reasons[Math.floor(rand() * reasons.length)],
    priority: priorities[Math.min(i, 2)],
  }));

  return {
    team1: {
      id: team1.id,
      name: team1.name,
      acronym: team1.acronym,
      win_rate: team1.win_rate,
      games: team1.games_played,
    },
    team2: {
      id: team2.id,
      name: team2.name,
      acronym: team2.acronym,
      win_rate: team2.win_rate,
      games: team2.games_played,
    },
    head_to_head: {
      team1_wins: Math.floor(1 + rand() * 4),
      team2_wins: Math.floor(1 + rand() * 4),
    },
    shared_priority_picks,
    shared_priority_bans,
    ban_recommendations_vs_team1,
    ban_recommendations_vs_team2,
  };
};
