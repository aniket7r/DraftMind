"""
LLM-powered draft narrator using Google Gemini.
Generates natural language commentary for each draft action.
"""
import google.generativeai as genai
from draftmind.config import GEMINI_API_KEY
from draftmind.data.data_loader import data_store

_model = None


def _get_model():
    global _model
    if _model is None and GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-2.0-flash")
    return _model


SYSTEM_PROMPT = """You are an expert League of Legends esports analyst providing LIVE draft commentary.

RULES:
- Write exactly 2 sentences (25-35 words total)
- First sentence: React to the pick/ban with context
- Second sentence: One key strategic insight or question
- Be concise but insightful. No filler words.
- Esports terminology OK. No emojis.

Good examples:
"T1 locks in Azir with a 54% win rate — signaling a scaling teamfight comp! Can Gen.G punish them early?"

"Cloud9 bans Nautilus, denying a high-presence comfort pick. This opens the door for Thresh."

"Jinx completes a late-game scaling composition with layered CC to enable her. Survive to three items and they win."

Last line must be: TONE:excited OR TONE:analytical OR TONE:cautious"""


def _build_draft_context(
    current_actions: list[dict],
    blue_team_name: str | None,
    red_team_name: str | None,
    recommendations: list[dict] | None = None,
    win_probability: float | None = None,
) -> str:
    blue_name = blue_team_name or "Blue Side"
    red_name = red_team_name or "Red Side"

    blue_bans = [a["champion_name"] for a in current_actions if a["team_side"] == "blue" and a["action_type"] == "ban"]
    red_bans = [a["champion_name"] for a in current_actions if a["team_side"] == "red" and a["action_type"] == "ban"]
    blue_picks = [a["champion_name"] for a in current_actions if a["team_side"] == "blue" and a["action_type"] == "pick"]
    red_picks = [a["champion_name"] for a in current_actions if a["team_side"] == "red" and a["action_type"] == "pick"]

    latest = current_actions[-1] if current_actions else None

    lines = [f"## Draft State"]
    lines.append(f"**{blue_name}** (Blue) vs **{red_name}** (Red)")
    lines.append(f"Blue Bans: {', '.join(blue_bans) if blue_bans else 'None yet'}")
    lines.append(f"Red Bans: {', '.join(red_bans) if red_bans else 'None yet'}")
    lines.append(f"Blue Picks: {', '.join(blue_picks) if blue_picks else 'None yet'}")
    lines.append(f"Red Picks: {', '.join(red_picks) if red_picks else 'None yet'}")

    # Provide composition context for picks
    if blue_picks:
        lines.append(f"\n## Blue Team Composition Analysis")
        lines.append(_get_composition_summary(blue_picks))
    if red_picks:
        lines.append(f"\n## Red Team Composition Analysis")
        lines.append(_get_composition_summary(red_picks))

    if latest:
        side_name = blue_name if latest["team_side"] == "blue" else red_name
        opponent_name = red_name if latest["team_side"] == "blue" else blue_name
        lines.append(f"\n## Latest Action (Action #{latest['sequence_number']}/20)")
        lines.append(f"**{side_name}** {'bans' if latest['action_type'] == 'ban' else 'picks'} **{latest['champion_name']}**")

        champ = latest["champion_name"]
        stats = data_store.champion_stats.get(champ, {})
        if stats:
            wr = stats.get("win_rate", 0)
            pr = stats.get("pick_rate", 0)
            br = stats.get("ban_rate", 0)
            presence = stats.get("presence", 0)
            role = stats.get("primary_role", "unknown")
            lines.append(f"Champion: {champ} ({role.upper()})")
            lines.append(f"Pro stats: {wr:.1f}% win rate, {pr:.1f}% pick rate, {br:.1f}% ban rate, {presence:.1f}% presence")

            # Add tier context
            if wr >= 53:
                lines.append(f"Tier: S-TIER (elite pick in current meta)")
            elif wr >= 51:
                lines.append(f"Tier: A-TIER (strong meta pick)")
            elif wr >= 49:
                lines.append(f"Tier: B-TIER (situationally good)")
            else:
                lines.append(f"Tier: C-TIER (niche/risky pick)")

        # Team-specific context
        acting_team_id = None
        opponent_team_id = None
        if latest["team_side"] == "blue":
            for tid, profile in data_store.team_profiles.items():
                if blue_team_name and profile.get("team_name") == blue_team_name:
                    acting_team_id = tid
                if red_team_name and profile.get("team_name") == red_team_name:
                    opponent_team_id = tid
        else:
            for tid, profile in data_store.team_profiles.items():
                if red_team_name and profile.get("team_name") == red_team_name:
                    acting_team_id = tid
                if blue_team_name and profile.get("team_name") == blue_team_name:
                    opponent_team_id = tid

        if acting_team_id and acting_team_id in data_store.team_profiles:
            team_data = data_store.team_profiles[acting_team_id]
            champ_picks = team_data.get("champion_picks", {})
            if champ in champ_picks:
                cp = champ_picks[champ]
                games = cp.get("games", 0)
                wins = cp.get("wins", 0)
                team_wr = (wins / games * 100) if games > 0 else 0
                lines.append(f"\n## Team History with {champ}")
                lines.append(f"{side_name} record on {champ}: {wins}W-{games - wins}L ({team_wr:.0f}% WR across {games} games)")
                if team_wr > wr + 5:
                    lines.append(f"NOTE: This team performs ABOVE AVERAGE on {champ} (+{team_wr - wr:.0f}% vs global)")
                elif team_wr < wr - 5:
                    lines.append(f"NOTE: This team performs BELOW AVERAGE on {champ} ({team_wr - wr:.0f}% vs global)")

        # For bans, check if it was a target ban against opponent's comfort pick
        if latest["action_type"] == "ban" and opponent_team_id:
            opponent_data = data_store.team_profiles.get(opponent_team_id, {})
            opponent_picks = opponent_data.get("champion_picks", {})
            if champ in opponent_picks:
                op = opponent_picks[champ]
                games = op.get("games", 0)
                wins = op.get("wins", 0)
                opp_wr = (wins / games * 100) if games > 0 else 0
                if games >= 3:
                    lines.append(f"\n## Target Ban Analysis")
                    lines.append(f"This is a TARGET BAN! {opponent_name} has played {champ} {games} times ({opp_wr:.0f}% WR)")
                    if opp_wr > 55:
                        lines.append(f"Smart ban — denying a comfort pick with high win rate")

        # For picks, analyze synergy with existing team picks
        if latest["action_type"] == "pick":
            team_picks = blue_picks if latest["team_side"] == "blue" else red_picks
            enemy_picks = red_picks if latest["team_side"] == "blue" else blue_picks

            if len(team_picks) > 1:
                lines.append(f"\n## Synergy Analysis")
                synergies = _get_synergies(champ, [p for p in team_picks if p != champ])
                if synergies:
                    lines.append(synergies)

            if enemy_picks:
                lines.append(f"\n## Counter Analysis")
                counters = _get_counter_context(champ, enemy_picks)
                if counters:
                    lines.append(counters)

    if win_probability is not None:
        lines.append(f"\n## Win Probability")
        lines.append(f"{blue_name}: {win_probability*100:.0f}% — {red_name}: {(1-win_probability)*100:.0f}%")
        if win_probability > 0.55:
            lines.append(f"Blue side has a significant draft advantage!")
        elif win_probability < 0.45:
            lines.append(f"Red side has a significant draft advantage!")

    if recommendations:
        top3 = recommendations[:3]
        alt_names = [r["champion_name"] for r in top3]
        lines.append(f"\nAI's other top recommendations: {', '.join(alt_names)}")

    return "\n".join(lines)


