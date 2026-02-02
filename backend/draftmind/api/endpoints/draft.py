"""Draft recommendation and simulation endpoints."""
from fastapi import APIRouter
from draftmind.models.schemas import (
    DraftRecommendRequest, DraftRecommendResponse,
    DraftSimulateRequest, DraftSimulateResponse,
)
from draftmind.engine.recommendation import recommend, simulate_draft

router = APIRouter(prefix="/api/draft", tags=["draft"])


@router.post("/recommend")
def draft_recommend(req: DraftRecommendRequest):
    current = [
        {
            "sequence_number": a.sequence_number,
            "action_type": a.action_type,
            "team_side": a.team_side,
            "champion_name": a.champion_name,
        }
        for a in req.current_actions
    ]

    result = recommend(
        current_actions=current,
        blue_team_id=req.blue_team_id,
        red_team_id=req.red_team_id,
        next_sequence=req.next_action_sequence,
    )
    return result


@router.post("/simulate")
def draft_simulate(req: DraftSimulateRequest):
    result = simulate_draft(
        blue_picks=req.blue_picks,
        red_picks=req.red_picks,
        blue_team_id=req.blue_team_id,
        red_team_id=req.red_team_id,
    )
    return result
