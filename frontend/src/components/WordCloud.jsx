import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Simplified cloud layout without d3-cloud dependency
function computeLayout(words, width, height) {
  const maxCount = Math.max(...words.map(w => w.count));
  const minCount = Math.min(...words.map(w => w.count));
  const fontSize = d3.scaleLinear().domain([minCount, maxCount]).range([11, 46]);

  const placed = [];
  const cx = width / 2;
  const cy = height / 2;

  // Spiral placement
  for (const word of words.slice(0, 60)) {
    const fs = fontSize(word.count);
    const charW = fs * 0.62;
    const textW = word.word.length * charW;
    const textH = fs;

    let placed_ok = false;
    for (let r = 0; r < 200; r += 2) {
      const angle = r * 0.35;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * 0.55 * Math.sin(angle);

      // Check collision
      const overlap = placed.some(p => {
        return Math.abs(p.x - x) < (p.textW / 2 + textW / 2 + 4) &&
               Math.abs(p.y - y) < (p.textH / 2 + textH / 2 + 4);
      });

      if (!overlap && x > textW / 2 && x < width - textW / 2 &&
          y > textH / 2 && y < height - textH / 2) {
        placed.push({ ...word, x, y, fontSize: fs, textW, textH });
        placed_ok = true;
        break;
      }
    }
    if (!placed_ok && placed.length < 30) {
      // Force place if we can't find a spot (graceful degradation)
      const x = cx + (Math.random() - 0.5) * width * 0.7;
      const y = cy + (Math.random() - 0.5) * height * 0.6;
      placed.push({ ...word, x, y, fontSize: Math.max(fs * 0.7, 10), textW, textH });
    }
  }

  return placed;
}

const sentimentColor = (s) => {
  if (s >= 0.05)  return '#10b981';
  if (s <= -0.05) return '#ef4444';
  return '#64748b';
};

export default function WordCloud({ keywords }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!keywords?.length || !svgRef.current) return;

    const el = svgRef.current;
    const width = el.clientWidth || 580;
    const height = 300;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const placed = computeLayout(keywords, width, height);

    const g = svg.append('g');

    g.selectAll('text')
      .data(placed)
      .join('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', d => `${d.fontSize}px`)
      .attr('font-family', "'Inter', sans-serif")
      .attr('font-weight', d => d.fontSize > 28 ? 700 : d.fontSize > 18 ? 600 : 400)
      .attr('fill', d => sentimentColor(d.sentiment))
      .attr('opacity', 0)
      .style('cursor', 'pointer')
      .text(d => d.word)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 0.75).attr('font-size', `${d.fontSize * 1.12}px`);
        // Show tooltip
        const tooltip = document.getElementById('wc-tooltip');
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.offsetX + 12}px`;
          tooltip.style.top  = `${event.offsetY - 10}px`;
          tooltip.innerHTML = `<strong>${d.word}</strong><br/>Mentions: ${d.count}<br/>Sentiment: ${d.sentiment.toFixed(3)}`;
        }
      })
      .on('mousemove', function (event) {
        const tooltip = document.getElementById('wc-tooltip');
        if (tooltip) {
          tooltip.style.left = `${event.offsetX + 12}px`;
          tooltip.style.top  = `${event.offsetY - 10}px`;
        }
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('opacity', 0.9).attr('font-size', `${d.fontSize}px`);
        const tooltip = document.getElementById('wc-tooltip');
        if (tooltip) tooltip.style.display = 'none';
      })
      .transition()
      .duration(600)
      .delay((d, i) => i * 15)
      .attr('opacity', 0.9);

  }, [keywords]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} className="word-cloud-svg" style={{ minHeight: 300 }} />

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.75rem' }}>
        {[
          { color: '#10b981', label: 'Positive words' },
          { color: '#64748b', label: 'Neutral words' },
          { color: '#ef4444', label: 'Negative words' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Floating tooltip */}
      <div
        id="wc-tooltip"
        style={{
          display: 'none',
          position: 'absolute',
          background: 'rgba(13,20,36,0.96)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 8,
          padding: '0.5rem 0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          zIndex: 99,
          whiteSpace: 'nowrap',
        }}
      />
    </div>
  );
}
