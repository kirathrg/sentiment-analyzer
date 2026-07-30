import { useState, useCallback } from 'react';
import { analyzeBrand } from '../services/api';

export function useSentimentData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const analyze = useCallback(async ({ brand, subreddits, limit }) => {
    if (!brand?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeBrand({ brand: brand.trim(), subreddits, limit });
      setData(result);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, analyze, reset };
}
