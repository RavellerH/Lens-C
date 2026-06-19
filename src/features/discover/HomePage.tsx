import { useMemo, useState } from 'react';
import { useSettings } from '../../app/store/settingsStore';
import { useLibrary } from '../../app/store/libraryStore';
import { useCachedFetch } from '../../app/hooks/useCachedFetch';
import { tmdbAdapter } from '../../services/adapters/tmdb/tmdbAdapter';
import { explainRecommendation, rankMediaItems } from '../../services/ranking/scoring';
import type { MediaItem } from '../../types/media';
import { Rail } from '../../components/rails/Rail';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import { ApiKeyForm } from '../../components/forms/ApiKeyForm';
import { OnboardingBanner } from '../onboarding/OnboardingBanner';
import { HeroPanel } from './HeroPanel';
import './HomePage.css';

function withReasons(items: MediaItem[], recencyMode: ReturnType<typeof useSettings>['settings']['defaultRecencyMode']) {
  return items.map((item) => ({ ...item, reason: explainRecommendation(item, { recencyMode }) }));
}

export function HomePage() {
  const { settings, hasTmdbKey } = useSettings();
  const { interactions } = useLibrary();
  const [selected, setSelected] = useState<MediaItem | undefined>();

  const opts = useMemo(
    () => ({ apiKey: settings.tmdbApiKey, region: settings.region, language: settings.language }),
    [settings.tmdbApiKey, settings.region, settings.language],
  );
  const cacheKey = hasTmdbKey ? `${settings.region}:${settings.language}` : undefined;

  const trending = useCachedFetch(cacheKey && `trending:${cacheKey}`, () => tmdbAdapter.getTrendingMovies(opts));
  const trendingTv = useCachedFetch(cacheKey && `trending-tv:${cacheKey}`, () => tmdbAdapter.getTrendingTv(opts));
  const fresh = useCachedFetch(cacheKey && `now-playing:${cacheKey}`, () => tmdbAdapter.getNowPlayingMovies(opts));
  const onAir = useCachedFetch(cacheKey && `on-air:${cacheKey}`, () => tmdbAdapter.getOnTheAirTv(opts));
  const topRated = useCachedFetch(cacheKey && `top-rated:${cacheKey}`, () => tmdbAdapter.getTopRatedMovies(opts));

  const recencyMode = settings.defaultRecencyMode;
  const ranked = (items: MediaItem[] | undefined) =>
    items ? withReasons(rankMediaItems(items, { recencyMode }), recencyMode) : [];

  const rankedTrending = ranked(trending.data);
  const rankedTrendingTv = ranked(trendingTv.data);
  const rankedFresh = ranked(fresh.data);
  const rankedOnAir = ranked(onAir.data);
  const rankedTopRated = ranked(topRated.data).filter((item) => (item.year ?? 0) >= new Date().getFullYear() - 5);

  const heroItem = rankedTrending[0] ?? rankedTrendingTv[0];

  if (!hasTmdbKey) {
    return (
      <div className="home-page__setup">
        <h1>See what's trending in seconds.</h1>
        <p>
          CineWeave runs entirely in your browser — there's no account to create. Add a free TMDb key once and your
          personalized, recency-biased discovery feed unlocks instantly.
        </p>
        <ApiKeyForm />
      </div>
    );
  }

  return (
    <div className="home-page">
      {heroItem && <HeroPanel item={heroItem} onMoreInfo={setSelected} />}

      {interactions.length === 0 && <OnboardingBanner />}

      <Rail
        title="Trending This Week"
        subtitle="What everyone's watching right now"
        items={rankedTrending.slice(heroItem ? 1 : 0)}
        loading={trending.loading}
        error={trending.error}
        onSelectItem={setSelected}
      />
      <Rail
        title="Fresh Series"
        subtitle="Currently airing"
        items={rankedOnAir}
        loading={onAir.loading}
        error={onAir.error}
        onSelectItem={setSelected}
      />
      <Rail
        title="New & Hot Movies"
        subtitle="Now playing"
        items={rankedFresh}
        loading={fresh.loading}
        error={fresh.error}
        onSelectItem={setSelected}
      />
      <Rail
        title="Trending Series"
        items={rankedTrendingTv}
        loading={trendingTv.loading}
        error={trendingTv.error}
        onSelectItem={setSelected}
      />
      <Rail
        title="Critically Strong, Recently Released"
        subtitle="Top rated from the last 5 years"
        items={rankedTopRated}
        loading={topRated.loading}
        error={topRated.error}
        onSelectItem={setSelected}
      />

      {selected && <MediaDetailModal item={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
