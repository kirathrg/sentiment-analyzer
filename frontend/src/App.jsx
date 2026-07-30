import './index.css';
import { Toaster, toast } from 'react-hot-toast';
import { useSentimentData } from './hooks/useSentimentData';
import Dashboard from './pages/Dashboard';

function App() {
  const { data, loading, error, analyze } = useSentimentData();

  const handleSearch = async (params) => {
    const toastId = toast.loading(`🔍 Analyzing "${params.brand}"...`, {
      style: {
        background: 'rgba(13,20,36,0.95)',
        border: '1px solid rgba(168,85,247,0.3)',
        color: '#f1f5f9',
      },
    });
    await analyze(params);
    toast.dismiss(toastId);
    if (!error) {
      toast.success(`✅ Analysis complete for "${params.brand}"`, {
        style: {
          background: 'rgba(13,20,36,0.95)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#f1f5f9',
        },
      });
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">📊</div>
            SentiRadar
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {data && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                🕒 Last analyzed: <strong style={{ color: 'var(--text-secondary)' }}>{data.brand}</strong>
              </span>
            )}
            <span className="header-badge">🟠 HackerNews Analyzer</span>
          </div>
        </div>
      </header>

      {/* Main dashboard */}
      <main>
        <Dashboard
          data={data}
          loading={loading}
          error={error}
          onSearch={handleSearch}
        />
      </main>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
      />
    </div>
  );
}

export default App;
