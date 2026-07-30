import { useMemo } from 'react';

const WIDTH  = 260;
const HEIGHT = 160;
const CX = WIDTH / 2;
const CY = HEIGHT - 20;
const R  = 120;

const polarToXY = (angleDeg, radius) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  };
};

// Arc path helper
const describeArc = (startAngle, endAngle, r) => {
  const start = polarToXY(startAngle, r);
  const end   = polarToXY(endAngle, r);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
};

export default function SubjectivityGauge({ subjectivity }) {
  if (subjectivity == null) return null;

  // 0 = 180deg (left), 1 = 0deg (right)
  const angle = 180 - subjectivity * 180; // needle angle from right
  const needlePt = polarToXY(180 - subjectivity * 180, R - 10);

  const label = subjectivity < 0.3
    ? { text: 'Very Factual', color: '#06b6d4' }
    : subjectivity < 0.5
    ? { text: 'Mostly Factual', color: '#3b82f6' }
    : subjectivity < 0.7
    ? { text: 'Mixed', color: '#f59e0b' }
    : subjectivity < 0.85
    ? { text: 'Opinionated', color: '#f97316' }
    : { text: 'Highly Opinionated', color: '#ef4444' };

  return (
    <div className="gauge-container">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', maxWidth: 280, overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#06b6d4" />
            <stop offset="33%"  stopColor="#3b82f6" />
            <stop offset="66%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={describeArc(0, 180, R)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={18}
          strokeLinecap="round"
        />

        {/* Colored arc (filled up to value) */}
        <path
          d={describeArc(180 - subjectivity * 180, 180, R)}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={18}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map(val => {
          const a = 180 - val * 180;
          const outer = polarToXY(a, R + 14);
          const inner = polarToXY(a, R + 5);
          return (
            <line key={val} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
          );
        })}

        {/* Needle */}
        <line
          x1={CX} y1={CY}
          x2={needlePt.x} y2={needlePt.y}
          stroke={label.color}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={6} fill={label.color} />
        <circle cx={CX} cy={CY} r={3} fill="var(--bg-base)" />

        {/* Value text */}
        <text x={CX} y={CY - 30} textAnchor="middle"
          fontSize={22} fontWeight={700} fontFamily="'Space Grotesk', sans-serif"
          fill={label.color}>
          {(subjectivity * 100).toFixed(0)}%
        </text>

        {/* Label text */}
        <text x={CX} y={CY - 12} textAnchor="middle"
          fontSize={10} fill="var(--text-muted)">
          {label.text}
        </text>

        {/* Min / Max labels */}
        <text x={CX - R - 10} y={CY + 16} textAnchor="middle" fontSize={9} fill="var(--text-muted)">Factual</text>
        <text x={CX + R + 10} y={CY + 16} textAnchor="middle" fontSize={9} fill="var(--text-muted)">Opinionated</text>
      </svg>

      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: label.color, fontWeight: 600 }}>
        {label.text}
      </div>
    </div>
  );
}
