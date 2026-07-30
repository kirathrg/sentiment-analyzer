import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{payload[0]?.payload?.subreddit}</div>
      <div style={{ color: 'var(--accent-purple)' }}>Score: {payload[0]?.value?.toFixed(3)}</div>
    </div>
  );
};

export default function SubredditBreakdown({ subreddits }) {
  if (!subreddits?.length) return null;

  const top = subreddits.slice(0, 8);
  const data = top.map(s => ({
    subreddit: s.subreddit.charAt(0).toUpperCase() + s.subreddit.slice(1),
    score: Math.round((s.compound + 1) * 50),
    posts: s.post_count,
    positive: s.positive_pct,
    negative: s.negative_pct,
    raw: s.compound,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.07)" />
          <PolarAngleAxis
            dataKey="subreddit"
            tick={{ fill: 'var(--text-secondary)', fontSize: 10.5 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Sentiment"
            dataKey="score"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ fill: '#a855f7', r: 3, strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Mini table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
      {top.map(s => {
          const color = s.compound >= 0.05 ? 'var(--positive)' : s.compound <= -0.05 ? 'var(--negative)' : 'var(--neutral)';
          const label = s.subreddit.charAt(0).toUpperCase() + s.subreddit.slice(1);
          return (
            <div key={s.subreddit} style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: '0.78rem',
            }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
              <div style={{ color, fontWeight: 600 }}>{s.compound >= 0 ? '+' : ''}{s.compound.toFixed(3)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{s.post_count} posts</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
