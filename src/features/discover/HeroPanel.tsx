import type { MediaItem } from '../../types/media';
import { useWatchlist } from '../../app/store/watchlistStore';
import './HeroPanel.css';

interface HeroPanelProps {
  item: MediaItem;
  onMoreInfo: (item: MediaItem) => void;
}

export function HeroPanel({ item, onMoreInfo }: HeroPanelProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const backdrop = item.backdropUrl ?? undefined;

  return (
    <section className="hero-panel">
      {backdrop && <img className="hero-panel__backdrop" src={backdrop} alt="" />}
      <div className="hero-panel__gradient" />
      <div className="hero-panel__content">
        <p className="hero-panel__eyebrow">{item.reason ?? 'Trending now'}</p>
        <h1 className="hero-panel__title">{item.title}</h1>
        <p className="hero-panel__overview">{item.overview}</p>
        <div className="hero-panel__actions">
          <button type="button" className="hero-panel__btn hero-panel__btn--primary" onClick={() => onMoreInfo(item)}>
            More info
          </button>
          <button type="button" className="hero-panel__btn" onClick={() => toggleWatchlist(item)}>
            {isInWatchlist(item.id) ? '✓ In watchlist' : '+ Watchlist'}
          </button>
        </div>
      </div>
    </section>
  );
}
