import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../app/store/settingsStore';
import { useLibrary } from '../../app/store/libraryStore';
import { useCachedFetch } from '../../app/hooks/useCachedFetch';
import { tmdbAdapter } from '../../services/adapters/tmdb/tmdbAdapter';
import { buildUserProfile, topGenres } from '../../services/ranking/buildUserProfile';
import { explainRecommendation, rankMediaItems } from '../../services/ranking/scoring';
import type { MediaItem } from '../../types/media';
import { Rail } from '../../components/rails/Rail';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import { ApiKeyForm } from '../../components/forms/ApiKeyForm';
import './ForYouPage.css';

export function ForYouPage() {
  const { settings, hasTmdbKey } = useSettings();
  const { interactions, mediaById } = useLibrary();
  const [selected, setSelected] = useState<MediaItem | undefined>();

  const opts = useMemo(
    () => ({ apiKey: settings.tmdbApiKey, region: settings.region, language: settings.language }),
    [settings.tmdbApiKey, settings.region, settings.language],
  );
  const cacheKey = hasTmdbKey ? `${settings.region}:${settings.language}` : undefined;

  const popular = useCachedFetch(cacheKey && `foryou-popular:${cacheKey}`, () => tmdbAdapter.getPopularMovies(opts));
  const trendingTv = useCachedFetch(cacheKey && `foryou-tv:${cacheKey}`, () => tmdbAdapter.getTrendingTv(opts));
  const topRated = useCachedFetch(cacheKey && `foryou-top-rated:${cacheKey}`, () => tmdbAdapter.getTopRatedMovies(opts));

  const profile = useMemo(() => buildUserProfile(interactions, mediaById), [interactions, mediaById]);
  const hasProfile = interactions.length > 0;
  const likedGenres = useMemo(() => new Set(topGenres(profile, 5)), [profile]);

  const pool = useMemo(
    () => [...(popular.data ?? []), ...(trendingTv.data ?? []), ...(topRated.data ?? [])],
    [popular.data, trendingTv.data, topRated.data],
  );
  const watchedIds = useMemo(() => new Set(interactions.map((i) => i.mediaId)), [interactions]);
  const candidatePool = pool.filter((item) => !watchedIds.has(item.id));

  const ranked = rankMediaItems(candidatePool, { recencyMode: settings.defaultRecencyMode, userProfile: profile, likedGenres }).map(
    (item) => ({ ...item, reason: explainRecommendation(item, { recencyMode: settings.defaultRecencyMode, userProfile: profile, likedGenres }) }),
  );

  const topGenreList = Array.from(likedGenres);
  const loading = popular.loading || trendingTv.loading || topRated.loading;
  const error = popular.error || trendingTv.error || topRated.error;

  if (!hasTmdbKey) {
    return (
      <div className="for-you-page__intro">
        <h1>For You</h1>
        <p>Add your TMDb key to unlock personalized picks.</p>
        <ApiKeyForm />
      </div>
    );
  }

  return (
    <div className="for-you-page">
      <div className="for-you-page__intro">
        <h1>For You</h1>
        {hasProfile ? (
          <p>Tuned to {topGenreList.slice(0, 3).join(', ') || 'your taste'} from your imported history.</p>
        ) : (
          <p>
            Showing recently trending picks to start with. <Link to="/settings">Import your Letterboxd history</Link> for
            recommendations tuned to your taste.
          </p>
        )}
      </div>

      <Rail
        title={hasProfile ? 'Top Picks For You' : 'Recently Trending For You To Start With'}
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
