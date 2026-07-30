import aiosqlite
from config import DB_PATH

CREATE_POSTS_TABLE = """
CREATE TABLE IF NOT EXISTS cached_posts (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    subreddit TEXT NOT NULL,
    title TEXT,
    body TEXT,
    score INTEGER,
    upvote_ratio REAL,
    num_comments INTEGER,
    created_utc REAL,
    url TEXT,
    fetched_at REAL
);
"""

CREATE_SENTIMENT_TABLE = """
CREATE TABLE IF NOT EXISTS cached_sentiment (
    post_id TEXT PRIMARY KEY,
    compound REAL,
    positive REAL,
    negative REAL,
    neutral REAL,
    subjectivity REAL,
    analyzed_at REAL
);
"""

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_POSTS_TABLE)
        await db.execute(CREATE_SENTIMENT_TABLE)
        await db.commit()

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
