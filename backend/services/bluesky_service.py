import httpx
import time
from datetime import datetime, timezone
from typing import List

SEARCH_URL = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"

# Map detected keywords to topic "channels" (replaces Reddit's subreddits for grouping)
TOPIC_KEYWORDS = {
    "finance":   ["stock", "price", "invest", "market", "shares", "earnings", "revenue", "valuation", "ipo", "dividend"],
    "tech":      ["app", "software", "hardware", "update", "feature", "launch", "api", "platform", "code", "developer"],
    "reviews":   ["review", "experience", "bought", "tried", "used", "recommend", "rating", "opinion", "verdict"],
    "news":      ["news", "announced", "report", "breaking", "official", "statement", "press", "release"],
    "community": ["love", "hate", "think", "feel", "community", "people", "everyone", "users", "fans", "customers"],
}


def _detect_topic(text: str) -> str:
    """Classify post into a topic channel based on keywords."""
    text_lower = text.lower()
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return topic
    return "general"


def _iso_to_unix(iso_str: str) -> float:
    """Convert ISO 8601 timestamp to Unix epoch."""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.timestamp()
    except Exception:
        return time.time()


def _build_post_url(uri: str, handle: str) -> str:
    """Convert AT URI → public bsky.app URL."""
    post_id = uri.split("/")[-1] if "/" in uri else uri
    return f"https://bsky.app/profile/{handle}/post/{post_id}"


def fetch_posts(brand: str, limit: int = 100) -> List[dict]:
    """
    Search Bluesky for posts mentioning the brand.
    Uses the public API — no authentication required.
    Falls back gracefully if the API is unavailable.
    """
    posts = []
    cursor = None
    headers = {
        "User-Agent": "SentimentAnalyzer/1.0 (brand-sentiment-tool)",
        "Accept": "application/json",
    }

    while len(posts) < limit:
        batch = min(100, limit - len(posts))
        params = {
            "q": brand,
            "limit": batch,
            "sort": "latest",
        }
        if cursor:
            params["cursor"] = cursor

        try:
            with httpx.Client(timeout=15, follow_redirects=True) as client:
                resp = client.get(SEARCH_URL, params=params, headers=headers)
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as e:
            print(f"[bluesky_service] HTTP {e.response.status_code} error from Bluesky API")
            break
        except Exception as e:
            print(f"[bluesky_service] Request failed: {e}")
            break

        raw_posts = data.get("posts", [])
        if not raw_posts:
            print(f"[bluesky_service] No more posts returned (fetched {len(posts)} so far)")
            break

        for p in raw_posts:
            record = p.get("record", {})
            text  = record.get("text", "").strip()
            if not text:
                continue

            author   = p.get("author", {})
            handle   = author.get("handle", "unknown")
            uri      = p.get("uri", "")
            post_id  = uri.split("/")[-1] if "/" in uri else f"bsky_{len(posts)}"

            like_count    = int(p.get("likeCount",   0) or 0)
            reply_count   = int(p.get("replyCount",  0) or 0)
            repost_count  = int(p.get("repostCount", 0) or 0)
            quote_count   = int(p.get("quoteCount",  0) or 0)

            # Engagement score: likes + (reposts * 2) + quotes
            score = like_count + (repost_count * 2) + quote_count

            posts.append({
                "id":           post_id,
                "brand":        brand,
                "subreddit":    _detect_topic(text),  # "subreddit" field reused as topic
                "title":        text,
                "body":         "",
                "score":        score,
                "upvote_ratio": 0.75,  # Bluesky has no downvotes
                "num_comments": reply_count,
                "created_utc":  _iso_to_unix(record.get("createdAt", "")),
                "url":          _build_post_url(uri, handle),
                "is_mock":      False,
                "platform":     "bluesky",
                "author":       handle,
            })

            if len(posts) >= limit:
                break

        # Try to paginate — stop if cursor is unavailable
        cursor = data.get("cursor")
        if not cursor:
            break

    print(f"[bluesky_service] Fetched {len(posts)} posts for '{brand}'")
    return posts
