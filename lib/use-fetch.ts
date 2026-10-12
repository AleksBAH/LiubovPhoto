'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFetch<T>(url: string, options?: { skip?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!options?.skip) {
      refetch();
    }
  }, [refetch, options?.skip]);

  return { data, loading, error, refetch, setData };
}
