from pydantic import BaseModel
from typing import Optional


class PracticeSession(BaseModel):
    """One real practice attempt (recorded only with actual recognition data).

    result: "correct" | "incorrect" | "unclear"
    - correct   -> detected sign == target sign at Medium+ confidence
    - incorrect -> a DIFFERENT sign was confidently recognized
    - unclear   -> recognition below Medium confidence / no sign (try again)
    """
    target_sign: str
    detected_sign: Optional[str] = None  # None / "UNKNOWN" when unclear
    confidence: float = 0.0              # real model confidence (0-1); 0 when unavailable
    result: str
    attempts: int = 1                    # cumulative attempts for the target in this run


class PracticeSessionOut(PracticeSession):
    id: str