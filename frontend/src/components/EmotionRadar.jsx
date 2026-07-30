import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const EMOTION_ICONS = {
  joy: '😊', trust: '🤝', anticipation: '🔮',
  anger: '😠', disgust: '🤢', sadness: '😢', fear: '😨', surprise: '😮',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-tooltip">
      <div className="label">{EMOTION_ICONS[d?.emotion]} {d?.emotion}</div>
      <div style={{ color: 'var(--accent-cyan)' }}>
        {(d?.value * 100).toFixed(1)}%
      </div>
    </div>
  );
};

export default function EmotionRadar({ emotions }) {
  if (!emotions) return null;

  const data = Object.entries(emotions).map(([emotion, value]) => ({
    emotion,
    value: parseFloat((value * 100).toFixed(1)),
    displayName: `${EMOTION_ICONS[emotion] || ''} ${emotion}`,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <defs>
            <linearGradient id="emGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#06b6d4" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="displayName"
            tick={{ fill: 'var(--text-secondary)', fontSize: 10.5 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 60]}
            tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
            tickCount={3}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Emotion"
            dataKey="value"
            stroke="#06b6d4"
            fill="url(#emGrad)"
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 3, strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Emotion chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.25rem' }}>
        {data.map(d => (
          <div key={d.emotion} style={{
            fontSize: '0.75rem',
            padding: '3px 10px',
            borderRadius: 99,
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.18)',
            color: 'var(--text-secondary)',
          }}>
            {EMOTION_ICONS[d.emotion]} {d.emotion}: <strong style={{ color: 'var(--accent-cyan)' }}>{d.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
