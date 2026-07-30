import re
import math
import time
from collections import Counter
from typing import List, Dict, Any

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

# Common English stop words to exclude from keyword extraction
STOP_WORDS = {
    "the","a","an","is","it","in","on","of","to","and","or","but","for",
    "with","this","that","are","was","were","be","been","being","have",
    "has","had","do","does","did","will","would","could","should","may",
    "might","shall","can","need","must","am","i","you","he","she","we",
    "they","me","him","her","us","them","my","your","his","its","our",
    "their","what","which","who","when","where","how","all","each","both",
    "few","more","most","other","some","such","no","not","only","same",
    "so","than","too","very","just","now","up","out","if","about","into",
    "through","during","before","after","above","below","from","by","at",
    "between","here","there","then","once","also","any","because","as",
}


def _clean_text(text: str) -> str:
    """Strip URLs, special chars, and normalize whitespace."""
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s']", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _analyze_single(text: str) -> Dict[str, float]:
    """Run VADER on a single piece of text."""
    cleaned = _clean_text(text)
    scores = vader.polarity_scores(cleaned)
    # Subjectivity heuristic: higher absolute compound = more subjective
    subjectivity = min(1.0, abs(scores["compound"]) * 1.4 + 0.1)
    return {
        "compound": round(scores["compound"], 4),
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral": round(scores["neu"], 4),
        "subjectivity": round(subjectivity, 4),
    }


def _classify(compound: float) -> str:
    if compound >= 0.05:
        return "positive"
    elif compound <= -0.05:
        return "negative"
    return "neutral"


def _weighted_average(values: List[float], weights: List[float]) -> float:
    """Score weighted by post upvotes (more upvoted = more weight)."""
    total_weight = sum(weights)
    if total_weight == 0:
        return 0.0
    return sum(v * w for v, w in zip(values, weights)) / total_weight


