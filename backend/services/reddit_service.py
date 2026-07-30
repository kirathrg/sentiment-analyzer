import random
import time
import math
from typing import List, Optional
import config

try:
    import praw
    PRAW_AVAILABLE = True
except ImportError:
    PRAW_AVAILABLE = False

# ─────────────────────────────────────────────
# Mock data generator (used when USE_MOCK_DATA=true)
# ─────────────────────────────────────────────

MOCK_SUBREDDITS = [
    "technology", "investing", "wallstreetbets",
    "stocks", "news", "business", "entrepreneur"
]

MOCK_TEMPLATES = [
    ("{brand} just released something absolutely incredible — total game changer!", "positive"),
    ("I've been using {brand} for years and it keeps getting better. Highly recommend.", "positive"),
    ("Honestly {brand} exceeded all my expectations this quarter.", "positive"),
    ("The new {brand} update is everything I wanted. Love the team behind it.", "positive"),
    ("{brand} customer support was outstanding, solved my issue in minutes!", "positive"),
    ("Why does everyone hate {brand}? I think they're doing a great job.", "positive"),
    ("{brand} stock is mooning right now. Best decision holding it.", "positive"),
    ("Hot take: {brand} is the most innovative company right now.", "positive"),
    ("Can we appreciate how {brand} handled that situation perfectly?", "positive"),
    ("{brand} just partnered with a major player. Bullish!", "positive"),
    ("{brand} is okay I guess. Nothing special but gets the job done.", "neutral"),
    ("Anyone else using {brand}? What do you think about the new features?", "neutral"),
    ("Comparing {brand} to competitors — they're about on par.", "neutral"),
    ("Not sure how to feel about {brand}'s latest announcement.", "neutral"),
    ("{brand} has some good products but also some misses.", "neutral"),
    ("Is {brand} worth it? Looking for honest opinions here.", "neutral"),
    ("Just switched from {brand} to a competitor. Mixed feelings.", "neutral"),
    ("{brand} has been in the news a lot lately for various reasons.", "neutral"),
    ("What's everyone's take on {brand}'s direction?", "neutral"),
    ("{brand} seems to be pivoting. Time will tell if it works.", "neutral"),
    ("{brand} completely dropped the ball on this one. Massive disappointment.", "negative"),
    ("I'm done with {brand}. Their customer service is absolutely terrible.", "negative"),
    ("How does {brand} keep getting away with this? Shameful practices.", "negative"),
    ("{brand} just lost me as a customer forever. Never again.", "negative"),
    ("The {brand} situation is a disaster and nobody is talking about it.", "negative"),
    ("Tried {brand} for a month. Complete waste of money. 0/10.", "negative"),
    ("{brand} needs to be held accountable. This is unacceptable.", "negative"),
    ("Why is {brand} so overrated? People are blind to how bad they've become.", "negative"),
    ("{brand} has really gone downhill since the leadership change.", "negative"),
    ("Do NOT buy {brand}. Worst purchase decision I ever made.", "negative"),
]


def _generate_mock_posts(brand: str, subreddits: List[str], limit: int) -> List[dict]:
    """Generate realistic-looking mock posts for demo purposes."""
    posts = []
    now = time.time()
    random.seed(hash(brand) % 10000)

    for i in range(limit):
        template, sentiment = random.choice(MOCK_TEMPLATES)
        subreddit = random.choice(subreddits)
        days_ago = random.uniform(0, 30)
        created = now - (days_ago * 86400)

        score_base = {
            "positive": random.randint(100, 5000),
            "neutral": random.randint(10, 800),
            "negative": random.randint(50, 3000),
        }[sentiment]

        post = {
            "id": f"mock_{brand}_{i}_{int(time.time())}",
            "brand": brand,
            "subreddit": subreddit,
            "title": template.format(brand=brand),
            "body": "",
            "score": score_base + random.randint(-50, 200),
            "upvote_ratio": {
                "positive": random.uniform(0.75, 0.98),
                "neutral": random.uniform(0.50, 0.75),
                "negative": random.uniform(0.25, 0.55),
            }[sentiment],
            "num_comments": random.randint(5, 500),
            "created_utc": created,
            "url": f"https://reddit.com/r/{subreddit}/comments/mock{i}",
            "is_mock": True,
        }
        posts.append(post)

    return posts


# ─────────────────────────────────────────────
# Real Reddit fetcher via PRAW
# ─────────────────────────────────────────────

def _get_reddit_client():
    if not PRAW_AVAILABLE:
        raise RuntimeError("praw is not installed")

    kwargs = dict(
        client_id=config.REDDIT_CLIENT_ID,
        client_secret=config.REDDIT_CLIENT_SECRET,
        user_agent=config.REDDIT_USER_AGENT,
        check_for_async=False,
    )

    # Script-type Reddit apps require username + password for OAuth.
    # If these are set in .env, pass them for full authenticated access.
    if config.REDDIT_USERNAME and config.REDDIT_PASSWORD:
        kwargs["username"] = config.REDDIT_USERNAME
        kwargs["password"] = config.REDDIT_PASSWORD
        print("[reddit_service] Using password grant (script app auth)")
    else:
        print("[reddit_service] Using application-only OAuth (read-only)")

    return praw.Reddit(**kwargs)


def _fetch_real_posts(brand: str, subreddits: List[str], limit: int) -> List[dict]:
    reddit = _get_reddit_client()
    posts = []
    errors = []
    per_sub = max(1, limit // len(subreddits))

    for subreddit_name in subreddits:
        try:
            subreddit = reddit.subreddit(subreddit_name)
            for submission in subreddit.search(brand, limit=per_sub, sort="new"):
                posts.append({
                    "id": submission.id,
                    "brand": brand,
                    "subreddit": subreddit_name,
                    "title": submission.title,
                    "body": submission.selftext[:500] if submission.selftext else "",
                    "score": submission.score,
                    "upvote_ratio": submission.upvote_ratio,
                    "num_comments": submission.num_comments,
                    "created_utc": submission.created_utc,
                    "url": f"https://reddit.com{submission.permalink}",
                    "is_mock": False,
                })
        except Exception as e:
            print(f"[reddit_service] Error fetching from r/{subreddit_name}: {e}")
            errors.append(str(e))

    # If every subreddit failed (e.g. all 401s), raise so the caller can fallback to mock.
    if not posts and errors:
        raise RuntimeError(
            f"All subreddits failed. First error: {errors[0]}. "
            "Tip: for script-type Reddit apps add REDDIT_USERNAME and REDDIT_PASSWORD to .env"
        )

    return posts


# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────

def fetch_posts(
    brand: str,
    subreddits: Optional[List[str]] = None,
    limit: int = 100,
) -> List[dict]:
    """
    Fetch Reddit posts mentioning the brand.
    Uses mock data if USE_MOCK_DATA=true or credentials are missing.
    """
    if subreddits is None or len(subreddits) == 0:
        subreddits = MOCK_SUBREDDITS

    use_mock = (
        config.USE_MOCK_DATA
        or not config.REDDIT_CLIENT_ID
        or config.REDDIT_CLIENT_ID == "your_client_id_here"
    )

    if use_mock:
        return _generate_mock_posts(brand, subreddits, limit)
    else:
        try:
            return _fetch_real_posts(brand, subreddits, limit)
        except Exception as e:
            print(f"[reddit_service] Falling back to mock: {e}")
            return _generate_mock_posts(brand, subreddits, limit)
