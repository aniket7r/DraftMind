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


SYSTEM_PROMPT = """You are a LIVE esports shoutcaster. ONE sentence only. Max 15 words. End with a hook or question.

STRICT RULE: Your entire response must be ONE short sentence (max 15 words) + a TONE line. Nothing else. No extra sentences.

Style: hype energy, curiosity, intrigue. Esports slang OK. No emojis.

Good examples:
"Azir banned — what are they SO scared of?!"
"THAT'S a galaxy brain pick, but can they pull it off?"
"Jinx locked in and this comp just got DANGEROUS!"
"They deny the Nautilus — what's the counter-plan here?"
"WAIT — is that a flex pick or an ego pick?!"

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

    if latest:
        side_name = blue_name if latest["team_side"] == "blue" else red_name
        lines.append(f"\n## Latest Action (Action #{latest['sequence_number']}/20)")
        lines.append(f"**{side_name}** {'bans' if latest['action_type'] == 'ban' else 'picks'} **{latest['champion_name']}**")

        champ = latest["champion_name"]
        stats = data_store.champion_stats.get(champ, {})
        if stats:
            wr = stats.get("win_rate", 0)
            pr = stats.get("pick_rate", 0)
            presence = stats.get("presence", 0)
            lines.append(f"Champion stats: {wr:.1f}% WR, {pr:.1f}% PR, {presence:.1f}% presence in pro play")

        # Team-specific context
        acting_team_id = None
        if latest["team_side"] == "blue" and blue_team_name:
            for tid, profile in data_store.team_profiles.items():
                if profile.get("team_name") == blue_team_name:
                    acting_team_id = tid
                    break
        elif latest["team_side"] == "red" and red_team_name:
            for tid, profile in data_store.team_profiles.items():
                if profile.get("team_name") == red_team_name:
                    acting_team_id = tid
                    break

        if acting_team_id and acting_team_id in data_store.team_profiles:
            team_data = data_store.team_profiles[acting_team_id]
            champ_picks = team_data.get("champion_picks", {})
            if champ in champ_picks:
                cp = champ_picks[champ]
                games = cp.get("games", 0)
                wins = cp.get("wins", 0)
                team_wr = (wins / games * 100) if games > 0 else 0
                lines.append(f"Team record on {champ}: {wins}W-{games - wins}L ({team_wr:.0f}% WR across {games} games)")

    if win_probability is not None:
        lines.append(f"\nCurrent Win Probability: {blue_name} {win_probability*100:.0f}% — {red_name} {(1-win_probability)*100:.0f}%")

    if recommendations:
        top3 = recommendations[:3]
        alt_names = [r["champion_name"] for r in top3]
        lines.append(f"\nAI's other top recommendations were: {', '.join(alt_names)}")

    return "\n".join(lines)


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

        # Parse tone from last line if present
        tone = "analytical"
        narrative = raw
        lines = raw.split("\n")
        for i in range(len(lines) - 1, max(len(lines) - 3, -1), -1):
            line = lines[i].strip()
            if line.startswith("TONE:"):
                tone = line.replace("TONE:", "").strip().lower()
                if tone not in ("excited", "analytical", "cautious"):
                    tone = "analytical"
                narrative = "\n".join(lines[:i]).strip()
                break

        # Hard cap: keep only the first sentence if LLM was too verbose
        for sep in [". ", "! ", "? "]:
            idx = narrative.find(sep)
            if idx != -1 and idx < len(narrative) - 1:
                narrative = narrative[:idx + 1]
                break

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
        return {"narrative": "Ladies and gentlemen, the draft is about to begin — both teams are locked in and ready to go!", "tone": "excited"}

    latest = current_actions[-1]
    champ = latest["champion_name"]
    side = "Blue" if latest["team_side"] == "blue" else "Red"
    team = blue_team_name if latest["team_side"] == "blue" else red_team_name
    team = team or f"{side} Side"

    stats = data_store.champion_stats.get(champ, {})
    wr = stats.get("win_rate", 0)
    seq = latest.get("sequence_number", len(current_actions))

    if latest["action_type"] == "ban":
        if wr > 52:
            narrative = f"{team} removes {champ} — {wr:.1f}% win rate. What are they afraid of?"
        else:
            narrative = f"{team} bans {champ}. What are they hiding?"
        tone = "cautious"
    else:
        if seq >= 17:
            narrative = f"{team} locks in {champ}! Is THIS the final puzzle piece?"
            tone = "excited"
        elif wr > 52:
            narrative = f"{team} grabs {champ} at {wr:.1f}%! But what does this set up?"
            tone = "excited"
        else:
            narrative = f"{team} picks {champ}. Interesting — where is this draft going?"
            tone = "analytical"

    return {"narrative": narrative, "tone": tone}
