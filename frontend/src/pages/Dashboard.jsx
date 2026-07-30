import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import SentimentOverview from '../components/SentimentOverview';
import SentimentTrendChart from '../components/SentimentTrendChart';
import SentimentDistribution from '../components/SentimentDistribution';
import SubredditBreakdown from '../components/SubredditBreakdown';
import WordCloud from '../components/WordCloud';
import PostHeatmap from '../components/PostHeatmap';
import TopPostsTable from '../components/TopPostsTable';
import EmotionRadar from '../components/EmotionRadar';
import SubjectivityGauge from '../components/SubjectivityGauge';

const Section = ({ id, title, icon, children, gridClass = '', style = {} }) => (
  <motion.div
    id={id}
    className={`card ${gridClass}`}
    style={style}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="card-title">
      <span className="card-title-icon">{icon}</span>
      {title}
    </div>
    {children}
  </motion.div>
);

export default function Dashboard({ data, loading, error, onSearch }) {
  return (
    <div className="main-content">
      {/* Hero */}
      {!data && !loading && (
        <motion.div
          className="hero"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">🟠 HackerNews Powered · Live Data</div>
          <h1 className="hero-title">
            Brand <span>Sentiment</span> Intelligence
          </h1>
          <p className="hero-subtitle">
            Discover what the tech world really thinks about any brand, product, or topic.
            Real-time HackerNews analysis with 10+ advanced visualizations.
          </p>
        </motion.div>
      )}

      {/* Search bar */}
      <SearchBar onSearch={onSearch} loading={loading} />

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius)',
              padding: '1rem 1.5rem',
              color: '#ef4444',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <strong>Analysis failed:</strong> {error}
              <div style={{ fontSize: '0.82rem', color: 'rgba(239,68,68,0.7)', marginTop: 4 }}>
                Make sure the backend is running: <code>python backend/main.py</code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ marginBottom: '1rem' }} />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600 }}>
              Scanning Reddit...
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'var(--text-muted)' }}>
              Fetching posts, running sentiment analysis, crunching numbers...
            </div>
          </div>
          {/* Skeleton cards */}
          <div className="overview-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 32, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 10, width: '40%' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 240, width: '100%' }} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results dashboard */}
      <AnimatePresence>
        {data && !loading && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Brand label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                background: 'var(--grad-purple)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {data.brand}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— Reddit Sentiment Report</div>
              {data.overall?.is_mock && (
                <span style={{
                  fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                  color: 'var(--accent-amber)', marginLeft: 'auto',
                }}>
                  🎭 Demo Data
                </span>
              )}
            </motion.div>

            {/* Overview stats */}
            <SentimentOverview overall={data.overall} />

            {/* Grid of charts */}
            <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>

              {/* Trend chart — full width */}
              <Section
                id="section-trend"
                title="Sentiment Trend Over Time"
                icon="📈"
                gridClass="grid-full"
              >
                <SentimentTrendChart trend={data.trend} />
              </Section>

              {/* Distribution + Subjectivity */}
              <Section id="section-distribution" title="Sentiment Distribution" icon="🥧">
                <SentimentDistribution overall={data.overall} />
              </Section>

              <Section id="section-subjectivity" title="Subjectivity Score" icon="🎭">
                <SubjectivityGauge subjectivity={data.overall?.avg_subjectivity} />
              </Section>

              {/* Subreddit Breakdown */}
              <Section id="section-subreddits" title="HackerNews Topic Breakdown" icon="🟠">
                <SubredditBreakdown subreddits={data.subreddits} />
              </Section>

              {/* Emotion Radar */}
              <Section id="section-emotions" title="Emotion Analysis" icon="🧠">
                <EmotionRadar emotions={data.emotions} />
              </Section>

              {/* Word Cloud — full width */}
              <Section
                id="section-wordcloud"
                title="Sentiment Word Cloud"
                icon="☁️"
                gridClass="grid-full"
              >
                <WordCloud keywords={data.keywords} />
              </Section>

              {/* Heat map — full width */}
              <Section
                id="section-heatmap"
                title="Activity Heat Map (Daily Sentiment)"
                icon="🗓️"
                gridClass="grid-full"
              >
                <PostHeatmap trend={data.trend} />
              </Section>

              {/* Top Posts Table — full width */}
              <Section
                id="section-posts"
                title="Most Influential Posts"
                icon="📋"
                gridClass="grid-full"
              >
                <TopPostsTable posts={data.top_posts} />
              </Section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
