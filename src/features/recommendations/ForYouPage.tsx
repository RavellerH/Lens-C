import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../app/store/settingsStore';
import { useLibrary } from '../../app/store/libraryStore';
import { useCachedFetch } from '../../app/hooks/useCachedFetch';
import { itunesAdapter } from '../../services/adapters/itunes/itunesAdapter';
import { tvmazeAdapter } from '../../services/adapters/tvmaze/tvmazeAdapter';
import { buildUserProfile, topGenres } from '../../services/ranking/buildUserProfile';
import { explainRecommendation, rankMediaItems } from '../../services/ranking/scoring';
import type { MediaItem } from '../../types/media';
import { Rail } from '../../components/rails/Rail';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import './ForYouPage.css';

export function ForYouPage() {
  const { settings } = useSettings();
  const { interactions, mediaById } = useLibrary();
  const [selected, setSelected] = useState<MediaItem | undefined>();

  const opts = useMemo(() => ({ region: settings.region }), [settings.region]);
  const cacheKey = settings.region;

  const topMovies = useCachedFetch(`foryou-movies:${cacheKey}`, () => itunesAdapter.getTopMovies(opts));
  const topShows = useCachedFetch(`foryou-shows:${cacheKey}`, () => tvmazeAdapter.getWeeklyTopShows(opts));

  const profile = useMemo(() => buildUserProfile(interactions, mediaById), [interactions, mediaById]);
  const hasProfile = interactions.length > 0;
  const likedGenres = useMemo(() => new Set(topGenres(profile, 5)), [profile]);

  const pool = useMemo(() => [...(topMovies.data ?? []), ...(topShows.data ?? [])], [topMovies.data, topShows.data]);
  const watchedIds = useMemo(() => new Set(interactions.map((i) => i.mediaId)), [interactions]);
  const candidatePool = pool.filter((item) => !watchedIds.has(item.id));

  const ranked = rankMediaItems(candidatePool, { recencyMode: settings.defaultRecencyMode, userProfile: profile, likedGenres }).map(
    (item) => ({ ...item, reason: explainRecommendation(item, { recencyMode: settings.defaultRecencyMode, userProfile: profile, likedGenres }) }),
  );

  const topGenreList = Array.from(likedGenres);
  const loading = topMovies.loading || topShows.loading;
  const error = topMovies.error || topShows.error;

  return (
    <div className="for-you-page">
      <div className="for-you-page__intro">
        <h1>For You</h1>
        {hasProfile ? (
          <p>Tuned to {topGenreList.slice(0, 3).join(', ') || 'your taste'} from your imported history.</p>
        ) : (
          <p>
            Showing popular picks to start with. <Link to="/settings">Import your Letterboxd history</Link> for
            recommendations tuned to your taste.
          </p>
        )}
      </div>

      <Rail
        title={hasProfile ? 'Top Picks For You' : 'Popular Picks To Start With'}
        items={ranked.slice(0, 20)}
        loading={loading}
        error={error}
        onSelectItem={setSelected}
      />

      {hasProfile &&
        topGenreList.slice(0, 3).map((genre) => (
          <Rail
            key={genre}
            title={`Because you like ${genre}`}
            items={ranked.filter((item) => item.genres.includes(genre)).slice(0, 12)}
            onSelectItem={setSelected}
          />
        ))}

      {selected && <MediaDetailModal item={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
