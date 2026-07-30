import { useState } from 'react';
import { format } from 'date-fns';

const SentimentBadge = ({ label }) => (
  <span className={`sentiment-badge ${label}`}>
    {label === 'positive' ? '▲' : label === 'negative' ? '▼' : '●'} {label}
  </span>
);

const formatNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);

export default function TopPostsTable({ posts }) {
  const [sort, setSort]   = useState({ key: 'score', dir: 'desc' });
  const [page, setPage]   = useState(0);
  const PER_PAGE = 7;

  if (!posts?.length) return (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <div className="empty-state-text">No post data available</div>
    </div>
  );

  const sorted = [...posts].sort((a, b) => {
    const va = a[sort.key] ?? 0;
    const vb = b[sort.key] ?? 0;
    return sort.dir === 'desc' ? vb - va : va - vb;
  });

  const paginated = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  const toggleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
    setPage(0);
  };

  const SortIcon = ({ k }) => {
    if (sort.key !== k) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{sort.dir === 'desc' ? '↓' : '↑'}</span>;
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="posts-table">
          <thead>
            <tr>
              <th style={{ minWidth: 280 }}>Post Title</th>
              <th onClick={() => toggleSort('score')} id="sort-score">
                ⬆ Score <SortIcon k="score" />
              </th>
              <th onClick={() => toggleSort('num_comments')} id="sort-comments">
                💬 Comments <SortIcon k="num_comments" />
              </th>
              <th onClick={() => toggleSort('compound')} id="sort-sentiment">
                Sentiment <SortIcon k="compound" />
              </th>
              <th>Subreddit</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((post) => (
              <tr key={post.id}>
                <td>
                  <a href={post.url} target="_blank" rel="noopener noreferrer">
                    {post.title}
                  </a>
                </td>
                <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                  {formatNum(post.score)}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {formatNum(post.num_comments)}
                </td>
                <td><SentimentBadge label={post.label} /></td>
                <td style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                  r/{post.subreddit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          <button
            id="page-prev"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ ...btnStyle, opacity: page === 0 ? 0.4 : 1 }}
          >←</button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              id={`page-${i}`}
              onClick={() => setPage(i)}
              style={{ ...btnStyle, background: i === page ? 'rgba(168,85,247,0.25)' : 'transparent', borderColor: i === page ? 'var(--accent-purple)' : 'var(--border)' }}
            >
              {i + 1}
            </button>
          ))}

          <button
            id="page-next"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{ ...btnStyle, opacity: page === totalPages - 1 ? 0.4 : 1 }}
          >→</button>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-secondary)',
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: '0.82rem',
  transition: 'all 0.2s',
};
