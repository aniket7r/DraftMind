"""Draft narration endpoint — AI-powered draft commentary."""
from fastapi import APIRouter
from draftmind.models.schemas import NarrationRequest, NarrationResponse
from draftmind.engine.narrator import generate_narration

router = APIRouter(prefix="/api/draft", tags=["draft"])


@router.post("/narrate", response_model=NarrationResponse)
def draft_narrate(req: NarrationRequest):
    current = [
        {
            "sequence_number": a.sequence_number,
            "action_type": a.action_type,
            "team_side": a.team_side,
            "champion_name": a.champion_name,
        }
        for a in req.current_actions
    ]

    result = generate_narration(
        current_actions=current,
        blue_team_name=req.blue_team_name,
        red_team_name=req.red_team_name,
        win_probability=req.win_probability,
    )
    return result