def _get_composition_summary(picks: list[str]) -> str:
    """Get a brief composition summary based on picks."""
    from draftmind.data.champion_metadata import CHAMPION_METADATA

    damage_types = {"physical": 0, "magic": 0, "mixed": 0}
    roles = []
    cc_heavy = []

    for champ in picks:
        meta = CHAMPION_METADATA.get(champ, {})
        damage_types[meta.get("damage_type", "mixed")] += 1
        roles.append(meta.get("role", "unknown"))
        if meta.get("cc_type") in ["hard", "heavy"]:
            cc_heavy.append(champ)

    summary_parts = []

    # Damage balance
    total = sum(damage_types.values())
    if total > 0:
        phys_pct = damage_types["physical"] / total * 100
        magic_pct = damage_types["magic"] / total * 100
        if phys_pct >= 70:
            summary_parts.append("HEAVY AD composition (armor stacking effective)")
        elif magic_pct >= 70:
            summary_parts.append("HEAVY AP composition (MR stacking effective)")
        else:
            summary_parts.append("Mixed damage profile")

    if cc_heavy:
        summary_parts.append(f"CC threats: {', '.join(cc_heavy)}")

    return " | ".join(summary_parts) if summary_parts else "Composition forming..."


def _get_synergies(champion: str, teammates: list[str]) -> str:
    """Check for known synergies between champion and teammates."""
    synergy_pairs = data_store.champion_pairs
    synergies = []

    for teammate in teammates:
        pair_key = tuple(sorted([champion, teammate]))
        pair_data = synergy_pairs.get(pair_key) or synergy_pairs.get(f"{champion}_{teammate}") or synergy_pairs.get(f"{teammate}_{champion}")

        if pair_data:
            games = pair_data.get("games", 0)
            wr = pair_data.get("win_rate", 0)
            if games >= 5 and wr > 52:
                synergies.append(f"{champion} + {teammate}: {wr:.0f}% WR over {games} games (strong synergy)")
            elif games >= 5 and wr < 48:
                synergies.append(f"{champion} + {teammate}: {wr:.0f}% WR over {games} games (weak synergy)")

    return " | ".join(synergies) if synergies else f"{champion} adds to the team composition"


