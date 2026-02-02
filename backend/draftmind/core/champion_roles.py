"""
Hardcoded champion metadata for LoL draft analysis.
Covers all champions commonly seen in pro play (~170).
Source: Riot Data Dragon + community wiki, current as of patch 14.x.
"""
from dataclasses import dataclass


@dataclass
class ChampionMeta:
    name: str
    primary_role: str  # top, jungle, mid, bot, support
    secondary_role: str  # optional flex role, "" if none
    tags: list[str]  # fighter, tank, mage, assassin, marksman, support, specialist
    damage_type: str  # physical, magic, mixed
    cc_score: int  # 0=none, 1=low, 2=medium, 3=high
    scaling: str  # early, mid, late
    is_engage: bool  # can initiate teamfights


# Master champion database
# Key: champion name as it appears in GRID data (case-sensitive)
CHAMPIONS: dict[str, ChampionMeta] = {}

def _add(name, primary_role, secondary_role, tags, damage_type, cc_score, scaling, is_engage):
    CHAMPIONS[name] = ChampionMeta(name, primary_role, secondary_role, tags, damage_type, cc_score, scaling, is_engage)

# ─── Top Laners ───────────────────────────────────────────────
_add("Aatrox", "top", "mid", ["fighter"], "physical", 2, "mid", True)
_add("Camille", "top", "", ["fighter", "assassin"], "mixed", 2, "mid", True)
_add("Cho'Gath", "top", "", ["tank", "mage"], "magic", 3, "mid", False)
_add("Darius", "top", "", ["fighter"], "physical", 2, "early", True)
_add("Dr. Mundo", "top", "jungle", ["tank", "fighter"], "magic", 1, "late", False)
_add("Fiora", "top", "", ["fighter", "assassin"], "physical", 1, "late", False)
_add("Gangplank", "top", "mid", ["fighter", "specialist"], "mixed", 1, "late", False)
_add("Gnar", "top", "", ["fighter", "tank"], "mixed", 3, "mid", True)
_add("Gragas", "top", "jungle", ["fighter", "mage"], "magic", 3, "mid", True)
_add("Gwen", "top", "", ["fighter", "mage"], "magic", 1, "late", False)
_add("Illaoi", "top", "", ["fighter", "tank"], "physical", 1, "mid", False)
_add("Irelia", "top", "mid", ["fighter", "assassin"], "physical", 2, "mid", False)
_add("Jax", "top", "jungle", ["fighter"], "mixed", 1, "late", False)
_add("Jayce", "top", "mid", ["fighter", "marksman"], "physical", 1, "early", False)
_add("K'Sante", "top", "", ["fighter", "tank"], "mixed", 3, "mid", True)
_add("Kennen", "top", "", ["mage", "fighter"], "magic", 3, "mid", True)
_add("Kled", "top", "", ["fighter"], "physical", 2, "early", True)
_add("Malphite", "top", "", ["tank", "mage"], "magic", 3, "mid", True)
_add("Mordekaiser", "top", "", ["fighter", "mage"], "magic", 1, "mid", False)
_add("Nasus", "top", "", ["fighter", "tank"], "physical", 2, "late", False)
_add("Olaf", "top", "jungle", ["fighter"], "physical", 1, "early", False)
_add("Ornn", "top", "", ["tank"], "magic", 3, "mid", True)
_add("Poppy", "top", "jungle", ["tank", "fighter"], "physical", 3, "mid", True)
_add("Renekton", "top", "", ["fighter"], "physical", 2, "early", True)
_add("Rengar", "top", "jungle", ["assassin", "fighter"], "physical", 1, "mid", False)
_add("Riven", "top", "", ["fighter", "assassin"], "physical", 2, "mid", False)
_add("Rumble", "top", "mid", ["mage", "fighter"], "magic", 1, "mid", False)
_add("Sett", "top", "support", ["fighter", "tank"], "physical", 2, "early", True)
_add("Shen", "top", "support", ["tank"], "mixed", 2, "mid", True)
_add("Singed", "top", "", ["tank", "mage"], "magic", 2, "mid", True)
_add("Sion", "top", "", ["tank"], "physical", 3, "mid", True)
_add("Tahm Kench", "top", "support", ["tank", "support"], "magic", 3, "mid", False)
_add("Trundle", "top", "jungle", ["fighter", "tank"], "physical", 1, "mid", False)
_add("Tryndamere", "top", "", ["fighter", "assassin"], "physical", 0, "late", False)
_add("Urgot", "top", "", ["fighter", "tank"], "physical", 2, "mid", False)
_add("Volibear", "top", "jungle", ["fighter", "tank"], "mixed", 2, "early", True)
_add("Yasuo", "mid", "top", ["fighter", "assassin"], "physical", 2, "late", False)
_add("Yone", "mid", "top", ["fighter", "assassin"], "mixed", 2, "late", True)

