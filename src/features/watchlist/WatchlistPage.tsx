import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../../app/store/watchlistStore';
import { PosterCard } from '../../components/cards/PosterCard';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import type { MediaItem } from '../../types/media';
import './WatchlistPage.css';

type SortMode = 'newest' | 'popularity' | 'runtime';

export function WatchlistPage() {
  const { items } = useWatchlist();
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [selected, setSelected] = useState<MediaItem | undefined>();

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sortMode === 'newest') return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    if (sortMode === 'popularity') return copy.sort((a, b) => b.popularity - a.popularity);
    return copy.sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0));
  }, [items, sortMode]);

  return (
    <div className="watchlist-page">
      <div className="watchlist-page__header">
        <h1>Watchlist</h1>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} aria-label="Sort watchlist">
          <option value="newest">Newest</option>
          <option value="popularity">Popularity</option>
          <option value="runtime">Runtime</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="watchlist-page__empty">
          Your watchlist is empty. <Link to="/">Browse trending titles</Link> to start adding some.
        </div>
      ) : (
        <div className="watchlist-page__grid">
          {sorted.map((item) => (
            <PosterCard key={item.id} item={item} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && <MediaDetailModal item={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
