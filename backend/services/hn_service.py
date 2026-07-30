"""
HackerNews (Algolia) data service.

Uses the HN Algolia Search API — completely free, no authentication,
no rate limits for reasonable use, works globally.

API docs: https://hn.algolia.com/api
"""
import httpx
import time
from typing import List

SEARCH_STORIES_URL = "https://hn.algolia.com/api/v1/search"
SEARCH_COMMENTS_URL = "https://hn.algolia.com/api/v1/search"

# Topic detection for chart grouping (replaces Reddit subreddits)
TOPIC_KEYWORDS = {
    "finance":   ["stock", "price", "invest", "market", "shares", "earnings", "revenue",
                  "valuation", "ipo", "dividend", "funding", "billion", "million"],
    "tech":      ["app", "software", "hardware", "update", "feature", "launch", "api",
                  "platform", "code", "developer", "open source", "ai", "model"],
    "reviews":   ["review", "experience", "bought", "tried", "used", "recommend",
                  "rating", "opinion", "verdict", "thoughts", "impressed"],
    "news":      ["news", "announced", "report", "breaking", "official", "statement",
                  "press", "release", "says", "claims", "according"],
    "community": ["love", "hate", "think", "feel", "community", "people", "everyone",
                  "users", "fans", "customers", "employees", "workers"],
}


def _detect_topic(text: str) -> str:
    text_lower = text.lower()
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return topic
    return "general"


def _safe_int(val, default=0) -> int:
    try:
        return int(val or default)
    except Exception:
        return default


def fetch_posts(brand: str, limit: int = 100) -> List[dict]:
    """
    Fetch HackerNews stories mentioning the brand via Algolia Search API.
    Fetches both stories and comments for richer sentiment data.
    """
    posts = []

    # ── Fetch stories ──────────────────────────────────────────
    story_limit = min(limit, 100)
    story_params = {
        "query":       brand,
        "tags":        "story",
        "hitsPerPage": story_limit,
        "numericFilters": "created_at_i>1609459200",  # posts since 2021
    }

    try:
        with httpx.Client(timeout=15, follow_redirects=True) as client:
            resp = client.get(SEARCH_STORIES_URL, params=story_params)
            resp.raise_for_status()
            data = resp.json()

        for hit in data.get("hits", []):
            title    = (hit.get("title")   or "").strip()
            text     = (hit.get("story_text") or "").strip()
            full_text = f"{title} {text}".strip()
            if not full_text:
                continue

            obj_id    = hit.get("objectID", f"hn_s_{len(posts)}")
            points    = _safe_int(hit.get("points"))
            comments  = _safe_int(hit.get("num_comments"))
            created   = _safe_int(hit.get("created_at_i"), int(time.time()))
            url_field = hit.get("url") or f"https://news.ycombinator.com/item?id={obj_id}"

            posts.append({
                "id":           f"hn_{obj_id}",
                "brand":        brand,
                "subreddit":    _detect_topic(full_text),
                "title":        title or full_text[:200],
                "body":         text[:400] if text else "",
                "score":        points,
                "upvote_ratio": 0.8,
                "num_comments": comments,
                "created_utc":  float(created),
                "url":          url_field,
                "is_mock":      False,
                "platform":     "hackernews",
                "author":       hit.get("author", "unknown"),
            })

    except Exception as e:
        print(f"[hn_service] Story fetch error: {e}")

    # ── Fetch comments for richer data ────────────────────────
    remaining = limit - len(posts)
    if remaining > 20:
        comment_params = {
            "query":       brand,
            "tags":        "comment",
            "hitsPerPage": min(remaining, 100),
        }
        try:
            with httpx.Client(timeout=15, follow_redirects=True) as client:
                resp = client.get(SEARCH_COMMENTS_URL, params=comment_params)
                resp.raise_for_status()
                cdata = resp.json()

            for hit in cdata.get("hits", []):
                text    = (hit.get("comment_text") or "").strip()
                if not text or len(text) < 10:
                    continue

                obj_id  = hit.get("objectID", f"hn_c_{len(posts)}")
                created = _safe_int(hit.get("created_at_i"), int(time.time()))

                posts.append({
                    "id":           f"hn_c_{obj_id}",
                    "brand":        brand,
                    "subreddit":    _detect_topic(text),
                    "title":        text[:200],
                    "body":         "",
                    "score":        0,
                    "upvote_ratio": 0.7,
                    "num_comments": 0,
                    "created_utc":  float(created),
                    "url":          f"https://news.ycombinator.com/item?id={obj_id}",
                    "is_mock":      False,
                    "platform":     "hackernews",
                    "author":       hit.get("author", "unknown"),
                })

        except Exception as e:
            print(f"[hn_service] Comment fetch error: {e}")

    print(f"[hn_service] Fetched {len(posts)} posts for '{brand}'")
    return posts[:limit]
