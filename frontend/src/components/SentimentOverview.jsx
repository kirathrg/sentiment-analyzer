import { motion } from 'framer-motion';

const formatNumber = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const formatScore = (score) => {
  const s = Number(score);
  if (s >= 0.05) return { label: 'Positive', color: 'var(--positive)' };
  if (s <= -0.05) return { label: 'Negative', color: 'var(--negative)' };
  return { label: 'Neutral', color: 'var(--neutral)' };
};

const stats = (overall) => [
  {
    id: 'stat-score',
    label: 'Sentiment Score',
    value: (overall.compound >= 0 ? '+' : '') + overall.compound.toFixed(3),
    sub: formatScore(overall.compound).label,
    icon: overall.compound >= 0.05 ? '📈' : overall.compound <= -0.05 ? '📉' : '➡️',
    color: formatScore(overall.compound).color,
  },
  {
    id: 'stat-posts',
    label: 'Posts Analyzed',
    value: formatNumber(overall.total_posts),
    sub: overall.is_mock ? 'Demo data' : 'Real Reddit posts',
    icon: '📝',
    color: 'var(--accent-cyan)',
  },
  {
    id: 'stat-positive',
    label: 'Positive',
    value: `${overall.positive_pct}%`,
    sub: 'of all posts',
    icon: '😊',
    color: 'var(--positive)',
  },
  {
    id: 'stat-negative',
    label: 'Negative',
    value: `${overall.negative_pct}%`,
    sub: 'of all posts',
    icon: '😠',
    color: 'var(--negative)',
  },
  {
    id: 'stat-avg-score',
    label: 'Avg Upvotes',
    value: formatNumber(overall.avg_score),
    sub: 'per post',
    icon: '⬆️',
    color: 'var(--accent-amber)',
  },
  {
    id: 'stat-subjectivity',
    label: 'Subjectivity',
    value: `${(overall.avg_subjectivity * 100).toFixed(0)}%`,
    sub: overall.avg_subjectivity > 0.5 ? 'Opinionated' : 'Factual',
    icon: '🎭',
    color: 'var(--accent-purple)',
  },
];

export default function SentimentOverview({ overall }) {
  if (!overall) return null;
  const items = stats(overall);
  const sentiment = formatScore(overall.compound);

  return (
    <div>
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          marginBottom: '1.25rem',
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius)',
          background: `linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(6,182,212,0.08) 100%)`,
          border: '1px solid rgba(168,85,247,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>
          {overall.compound >= 0.05 ? '🚀' : overall.compound <= -0.05 ? '⚠️' : '📊'}
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.15rem' }}>
            Overall Sentiment:{' '}
            <span style={{ color: sentiment.color }}>{sentiment.label}</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Based on {overall.total_posts} Reddit posts
            {overall.is_mock && ' · 🎭 Demo data'}
          </div>
        </div>

        {/* Sentiment bar */}
        <div style={{ marginLeft: 'auto', minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>😠 {overall.negative_pct}%</span>
            <span>😐 {overall.neutral_pct}%</span>
            <span>😊 {overall.positive_pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', display: 'flex' }}>
            <div style={{ width: `${overall.negative_pct}%`, background: 'var(--negative)', transition: 'width 1s ease' }} />
            <div style={{ width: `${overall.neutral_pct}%`,  background: 'var(--neutral)',  transition: 'width 1s ease' }} />
            <div style={{ width: `${overall.positive_pct}%`, background: 'var(--positive)', transition: 'width 1s ease' }} />
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="overview-grid">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            id={item.id}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
            <div className="stat-sub">{item.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