# ─── Junglers ─────────────────────────────────────────────────
_add("Amumu", "jungle", "support", ["tank", "mage"], "magic", 3, "mid", True)
_add("Bel'Veth", "jungle", "", ["fighter"], "physical", 1, "late", False)
_add("Brand", "mid", "support", ["mage"], "magic", 1, "mid", False)
_add("Briar", "jungle", "", ["fighter", "assassin"], "physical", 2, "mid", True)
_add("Diana", "jungle", "mid", ["mage", "assassin"], "magic", 2, "mid", True)
_add("Ekko", "jungle", "mid", ["assassin", "mage"], "magic", 1, "mid", False)
_add("Elise", "jungle", "", ["mage", "assassin"], "magic", 2, "early", False)
_add("Evelynn", "jungle", "", ["assassin", "mage"], "magic", 1, "mid", False)
_add("Graves", "jungle", "", ["marksman", "fighter"], "physical", 1, "mid", False)
_add("Hecarim", "jungle", "", ["fighter", "tank"], "physical", 2, "mid", True)
_add("Ivern", "jungle", "", ["support", "mage"], "magic", 2, "mid", False)
_add("Jarvan IV", "jungle", "", ["fighter", "tank"], "physical", 3, "early", True)
_add("Karthus", "jungle", "mid", ["mage"], "magic", 1, "late", False)
_add("Kayn", "jungle", "", ["fighter", "assassin"], "physical", 1, "mid", False)
_add("Kha'Zix", "jungle", "", ["assassin"], "physical", 1, "mid", False)
_add("Kindred", "jungle", "", ["marksman"], "physical", 1, "mid", False)
_add("Lee Sin", "jungle", "", ["fighter", "assassin"], "physical", 2, "early", True)
_add("Lillia", "jungle", "top", ["mage", "fighter"], "magic", 2, "mid", False)
_add("Maokai", "jungle", "support", ["tank", "mage"], "magic", 3, "mid", True)
_add("Master Yi", "jungle", "", ["fighter", "assassin"], "physical", 0, "late", False)
_add("Nidalee", "jungle", "", ["mage", "assassin"], "magic", 0, "early", False)
_add("Nocturne", "jungle", "", ["assassin", "fighter"], "physical", 2, "mid", True)
_add("Nunu & Willump", "jungle", "", ["tank", "mage"], "magic", 3, "mid", True)
_add("Rek'Sai", "jungle", "", ["fighter"], "physical", 2, "early", True)
_add("Sejuani", "jungle", "top", ["tank"], "magic", 3, "mid", True)
_add("Shyvana", "jungle", "", ["fighter", "tank"], "magic", 1, "mid", False)
_add("Skarner", "jungle", "", ["fighter", "tank"], "mixed", 3, "mid", True)
_add("Udyr", "jungle", "top", ["fighter", "tank"], "mixed", 2, "mid", True)
_add("Vi", "jungle", "", ["fighter", "assassin"], "physical", 3, "mid", True)
_add("Viego", "jungle", "", ["fighter", "assassin"], "physical", 1, "mid", False)
_add("Warwick", "jungle", "top", ["fighter", "tank"], "mixed", 2, "mid", True)
_add("Wukong", "jungle", "top", ["fighter", "tank"], "physical", 2, "mid", True)
_add("Xin Zhao", "jungle", "", ["fighter", "assassin"], "physical", 2, "early", True)
_add("Zac", "jungle", "", ["tank"], "magic", 3, "mid", True)

