import type { ReactNode } from 'react';
import type { MediaItem } from '../../types/media';
import { PosterCard } from '../cards/PosterCard';
import './Rail.css';

interface RailProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  loading?: boolean;
  error?: string;
  emptyState?: ReactNode;
  onSelectItem: (item: MediaItem) => void;
}

export function Rail({ title, subtitle, items, loading, error, emptyState, onSelectItem }: RailProps) {
  return (
    <section className="rail">
      <div className="rail__header">
        <h2 className="rail__title">{title}</h2>
        {subtitle && <span className="rail__subtitle">{subtitle}</span>}
      </div>

      {error ? (
        <div className="rail__error">{error}</div>
      ) : loading ? (
        <div className="rail__track">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rail__skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rail__empty">{emptyState ?? 'Nothing to show here yet.'}</div>
      ) : (
        <div className="rail__track">
          {items.map((item) => (
            <PosterCard key={item.id} item={item} onSelect={onSelectItem} />
          ))}
        </div>
      )}
    </section>
  );
}
