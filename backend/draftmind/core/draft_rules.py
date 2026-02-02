"""
LoL Pro Draft Sequence Rules.
Standard fearless draft format used in all pro play.
"""

# Standard LoL draft sequence: 20 actions total
# Each entry: (sequence_number, action_type, team_side)
DRAFT_SEQUENCE = [
    (1, "ban", "blue"),
    (2, "ban", "red"),
    (3, "ban", "blue"),
    (4, "ban", "red"),
    (5, "ban", "blue"),
    (6, "ban", "red"),
    (7, "pick", "blue"),   # B1
    (8, "pick", "red"),    # R1
    (9, "pick", "red"),    # R2
    (10, "pick", "blue"),  # B2
    (11, "pick", "blue"),  # B3
    (12, "pick", "red"),   # R3
    (13, "ban", "red"),
    (14, "ban", "blue"),
    (15, "ban", "red"),
    (16, "ban", "blue"),
    (17, "pick", "red"),   # R4
    (18, "pick", "blue"),  # B4
    (19, "pick", "blue"),  # B5
    (20, "pick", "red"),   # R5
]

# Lookup: sequence_number -> (action_type, team_side)
SEQUENCE_MAP = {seq: (action, side) for seq, action, side in DRAFT_SEQUENCE}

# Draft phases
PHASE_1_BANS = list(range(1, 7))    # Sequences 1-6
PHASE_1_PICKS = list(range(7, 13))   # Sequences 7-12
PHASE_2_BANS = list(range(13, 17))   # Sequences 13-16
PHASE_2_PICKS = list(range(17, 21))  # Sequences 17-20


def get_next_action(current_sequence: int) -> tuple[int, str, str] | None:
    """Get the next draft action given the current sequence number."""
    next_seq = current_sequence + 1
    if next_seq > 20:
        return None
    action_type, side = SEQUENCE_MAP[next_seq]
    return (next_seq, action_type, side)


def get_action_at(sequence: int) -> tuple[str, str]:
    """Get the action type and side for a given sequence number."""
    return SEQUENCE_MAP.get(sequence, ("unknown", "unknown"))


def get_draft_phase(sequence: int) -> str:
    """Get the draft phase name for a given sequence number."""
    if sequence in PHASE_1_BANS:
        return "ban_phase_1"
    elif sequence in PHASE_1_PICKS:
        return "pick_phase_1"
    elif sequence in PHASE_2_BANS:
        return "ban_phase_2"
    elif sequence in PHASE_2_PICKS:
        return "pick_phase_2"
    return "unknown"


def get_available_champions(all_champions: set[str],
                            banned: list[str],
                            picked: list[str]) -> set[str]:
    """Get champions available for selection."""
    used = set(banned) | set(picked)
    return all_champions - used


def validate_draft_state(bans: list[dict], picks: list[dict]) -> list[str]:
    """Validate a draft state. Returns list of error messages."""
    errors = []
    all_champs = set()
    for action in bans + picks:
        champ = action.get("champion", "")
        if champ in all_champs:
            errors.append(f"Duplicate champion: {champ}")
        all_champs.add(champ)
    return errors