# ─── Mid Laners ───────────────────────────────────────────────
_add("Ahri", "mid", "", ["mage", "assassin"], "magic", 2, "mid", False)
_add("Akali", "mid", "top", ["assassin", "mage"], "magic", 1, "mid", False)
_add("Akshan", "mid", "", ["marksman", "assassin"], "physical", 1, "mid", False)
_add("Anivia", "mid", "", ["mage"], "magic", 2, "late", False)
_add("Annie", "mid", "", ["mage"], "magic", 3, "mid", True)
_add("Aurelion Sol", "mid", "", ["mage"], "magic", 2, "late", False)
_add("Aurora", "mid", "top", ["mage", "assassin"], "magic", 2, "mid", False)
_add("Azir", "mid", "", ["mage"], "magic", 2, "late", False)
_add("Cassiopeia", "mid", "", ["mage"], "magic", 2, "late", False)
_add("Corki", "mid", "", ["marksman", "mage"], "magic", 0, "mid", False)
_add("Galio", "mid", "support", ["tank", "mage"], "magic", 3, "mid", True)
_add("Hwei", "mid", "", ["mage"], "magic", 2, "mid", False)
_add("Karma", "mid", "support", ["mage", "support"], "magic", 1, "mid", False)
_add("Kassadin", "mid", "", ["assassin", "mage"], "magic", 1, "late", False)
_add("Katarina", "mid", "", ["assassin", "mage"], "magic", 0, "mid", False)
_add("LeBlanc", "mid", "", ["assassin", "mage"], "magic", 2, "mid", False)
_add("Lissandra", "mid", "", ["mage"], "magic", 3, "mid", True)
_add("Lux", "mid", "support", ["mage"], "magic", 2, "mid", False)
_add("Malzahar", "mid", "", ["mage", "assassin"], "magic", 3, "mid", False)
_add("Naafiri", "mid", "", ["assassin"], "physical", 1, "mid", False)
_add("Neeko", "mid", "support", ["mage"], "magic", 3, "mid", True)
_add("Orianna", "mid", "", ["mage"], "magic", 2, "mid", True)
_add("Qiyana", "mid", "", ["assassin"], "physical", 2, "mid", False)
_add("Ryze", "mid", "", ["mage"], "magic", 1, "mid", False)
_add("Smolder", "mid", "bot", ["mage", "marksman"], "magic", 1, "late", False)
_add("Sylas", "mid", "top", ["mage", "assassin"], "magic", 2, "mid", True)
_add("Syndra", "mid", "", ["mage"], "magic", 2, "mid", False)
_add("Taliyah", "mid", "jungle", ["mage"], "magic", 2, "mid", False)
_add("Talon", "mid", "jungle", ["assassin"], "physical", 1, "mid", False)
_add("Twisted Fate", "mid", "", ["mage"], "magic", 2, "mid", False)
_add("Veigar", "mid", "", ["mage"], "magic", 2, "late", False)
_add("Vel'Koz", "mid", "support", ["mage"], "magic", 2, "mid", False)
_add("Vex", "mid", "", ["mage"], "magic", 2, "mid", True)
_add("Viktor", "mid", "", ["mage"], "magic", 2, "late", False)
_add("Vladimir", "mid", "top", ["mage"], "magic", 1, "late", False)
_add("Xerath", "mid", "support", ["mage"], "magic", 2, "mid", False)
_add("Zed", "mid", "", ["assassin"], "physical", 0, "mid", False)
_add("Ziggs", "mid", "bot", ["mage"], "magic", 1, "mid", False)
_add("Zoe", "mid", "", ["mage"], "magic", 2, "mid", False)

