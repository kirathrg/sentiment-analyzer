import os

from dotenv import load_dotenv

load_dotenv()

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "SentimentAnalyzer/1.0")
REDDIT_USERNAME = os.getenv("REDDIT_USERNAME", "")
REDDIT_PASSWORD = os.getenv("REDDIT_PASSWORD", "")

USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
MAX_POSTS_PER_SEARCH = int(os.getenv("MAX_POSTS_PER_SEARCH", "100"))
CACHE_TTL_MINUTES = int(os.getenv("CACHE_TTL_MINUTES", "30"))

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

DB_PATH = "sentiment_cache.db"
