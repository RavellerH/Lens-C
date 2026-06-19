import { useEffect } from 'react';
import type { MediaItem } from '../../types/media';
import { backdropUrl } from '../../services/adapters/tmdb/tmdbAdapter';
import { formatRating, formatRuntime } from '../../utils/formatters';
import { useWatchlist } from '../../app/store/watchlistStore';
import './MediaDetailModal.css';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
}

export function MediaDetailModal({ item, onClose }: MediaDetailModalProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(item.id);
  const backdrop = backdropUrl(item.backdropPath);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="media-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="media-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="media-modal__backdrop">
          {backdrop && <img src={backdrop} alt="" />}
          <div className="media-modal__backdrop-gradient" />
          <button type="button" className="media-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="media-modal__body">
          <h2 className="media-modal__title">{item.title}</h2>
          <div className="media-modal__meta-row">
            <span className="media-modal__chip">{item.year ?? '—'}</span>
            <span className="media-modal__chip">{item.type === 'movie' ? 'Movie' : 'Series'}</span>
            {item.runtime ? <span className="media-modal__chip">{formatRuntime(item.runtime)}</span> : null}
            <span className="media-modal__chip">★ {formatRating(item.voteAverage)}</span>
            {item.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="media-modal__chip">
                {genre}
              </span>
            ))}
          </div>
          {item.reason && <p className="media-modal__reason">{item.reason}</p>}
          <p className="media-modal__overview">{item.overview || 'No synopsis available yet.'}</p>
          <div className="media-modal__actions">
            <button
              type="button"
              className={`media-modal__btn${inWatchlist ? '' : ' media-modal__btn--primary'}`}
              onClick={() => toggleWatchlist(item)}
            >
              {inWatchlist ? 'Remove from watchlist' : '+ Add to watchlist'}
            </button>
          </div>
          {item.cast && item.cast.length > 0 && (
            <div className="media-modal__cast">
              <h3 className="rail__title">Cast</h3>
              <div className="media-modal__cast-list">
                {item.cast.slice(0, 6).map((member) => (
                  <span key={member.id}>{member.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
