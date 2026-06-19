import { useMemo, useState } from 'react';
import { useSettings } from '../../app/store/settingsStore';
import { useLibrary } from '../../app/store/libraryStore';
import { useCachedFetch } from '../../app/hooks/useCachedFetch';
import { itunesAdapter } from '../../services/adapters/itunes/itunesAdapter';
import { tvmazeAdapter } from '../../services/adapters/tvmaze/tvmazeAdapter';
import { explainRecommendation, rankMediaItems } from '../../services/ranking/scoring';
import type { MediaItem } from '../../types/media';
import { Rail } from '../../components/rails/Rail';
import { MediaDetailModal } from '../../components/modals/MediaDetailModal';
import { OnboardingBanner } from '../onboarding/OnboardingBanner';
import { HeroPanel } from './HeroPanel';
import './HomePage.css';

function withReasons(items: MediaItem[], recencyMode: ReturnType<typeof useSettings>['settings']['defaultRecencyMode']) {
  return items.map((item) => ({ ...item, reason: explainRecommendation(item, { recencyMode }) }));
}

export function HomePage() {
  const { settings } = useSettings();
  const { interactions } = useLibrary();
  const [selected, setSelected] = useState<MediaItem | undefined>();

  const opts = useMemo(() => ({ region: settings.region }), [settings.region]);
  const cacheKey = settings.region;

  const topMovies = useCachedFetch(`top-movies:${cacheKey}`, () => itunesAdapter.getTopMovies(opts));
  const onAir = useCachedFetch(`on-air:${cacheKey}`, () => tvmazeAdapter.getOnTheAir(opts));
  const topShows = useCachedFetch(`top-shows:${cacheKey}`, () => tvmazeAdapter.getWeeklyTopShows(opts));

  const recencyMode = settings.defaultRecencyMode;
  const ranked = (items: MediaItem[] | undefined) =>
    items ? withReasons(rankMediaItems(items, { recencyMode }), recencyMode) : [];

  const rankedTopMovies = ranked(topMovies.data);
  const rankedOnAir = ranked(onAir.data);
  const rankedTopShows = ranked(topShows.data);

  const heroItem = rankedTopMovies[0] ?? rankedTopShows[0];

  return (
    <div className="home-page">
      {heroItem && <HeroPanel item={heroItem} onMoreInfo={setSelected} />}

      {interactions.length === 0 && <OnboardingBanner />}

      <Rail
        title="Top Movies This Week"
        subtitle="Apple's movie charts"
        items={rankedTopMovies.slice(heroItem ? 1 : 0)}
        loading={topMovies.loading}
        error={topMovies.error}
        onSelectItem={setSelected}
      />
      <Rail
        title="Currently Airing"
        subtitle="Series with new episodes today"
        items={rankedOnAir}
        loading={onAir.loading}
        error={onAir.error}
        onSelectItem={setSelected}
      />
      <Rail
        title="Highly Rated This Week"
        subtitle="Top-rated series airing in the last 7 days"
        items={rankedTopShows}
        loading={topShows.loading}
        error={topShows.error}
        onSelectItem={setSelected}
      />

      {selected && <MediaDetailModal item={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
