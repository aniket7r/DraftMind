"""Combined narrate + TTS endpoint — single round-trip for text and voice."""
import base64
import io
import edge_tts
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from draftmind.models.schemas import NarrationRequest
from draftmind.engine.narrator import generate_narration

router = APIRouter(prefix="/api/draft", tags=["draft"])

VOICE = "en-US-AndrewMultilingualNeural"


class TTSRequest(BaseModel):
    text: str
    tone: str = "analytical"


async def _generate_audio_bytes(text: str, tone: str) -> bytes:
    """Generate TTS audio and return raw bytes."""
    if tone == "excited":
        rate, pitch = "+25%", "+3Hz"
    elif tone == "cautious":
        rate, pitch = "+10%", "+0Hz"
    else:
        rate, pitch = "+18%", "+2Hz"

    communicate = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch)
    buf = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])
    return buf.getvalue()


@router.post("/tts")
async def draft_tts(req: TTSRequest):
    """Standalone TTS endpoint (kept for backwards compat)."""
    audio_bytes = await _generate_audio_bytes(req.text, req.tone)
    return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")


@router.post("/narrate-speak")
async def narrate_speak(req: NarrationRequest):
    """Combined narration + TTS in one call. Returns JSON with base64 audio."""
    # 1. Generate narration text (Gemini)
    current = [
        {
            "sequence_number": a.sequence_number,
            "action_type": a.action_type,
            "team_side": a.team_side,
            "champion_name": a.champion_name,
        }
        for a in req.current_actions
    ]
    narration = generate_narration(
        current_actions=current,
        blue_team_name=req.blue_team_name,
        red_team_name=req.red_team_name,
        win_probability=req.win_probability,
    )

    # 2. Generate TTS audio (edge-tts) — runs immediately after narration
    audio_bytes = await _generate_audio_bytes(
        narration["narrative"], narration["tone"]
    )

    # 3. Return everything in one JSON payload
    return {
        "narrative": narration["narrative"],
        "tone": narration["tone"],
        "audio_base64": base64.b64encode(audio_bytes).decode("ascii"),
    }