def analyze_posts(posts: List[dict]) -> Dict[str, Any]:
    """
    Full sentiment analysis pipeline for a list of posts.
    Returns aggregated stats, per-subreddit breakdown, time series, and keywords.
    """
    if not posts:
        return {}

    analyzed = []
    for post in posts:
        full_text = f"{post.get('title', '')} {post.get('body', '')}".strip()
        sentiment = _analyze_single(full_text)
        analyzed.append({**post, **sentiment, "label": _classify(sentiment["compound"])})

    # ── Overall Stats ──────────────────────────────────────────
    compounds = [p["compound"] for p in analyzed]
    weights = [max(1, p.get("score", 1)) for p in analyzed]

    overall_compound = _weighted_average(compounds, weights)
    pos_count = sum(1 for p in analyzed if p["label"] == "positive")
    neg_count = sum(1 for p in analyzed if p["label"] == "negative")
    neu_count = sum(1 for p in analyzed if p["label"] == "neutral")
    total = len(analyzed)

    overall = {
        "compound": round(overall_compound, 4),
        "label": _classify(overall_compound),
        "positive_pct": round(pos_count / total * 100, 1),
        "negative_pct": round(neg_count / total * 100, 1),
        "neutral_pct": round(neu_count / total * 100, 1),
        "total_posts": total,
        "avg_score": round(sum(weights) / total, 1),
        "avg_comments": round(sum(p.get("num_comments", 0) for p in analyzed) / total, 1),
        "avg_subjectivity": round(sum(p["subjectivity"] for p in analyzed) / total, 4),
        "is_mock": any(p.get("is_mock", False) for p in analyzed),
    }

    # ── Per-Subreddit Breakdown ────────────────────────────────
    subreddit_data: Dict[str, List] = {}
    for p in analyzed:
        sub = p.get("subreddit", "unknown")
        subreddit_data.setdefault(sub, []).append(p)

    subreddits = []
    for sub, sub_posts in subreddit_data.items():
        sub_compounds = [p["compound"] for p in sub_posts]
        sub_weights = [max(1, p.get("score", 1)) for p in sub_posts]
        avg_c = _weighted_average(sub_compounds, sub_weights)
        subreddits.append({
            "subreddit": sub,
            "compound": round(avg_c, 4),
            "label": _classify(avg_c),
            "post_count": len(sub_posts),
            "positive_pct": round(sum(1 for p in sub_posts if p["label"] == "positive") / len(sub_posts) * 100, 1),
            "negative_pct": round(sum(1 for p in sub_posts if p["label"] == "negative") / len(sub_posts) * 100, 1),
            "neutral_pct": round(sum(1 for p in sub_posts if p["label"] == "neutral") / len(sub_posts) * 100, 1),
        })

    # ── Time Series (daily buckets, last 30 days) ──────────────
    now = time.time()
    bucket_size = 86400  # 1 day
    buckets: Dict[int, List[float]] = {}
    for p in analyzed:
        created = p.get("created_utc", now)
        day_key = int((now - created) // bucket_size)
        buckets.setdefault(day_key, []).append(p["compound"])

    trend = []
    for day_offset in sorted(buckets.keys()):
        day_compounds = buckets[day_offset]
        avg = sum(day_compounds) / len(day_compounds)
        timestamp_ms = int((now - day_offset * bucket_size) * 1000)
        trend.append({
            "timestamp": timestamp_ms,
            "compound": round(avg, 4),
            "label": _classify(avg),
            "post_count": len(day_compounds),
        })
    trend.sort(key=lambda x: x["timestamp"])

    # ── Keyword Extraction for Word Cloud ──────────────────────
    all_words: List[str] = []
    word_sentiment: Dict[str, List[float]] = {}
    for p in analyzed:
        text = _clean_text(f"{p.get('title', '')} {p.get('body', '')}").lower()
        words = [
            w for w in text.split()
            if w not in STOP_WORDS and len(w) > 2 and not w.isdigit()
        ]
        for w in words:
            all_words.append(w)
            word_sentiment.setdefault(w, []).append(p["compound"])

    word_counts = Counter(all_words)
    top_keywords = []
    for word, count in word_counts.most_common(80):
        avg_sent = sum(word_sentiment[word]) / len(word_sentiment[word])
        top_keywords.append({
            "word": word,
            "count": count,
            "sentiment": round(avg_sent, 4),
            "label": _classify(avg_sent),
        })

    # ── Top Posts ──────────────────────────────────────────────
    sorted_by_score = sorted(analyzed, key=lambda x: x.get("score", 0), reverse=True)
    top_posts = []
    for p in sorted_by_score[:20]:
        top_posts.append({
            "id": p.get("id"),
            "title": p.get("title", ""),
            "subreddit": p.get("subreddit", ""),
            "score": p.get("score", 0),
            "num_comments": p.get("num_comments", 0),
            "upvote_ratio": p.get("upvote_ratio", 0),
            "url": p.get("url", ""),
            "compound": p["compound"],
            "label": p["label"],
            "created_utc": p.get("created_utc", 0),
        })

    # ── Emotion approximation (based on VADER sub-scores) ──────
    avg_pos = sum(p["positive"] for p in analyzed) / total
    avg_neg = sum(p["negative"] for p in analyzed) / total
    avg_neu = sum(p["neutral"] for p in analyzed) / total
    avg_sub = sum(p["subjectivity"] for p in analyzed) / total
    emotions = {
        "joy": round(avg_pos * 0.7, 3),
        "trust": round(avg_pos * 0.4 + avg_neu * 0.3, 3),
        "anticipation": round(avg_sub * 0.5, 3),
        "anger": round(avg_neg * 0.6, 3),
        "disgust": round(avg_neg * 0.4, 3),
        "sadness": round(avg_neg * 0.3 + (1 - avg_sub) * 0.1, 3),
        "fear": round(avg_neg * 0.2, 3),
        "surprise": round(avg_sub * 0.3 + avg_pos * 0.1, 3),
    }

    return {
        "overall": overall,
        "subreddits": subreddits,
        "trend": trend,
        "keywords": top_keywords,
        "top_posts": top_posts,
        "emotions": emotions,
    }
