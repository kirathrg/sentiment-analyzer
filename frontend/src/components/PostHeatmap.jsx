import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { format, fromUnixTime } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PostHeatmap({ trend }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!trend?.length || !svgRef.current) return;

    const el = svgRef.current;
    d3.select(el).selectAll('*').remove();

    const width  = el.clientWidth || 600;
    const height = 200;
    const cellSize = Math.max(10, Math.min(18, (width - 80) / 30));
    const padding  = 4;

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const data = trend.map(d => ({
      date:   new Date(d.timestamp),
      value:  d.compound,
      posts:  d.post_count,
    }));

    const colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['#ef4444', '#1e293b', '#10b981'])
      .clamp(true);

    const startX = 60;
    const startY = 30;

    // Column labels (week numbers / dates)
    data.forEach((d, i) => {
      if (i % 5 === 0) {
        svg.append('text')
          .attr('x', startX + i * (cellSize + padding) + cellSize / 2)
          .attr('y', startY - 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9)
          .attr('fill', 'var(--text-muted)')
          .text(format(d.date, 'MMM d'));
      }
    });

    // Draw cells
    const cells = svg.selectAll('rect.cell')
      .data(data)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', (d, i) => startX + i * (cellSize + padding))
      .attr('y', startY)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 3)
      .attr('fill', d => colorScale(d.value))
      .attr('opacity', 0)
      .style('cursor', 'pointer');

    // Animate in
    cells.transition().duration(500).delay((d, i) => i * 20).attr('opacity', 1);

    // Tooltips
    const tooltip = d3.select('#hm-tooltip');

    cells
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 0.7).attr('stroke', '#a855f7').attr('stroke-width', 1.5);
        tooltip
          .style('display', 'block')
          .style('left', `${event.offsetX + 10}px`)
          .style('top',  `${event.offsetY - 10}px`)
          .html(`
            <strong>${format(d.date, 'MMM d, yyyy')}</strong><br/>
            Score: ${d.value.toFixed(3)}<br/>
            Posts: ${d.posts}
          `);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', `${event.offsetX + 10}px`)
          .style('top',  `${event.offsetY - 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1).attr('stroke', 'none');
        tooltip.style('display', 'none');
      });

    // Color legend
    const legendW = 120;
    const legendX = startX;
    const legendY = startY + cellSize + 20;

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'heatmap-grad');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
    grad.append('stop').attr('offset', '50%').attr('stop-color', '#1e293b');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

    svg.append('rect')
      .attr('x', legendX).attr('y', legendY)
      .attr('width', legendW).attr('height', 8)
      .attr('rx', 4)
      .attr('fill', 'url(#heatmap-grad)');

    svg.append('text').attr('x', legendX).attr('y', legendY + 20).attr('font-size', 9).attr('fill', 'var(--text-muted)').text('Negative');
    svg.append('text').attr('x', legendX + legendW).attr('y', legendY + 20).attr('font-size', 9).attr('fill', 'var(--text-muted)').attr('text-anchor', 'end').text('Positive');

  }, [trend]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', minHeight: 200 }} />
      <div
        id="hm-tooltip"
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
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
