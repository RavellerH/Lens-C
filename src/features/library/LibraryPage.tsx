import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../app/store/libraryStore';
import { PosterCard } from '../../components/cards/PosterCard';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import type { MediaItem } from '../../types/media';
import './LibraryPage.css';

export function LibraryPage() {
  const { interactions, mediaById } = useLibrary();
  const [selected, setSelected] = useState<MediaItem | undefined>();

  const items = interactions
    .map((interaction) => mediaById.get(interaction.mediaId))
    .filter((item): item is MediaItem => Boolean(item));

  return (
    <div className="library-page">
      <div className="library-page__header">
        <h1>Library</h1>
        <span>{items.length} titles</span>
      </div>

      {items.length === 0 ? (
        <div className="library-page__empty">
          Nothing here yet. <Link to="/settings">Import your Letterboxd export</Link> to bring in your watch history.
        </div>
      ) : (
        <div className="library-page__grid">
          {items.map((item) => (
            <PosterCard key={item.id} item={item} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && <MediaDetailModal item={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
