import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../../app/store/settingsStore';
import { tmdbAdapter } from '../../services/adapters/tmdb/tmdbAdapter';
import { debounce } from '../../utils/formatters';
import { readLocal, writeLocal } from '../../utils/storage';
import type { MediaItem, MediaType } from '../../types/media';
import { PosterCard } from '../../components/cards/PosterCard';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import './SearchPage.css';

type Tab = 'all' | MediaType;
const RECENT_KEY = 'recent-searches';

export function SearchPage() {
  const { settings, hasTmdbKey } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<MediaItem | undefined>();
  const [recent, setRecent] = useState<string[]>(() => readLocal(RECENT_KEY, { items: [] as string[] }).items);

  const opts = useMemo(
    () => ({ apiKey: settings.tmdbApiKey, region: settings.region, language: settings.language }),
    [settings.tmdbApiKey, settings.region, settings.language],
  );

  const runSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!hasTmdbKey || !value.trim()) {
          setResults([]);
          return;
        }
        setLoading(true);
        try {
          const items = await tmdbAdapter.searchMulti(opts, value);
          setResults(items);
          if (items.length > 0 && value.trim().length > 2) {
            setRecent((prev) => {
              const next = [value, ...prev.filter((entry) => entry !== value)].slice(0, 6);
              writeLocal(RECENT_KEY, { items: next });
              return next;
            });
          }
        } finally {
          setLoading(false);
        }
      }, 350),
    [opts, hasTmdbKey],
  );

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  useEffect(() => {
    setSearchParams(query ? { q: query } : {}, { replace: true });
  }, [query, setSearchParams]);

  const filtered = results.filter((item) => tab === 'all' || item.type === tab);

  return (
    <div className="search-page">
      <div className="search-page__input-row">
        <input
          type="search"
          autoFocus
          placeholder="Search for a movie or series"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="search-page__tabs">
        {(['all', 'movie', 'tv'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`search-page__tab${tab === t ? ' search-page__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'Series'}
          </button>
        ))}
      </div>

      {!hasTmdbKey ? (
        <p className="search-page__empty">Add your TMDb key in Settings to search.</p>
      ) : loading ? (
        <p className="search-page__empty">Searching…</p>
      ) : filtered.length === 0 ? (
        query ? <p className="search-page__empty">No results for "{query}".</p> : null
      ) : (
        <div className="search-page__grid">
          {filtered.map((item) => (
            <PosterCard key={item.id} item={item} onSelect={setSelected} />
          ))}
        </div>
      )}

      {recent.length > 0 && !query && (
        <div className="search-page__recent">
          <h2>Recent searches</h2>
          {recent.map((term) => (
            <button key={term} type="button" className="search-page__recent-chip" onClick={() => setQuery(term)}>
              {term}
            </button>
          ))}
        </div>
      )}

      {selected && <MediaDetailModal item={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