def _get_counter_context(champion: str, enemies: list[str]) -> str:
    """Analyze how this champion fares against enemy picks."""
    from draftmind.data.champion_metadata import CHAMPION_METADATA

    champ_meta = CHAMPION_METADATA.get(champion, {})
    champ_role = champ_meta.get("role", "unknown")

    insights = []
    for enemy in enemies:
        enemy_meta = CHAMPION_METADATA.get(enemy, {})
        enemy_role = enemy_meta.get("role", "unknown")

        # Same role = likely lane matchup
        if champ_role == enemy_role and champ_role != "unknown":
            insights.append(f"Lane matchup: {champion} vs {enemy} ({champ_role})")

    return " | ".join(insights) if insights else f"No direct lane counters identified yet"


def generate_narration(
    current_actions: list[dict],
    blue_team_name: str | None = None,
    red_team_name: str | None = None,
    recommendations: list[dict] | None = None,
    win_probability: float | None = None,
) -> dict:
    """Generate narrator commentary for the latest draft action."""
    model = _get_model()

    if not model:
        return _fallback_narration(current_actions, blue_team_name, red_team_name)

    if not current_actions:
        return {"narrative": "The draft is about to begin. Both teams are ready.", "tone": "analytical"}

    context = _build_draft_context(
        current_actions, blue_team_name, red_team_name, recommendations, win_probability
    )

    prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\nCast this latest draft action LIVE:"

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Parse tone - can be on its own line OR at end of text
        tone = "analytical"
        narrative = raw

        # Check for TONE: anywhere in the text (usually at end)
        import re
        tone_match = re.search(r'\bTONE:\s*(excited|analytical|cautious)\b', raw, re.IGNORECASE)
        if tone_match:
            tone = tone_match.group(1).lower()
            # Remove the TONE: marker from narrative
            narrative = raw[:tone_match.start()].strip()
            # Also remove any trailing part after TONE:
            after_tone = raw[tone_match.end():].strip()
            if after_tone and not after_tone.startswith("TONE:"):
                narrative = narrative + " " + after_tone if narrative else after_tone

        # Clean up any remaining TONE: references
        narrative = re.sub(r'\bTONE:\s*(excited|analytical|cautious)\b', '', narrative, flags=re.IGNORECASE).strip()

        # Remove any double spaces
        narrative = re.sub(r'\s+', ' ', narrative).strip()

        return {"narrative": narrative, "tone": tone}
    except Exception as e:
        print(f"Gemini API error: {e}")
        return _fallback_narration(current_actions, blue_team_name, red_team_name)


def _fallback_narration(
    current_actions: list[dict],
    blue_team_name: str | None = None,
    red_team_name: str | None = None,
) -> dict:
    """Template-based fallback when Gemini is unavailable."""
    if not current_actions:
        return {"narrative": "The draft begins! Both teams are ready to reveal their strategies.", "tone": "excited"}

    latest = current_actions[-1]
    champ = latest["champion_name"]
    side = "Blue" if latest["team_side"] == "blue" else "Red"
    team = blue_team_name if latest["team_side"] == "blue" else red_team_name
    team = team or f"{side} Side"

    stats = data_store.champion_stats.get(champ, {})
    wr = stats.get("win_rate", 0)
    role = stats.get("primary_role", "unknown")
    seq = latest.get("sequence_number", len(current_actions))

    if latest["action_type"] == "ban":
        if wr > 53:
            narrative = f"{team} bans {champ} — an S-tier {role} at {wr:.1f}% win rate. Respect ban on a meta terror."
            tone = "analytical"
        elif wr > 50:
            narrative = f"{team} removes {champ} from the pool. Target ban or meta denial?"
            tone = "cautious"
        else:
            narrative = f"{team} bans {champ} at {wr:.1f}% WR — must be a comfort pick denial."
            tone = "analytical"
    else:
        if seq >= 17:
            narrative = f"{team} locks {champ} to complete the comp! Final piece of the puzzle."
            tone = "excited"
        elif wr > 53:
            narrative = f"{team} secures {champ} — elite {role} at {wr:.1f}% WR. Statement pick!"
            tone = "excited"
        elif wr > 50:
            narrative = f"{team} picks {champ}, solid {role} choice at {wr:.1f}% WR. Flexible draft."
            tone = "analytical"
        else:
            narrative = f"{team} goes {champ} at {wr:.1f}% WR — comfort pick or hidden tech?"
            tone = "cautious"

    return {"narrative": narrative, "tone": tone}