# ─── Bot Laners (ADC) ────────────────────────────────────────
_add("Aphelios", "bot", "", ["marksman"], "physical", 1, "late", False)
_add("Ashe", "bot", "support", ["marksman", "support"], "physical", 3, "mid", True)
_add("Caitlyn", "bot", "", ["marksman"], "physical", 1, "early", False)
_add("Draven", "bot", "", ["marksman"], "physical", 1, "early", False)
_add("Ezreal", "bot", "", ["marksman", "mage"], "mixed", 0, "mid", False)
_add("Jhin", "bot", "", ["marksman", "mage"], "physical", 2, "mid", False)
_add("Jinx", "bot", "", ["marksman"], "physical", 1, "late", False)
_add("Kai'Sa", "bot", "", ["marksman", "assassin"], "mixed", 0, "late", False)
_add("Kalista", "bot", "", ["marksman"], "physical", 1, "mid", True)
_add("Kog'Maw", "bot", "", ["marksman", "mage"], "mixed", 1, "late", False)
_add("Lucian", "bot", "mid", ["marksman"], "physical", 0, "early", False)
_add("Miss Fortune", "bot", "", ["marksman"], "physical", 1, "mid", False)
_add("Nilah", "bot", "", ["fighter", "marksman"], "physical", 1, "mid", True)
_add("Samira", "bot", "", ["marksman", "assassin"], "physical", 1, "mid", True)
_add("Sivir", "bot", "", ["marksman"], "physical", 1, "mid", False)
_add("Tristana", "bot", "mid", ["marksman", "assassin"], "physical", 1, "mid", False)
_add("Twitch", "bot", "", ["marksman", "assassin"], "mixed", 1, "late", False)
_add("Varus", "bot", "mid", ["marksman", "mage"], "mixed", 2, "mid", False)
_add("Vayne", "bot", "top", ["marksman", "assassin"], "physical", 1, "late", False)
_add("Xayah", "bot", "", ["marksman"], "physical", 1, "mid", False)
_add("Zeri", "bot", "", ["marksman"], "physical", 1, "late", False)

