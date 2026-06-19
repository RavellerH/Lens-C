import { useEffect, useRef, useState } from 'react';
import { getCached, setCached } from '../../services/cache/indexedDbCache';
import { TmdbAuthError, TmdbRateLimitError } from '../../services/adapters/tmdb/tmdbAdapter';

const DEFAULT_MAX_AGE_MS = 1000 * 60 * 30;

interface CachedFetchState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
}

const IDLE_STATE = { data: undefined, loading: false, error: undefined };

/** Fetches via `fetcher`, serving a cached copy instantly when present and revalidating in the background. */
export function useCachedFetch<T>(cacheKey: string | undefined, fetcher: () => Promise<T>, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  const [state, setState] = useState<CachedFetchState<T>>({ data: undefined, loading: true, error: undefined });
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!cacheKey) return;

    let cancelled = false;

    async function run() {
      const cached = await getCached<T>(cacheKey!, maxAgeMs);
      if (cached !== undefined && !cancelled) {
        setState({ data: cached, loading: false, error: undefined });
      } else if (!cancelled) {
        setState((prev) => ({ ...prev, loading: true }));
      }

      try {
        const fresh = await fetcherRef.current();
        if (!cancelled) {
          setState({ data: fresh, loading: false, error: undefined });
          await setCached(cacheKey!, fresh);
        }
      } catch (err) {
        if (cancelled) return;
        if (cached !== undefined) {
          // keep the cached fallback on screen per design.md error-handling rules
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }
        const message =
          err instanceof TmdbAuthError
            ? err.message
            : err instanceof TmdbRateLimitError
              ? err.message
              : 'Something went wrong loading this list.';
        setState({ data: undefined, loading: false, error: message });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, maxAgeMs]);

  return cacheKey ? state : IDLE_STATE;
}
