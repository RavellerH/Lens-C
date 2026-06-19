import type { MediaItem } from '../../types/media';
import type { RecencyMode } from '../../types/settings';
import type { UserProfile } from '../../types/user';
import { ageInYears } from '../../utils/formatters';

/** Age-band decay described in design.md: 0-2y highest boost, 10y+ low by default. */
function recencyScore(item: MediaItem): number {
  const age = ageInYears(item.year);
  if (age <= 2) return 1;
  if (age <= 5) return 0.75;
  if (age <= 10) return 0.45;
  return 0.15;
}

function popularityScore(item: MediaItem): number {
  // TMDb popularity is unbounded; compress it into a 0-1 range with a soft curve.
  return Math.min(1, Math.log10(item.popularity + 1) / 3);
}

function affinityScore(item: MediaItem, profile?: UserProfile): number {
  if (!profile) return 0;
  const genreScores = item.genres.map((genre) => profile.preferredGenres[genre] ?? 0);
  const dislikeScores = item.genres.map((genre) => profile.dislikedGenres[genre] ?? 0);
  const genreAffinity = genreScores.length ? genreScores.reduce((a, b) => a + b, 0) / genreScores.length : 0;
  const genreDislike = dislikeScores.length ? dislikeScores.reduce((a, b) => a + b, 0) / dislikeScores.length : 0;
  return Math.max(0, Math.min(1, genreAffinity - genreDislike));
}

function similarityScore(item: MediaItem, likedGenreSet: Set<string>): number {
  if (likedGenreSet.size === 0) return 0;
  const overlap = item.genres.filter((genre) => likedGenreSet.has(genre)).length;
  return Math.min(1, overlap / Math.max(2, likedGenreSet.size / 2));
}

/** Weights per recency mode. `d` (recency) and `e` (freshness) dominate New & Hot, fade out for Classics. */
const RECENCY_WEIGHTS: Record<RecencyMode, { a: number; b: number; c: number; d: number; e: number }> = {
  'new-and-hot': { a: 1, b: 0.6, c: 0.5, d: 1.4, e: 1 },
  balanced: { a: 1, b: 0.7, c: 0.6, d: 0.7, e: 0.5 },
  'all-time': { a: 1.1, b: 0.8, c: 0.7, d: 0.1, e: 0.1 },
  'classics-friendly': { a: 1.1, b: 0.8, c: 0.6, d: -0.4, e: -0.2 },
};

export interface ScoreContext {
  recencyMode: RecencyMode;
  userProfile?: UserProfile;
  likedGenres?: Set<string>;
}

export function scoreMediaItem(item: MediaItem, context: ScoreContext): number {
  const weights = RECENCY_WEIGHTS[context.recencyMode];
  const affinity = affinityScore(item, context.userProfile);
  const similarity = similarityScore(item, context.likedGenres ?? new Set());
  const popularity = popularityScore(item);
  const recency = recencyScore(item);
  const freshnessMomentum = recency * popularity;

  return (
    weights.a * affinity +
    weights.b * similarity +
    weights.c * popularity +
    weights.d * recency +
    weights.e * freshnessMomentum
  );
}

export function rankMediaItems(items: MediaItem[], context: ScoreContext): MediaItem[] {
  return [...items].sort((a, b) => scoreMediaItem(b, context) - scoreMediaItem(a, context));
}

export function explainRecommendation(item: MediaItem, context: ScoreContext): string {
  const age = ageInYears(item.year);
  if (context.likedGenres?.size && item.genres.some((g) => context.likedGenres!.has(g))) {
    return `Because you like ${item.genres.find((g) => context.likedGenres!.has(g))}`;
  }
  if (age <= 1) return 'New release';
  if (popularityScore(item) > 0.7) return 'Trending strongly this week';
  if (context.recencyMode === 'classics-friendly' && age > 10) return 'A classic worth revisiting';
  return 'Popular right now';
}