# ─── Supports ─────────────────────────────────────────────────
_add("Alistar", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Bard", "support", "", ["mage", "support"], "magic", 3, "mid", True)
_add("Blitzcrank", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Braum", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Janna", "support", "", ["mage", "support"], "magic", 2, "mid", False)
_add("Leona", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Lulu", "support", "", ["mage", "support"], "magic", 2, "mid", False)
_add("Milio", "support", "", ["mage", "support"], "magic", 1, "mid", False)
_add("Morgana", "support", "mid", ["mage", "support"], "magic", 3, "mid", False)
_add("Nami", "support", "", ["mage", "support"], "magic", 3, "mid", False)
_add("Nautilus", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Pantheon", "support", "mid", ["fighter", "assassin"], "physical", 2, "early", True)
_add("Pyke", "support", "", ["assassin", "support"], "physical", 3, "mid", True)
_add("Rakan", "support", "", ["support"], "magic", 3, "mid", True)
_add("Rell", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Renata Glasc", "support", "", ["mage", "support"], "magic", 2, "mid", False)
_add("Seraphine", "support", "mid", ["mage", "support"], "magic", 2, "mid", False)
_add("Sona", "support", "", ["mage", "support"], "magic", 2, "late", False)
_add("Soraka", "support", "", ["mage", "support"], "magic", 1, "mid", False)
_add("Thresh", "support", "", ["tank", "support"], "magic", 3, "mid", True)
_add("Yuumi", "support", "", ["mage", "support"], "magic", 1, "late", False)
_add("Zilean", "support", "mid", ["mage", "support"], "magic", 2, "late", False)
_add("Zyra", "support", "", ["mage", "support"], "magic", 2, "mid", False)

# ─── Flex / Multi-role ────────────────────────────────────────
_add("Heimerdinger", "mid", "bot", ["mage", "specialist"], "magic", 1, "mid", False)
_add("Swain", "support", "mid", ["mage"], "magic", 2, "mid", False)
_add("Teemo", "top", "", ["mage", "specialist"], "magic", 1, "mid", False)
_add("Twisted Fate", "mid", "", ["mage"], "magic", 2, "mid", False)
_add("Zyra", "support", "", ["mage", "support"], "magic", 2, "mid", False)


# ─── Lookup Helpers ───────────────────────────────────────────

def get_champion_meta(name: str) -> ChampionMeta | None:
    """Get metadata for a champion by name. Tries exact match, then case-insensitive."""
    if name in CHAMPIONS:
        return CHAMPIONS[name]
    name_lower = name.lower()
    for k, v in CHAMPIONS.items():
        if k.lower() == name_lower:
            return v
    return None


def get_champions_by_role(role: str) -> list[ChampionMeta]:
    """Get all champions that play a given role (primary or secondary)."""
    return [c for c in CHAMPIONS.values()
            if c.primary_role == role or c.secondary_role == role]


def get_engage_champions() -> list[str]:
    """Get names of all champions that can initiate teamfights."""
    return [c.name for c in CHAMPIONS.values() if c.is_engage]


def get_damage_profile(champion_names: list[str]) -> dict[str, int]:
    """Get damage type distribution for a list of champions."""
    profile = {"physical": 0, "magic": 0, "mixed": 0}
    for name in champion_names:
        meta = get_champion_meta(name)
        if meta:
            profile[meta.damage_type] += 1
    return profile


def get_cc_score(champion_names: list[str]) -> float:
    """Get average CC score for a team composition."""
    scores = []
    for name in champion_names:
        meta = get_champion_meta(name)
        if meta:
            scores.append(meta.cc_score)
    return sum(scores) / len(scores) if scores else 0


def get_scaling_profile(champion_names: list[str]) -> dict[str, int]:
    """Get scaling distribution for a team composition."""
    profile = {"early": 0, "mid": 0, "late": 0}
    for name in champion_names:
        meta = get_champion_meta(name)
        if meta:
            profile[meta.scaling] += 1
    return profile


def has_role_coverage(champion_names: list[str]) -> dict[str, bool]:
    """Check if a team comp covers all 5 roles."""
    roles_filled = set()
    for name in champion_names:
        meta = get_champion_meta(name)
        if meta:
            roles_filled.add(meta.primary_role)
    return {
        "top": "top" in roles_filled,
        "jungle": "jungle" in roles_filled,
        "mid": "mid" in roles_filled,
        "bot": "bot" in roles_filled,
        "support": "support" in roles_filled,
        "complete": len(roles_filled) >= 5,
    }


# Name normalization: GRID data may use slightly different names
# Map common variations to canonical names
NAME_ALIASES = {
    "Nunu": "Nunu & Willump",
    "Nunu &amp; Willump": "Nunu & Willump",
    "Dr Mundo": "Dr. Mundo",
    "Wukong": "Wukong",
    "MonkeyKing": "Wukong",
    "Jarvan": "Jarvan IV",
    "JarvanIV": "Jarvan IV",
    "TwistedFate": "Twisted Fate",
    "MissFortune": "Miss Fortune",
    "TahmKench": "Tahm Kench",
    "AurelionSol": "Aurelion Sol",
    "LeeSin": "Lee Sin",
    "MasterYi": "Master Yi",
    "XinZhao": "Xin Zhao",
    "KogMaw": "Kog'Maw",
    "KhaZix": "Kha'Zix",
    "ChoGath": "Cho'Gath",
    "VelKoz": "Vel'Koz",
    "KSante": "K'Sante",
    "BelVeth": "Bel'Veth",
    "RekSai": "Rek'Sai",
    "RenataGlasc": "Renata Glasc",
}


def normalize_champion_name(name: str) -> str:
    """Normalize a champion name from GRID data to canonical form."""
    if name in CHAMPIONS:
        return name
    if name in NAME_ALIASES:
        return NAME_ALIASES[name]
    # Try stripping spaces/punctuation for matching
    stripped = name.replace("'", "").replace(" ", "").replace(".", "")
    for alias, canonical in NAME_ALIASES.items():
        if alias.replace("'", "").replace(" ", "").replace(".", "") == stripped:
            return canonical
    # Case-insensitive search
    name_lower = name.lower()
    for k in CHAMPIONS:
        if k.lower() == name_lower:
            return k
    return name  # Return as-is if no match


ALL_CHAMPION_NAMES = set(CHAMPIONS.keys())
