from __future__ import annotations


def _safe_text(turn: dict) -> str:
    return str(turn.get("text", "") or "").strip()


def _is_open_question(text: str) -> bool:
    lowered = text.lower()
    if not lowered.endswith("?"):
        return False
    starters = ("what", "how", "tell me", "in what way", "can you walk me")
    return lowered.startswith(starters)


def _contains_reflection(text: str) -> bool:
    markers = ("it sounds like", "you feel", "you are feeling", "what i hear is")
    lowered = text.lower()
    return any(marker in lowered for marker in markers)


def run_pipeline(turns: list[dict]) -> dict:
    therapist_turns = [
        t for t in turns if str(t.get("speaker", "")).lower().startswith("therap")
    ]
    client_turns = [
        t for t in turns if str(t.get("speaker", "")).lower().startswith("client")
    ]

    therapist_text = [_safe_text(t) for t in therapist_turns]
    client_text = [_safe_text(t) for t in client_turns]

    open_questions = sum(1 for txt in therapist_text if _is_open_question(txt))
    reflections = sum(1 for txt in therapist_text if _contains_reflection(txt))
    therapist_word_count = sum(len(txt.split()) for txt in therapist_text)
    client_word_count = sum(len(txt.split()) for txt in client_text)

    # Deterministic baseline scores in [1, 5] to provide a stable contract.
    empathy_score = 1 + min(4, reflections)
    partnership_score = 1 + min(4, open_questions)
    talk_ratio = therapist_word_count / max(1, therapist_word_count + client_word_count)

    score_summary = {
        "global_scores": {
            "empathy": empathy_score,
            "partnership": partnership_score,
        },
        "counts": {
            "therapist_turns": len(therapist_turns),
            "client_turns": len(client_turns),
            "open_questions": open_questions,
            "reflections": reflections,
        },
        "talk_ratio": round(talk_ratio, 3),
    }

    score_details = {
        "notes": [
            "Phase 2 baseline uses deterministic heuristics.",
            "Model-assisted scoring and calibration will be layered in subsequent iterations.",
        ],
        "turn_diagnostics": {
            "therapist_sample": therapist_text[:3],
            "client_sample": client_text[:3],
        },
    }

    coaching_summary = (
        "Focus on increasing reflective statements and open questions to strengthen MI-consistent engagement. "
        f"Current session shows {open_questions} open questions and {reflections} reflections."
    )

    return {
        "score_summary": score_summary,
        "score_details": score_details,
        "coaching_summary": coaching_summary,
        "model_version": "phase2-baseline-v1",
    }
