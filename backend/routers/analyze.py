from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services import hn_service
from services.reddit_service import _generate_mock_posts, MOCK_SUBREDDITS
from services.sentiment_service import analyze_posts

router = APIRouter(prefix="/api", tags=["sentiment"])


# ── Request / Response Models ─────────────────────────────────

class AnalyzeRequest(BaseModel):
    brand: str
    subreddits: Optional[List[str]] = None
    limit: Optional[int] = 100


class AnalyzeResponse(BaseModel):
    brand: str
    overall: dict
    subreddits: List[dict]
    trend: List[dict]
    keywords: List[dict]
    top_posts: List[dict]
    emotions: dict


# ── Endpoints ─────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_brand(req: AnalyzeRequest):
    """
    Fetch Bluesky posts and run full sentiment analysis.
    Falls back to mock data if Bluesky is unreachable.
    """
    if not req.brand or len(req.brand.strip()) < 1:
        raise HTTPException(status_code=400, detail="Brand name cannot be empty")

    brand = req.brand.strip()
    limit = min(req.limit or 100, 200)

    # Try HackerNews first (free, no auth, global), fall back to mock
    try:
        posts = hn_service.fetch_posts(brand=brand, limit=limit)
        if not posts:
            raise RuntimeError("No posts returned from HackerNews")
    except Exception as e:
        print(f"[analyze] HackerNews failed ({e}), falling back to mock data")
        subreddits = req.subreddits or MOCK_SUBREDDITS
        posts = _generate_mock_posts(brand=brand, subreddits=subreddits, limit=limit)

    results = analyze_posts(posts)

    return {
        "brand": brand,
        **results,
    }


@router.get("/subreddits")
async def get_default_subreddits():
    """Return list of default subreddits."""
    return {"subreddits": MOCK_SUBREDDITS}


@router.get("/health")
async def health_check():
    """Simple health check."""
    return {"status": "ok", "message": "Reddit Sentiment Analyzer API is running"}
