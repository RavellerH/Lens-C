import type { MediaItem } from '../../types/media';
import { posterUrl } from '../../services/adapters/tmdb/tmdbAdapter';
import { formatRating } from '../../utils/formatters';
import { useWatchlist } from '../../app/store/watchlistStore';
import './PosterCard.css';

interface PosterCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
}

export function PosterCard({ item, onSelect }: PosterCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const src = posterUrl(item.posterPath);
  const inWatchlist = isInWatchlist(item.id);

  return (
    <div
      className="poster-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(item);
      }}
    >
      <div className="poster-card__image-wrap">
        {src ? (
          <img className="poster-card__image" src={src} alt={item.title} loading="lazy" />
        ) : (
          <div className="poster-card__placeholder">{item.title}</div>
        )}
        <div className="poster-card__gradient" />
        {item.reason && <span className="poster-card__reason">{item.reason}</span>}
        <button
          type="button"
          className={`poster-card__watchlist-btn${inWatchlist ? ' poster-card__watchlist-btn--active' : ''}`}
          aria-label={inWatchlist ? `Remove ${item.title} from watchlist` : `Add ${item.title} to watchlist`}
          onClick={(event) => {
            event.stopPropagation();
            toggleWatchlist(item);
          }}
        >
          {inWatchlist ? '✓' : '+'}
        </button>
        <div className="poster-card__meta">
          <p className="poster-card__title">{item.title}</p>
          <div className="poster-card__subline">
            <span>{item.year ?? '—'}</span>
            <span>·</span>
            <span>{item.type === 'movie' ? 'Movie' : 'Series'}</span>
            <span className="poster-card__rating">★ {formatRating(item.voteAverage)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
