import { useState } from 'react';
import { motion } from 'framer-motion';

const TOPICS = [
  { id: 'finance',   label: '💰 Finance' },
  { id: 'tech',      label: '💻 Tech' },
  { id: 'reviews',   label: '⭐ Reviews' },
  { id: 'news',      label: '📰 News' },
  { id: 'community', label: '👥 Community' },
  { id: 'general',   label: '🌐 General' },
];

export default function SearchBar({ onSearch, loading }) {
  const [brand, setBrand] = useState('');
  const [limit, setLimit] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brand.trim()) return;
    onSearch({ brand, subreddits: [], limit });
  };

  return (
    <motion.div
      className="search-section"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="search-card">
        <div className="search-title">
          🟠 HackerNews Brand Intelligence
        </div>
        <p className="search-subtitle">
          Analyze real-time HackerNews sentiment for any brand, product, or topic — live data, no API key needed
        </p>

        <form onSubmit={handleSubmit}>
          <div className="search-row">
            <div className="input-group" style={{ maxWidth: 340 }}>
              <label className="input-label">Brand / Topic</label>
              <input
                id="brand-input"
                className="input-field"
                type="text"
                placeholder="e.g. Tesla, Apple, ChatGPT..."
                value={brand}
                onChange={e => setBrand(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="input-group" style={{ maxWidth: 160 }}>
              <label className="input-label">Post Limit</label>
              <select
                id="limit-select"
                className="input-field"
                value={limit}
                onChange={e => setLimit(Number(e.target.value))}
                style={{ cursor: 'pointer' }}
              >
                <option value={50}>50 posts</option>
                <option value={100}>100 posts</option>
                <option value={150}>150 posts</option>
                <option value={200}>200 posts</option>
              </select>
            </div>

            <button
              id="analyze-btn"
              className="search-btn"
              type="submit"
              disabled={loading || !brand.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Fetching Bluesky...
                </>
              ) : (
                <>🟠 Analyze</>
              )}
            </button>

            <div className="mock-badge">
              🟠 HackerNews · <strong>live data</strong> · no login needed
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div className="input-label" style={{ marginBottom: '0.5rem' }}>
              Topic filters (auto-detected from post content)
            </div>
            <div className="subreddit-chips">
              {TOPICS.map(topic => (
                <div
                  key={topic.id}
                  id={`topic-chip-${topic.id}`}
                  className="chip active"
                  style={{ cursor: 'default' }}
                >
                  {topic.label}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
