import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{payload[0].name}</div>
      <div style={{ color: payload[0].payload.fill, fontWeight: 600 }}>
        {payload[0].value.toFixed(1)}%
      </div>
    </div>
  );
};

export default function SentimentDistribution({ overall }) {
  if (!overall) return null;

  const data = [
    { name: 'Positive', value: overall.positive_pct, fill: '#10b981' },
    { name: 'Neutral',  value: overall.neutral_pct,  fill: '#64748b' },
    { name: 'Negative', value: overall.negative_pct, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <defs>
          {data.map((entry, i) => (
            <filter key={i} id={`glow-${i}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
          animationBegin={0}
          animationDuration={900}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
