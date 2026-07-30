import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const color = val >= 0.05 ? 'var(--positive)' : val <= -0.05 ? 'var(--negative)' : 'var(--neutral)';
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      <div style={{ color, fontWeight: 600 }}>Score: {val.toFixed(3)}</div>
      {payload[1] && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          {payload[1].value} posts
        </div>
      )}
    </div>
  );
};

export default function SentimentTrendChart({ trend }) {
  if (!trend?.length) return (
    <div className="empty-state">
      <div className="empty-state-icon">📈</div>
      <div className="empty-state-text">No trend data available</div>
    </div>
  );

  const data = trend.map(d => ({
    date: format(new Date(d.timestamp), 'MMM d'),
    compound: d.compound,
    posts: d.post_count,
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <ReferenceLine y={0.05}  stroke="rgba(16,185,129,0.2)" strokeDasharray="3 3" />
          <ReferenceLine y={-0.05} stroke="rgba(239,68,68,0.2)"  strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="compound"
            stroke="#a855f7"
            strokeWidth={2.5}
            fill="url(#trendGrad)"
            dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#a855f7', stroke: 'rgba(168,85,247,0.4)', strokeWidth: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
