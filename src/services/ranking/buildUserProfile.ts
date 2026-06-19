import type { MediaItem } from '../../types/media';
import type { UserInteraction } from '../../types/user';
import { EMPTY_USER_PROFILE, type UserProfile } from '../../types/user';

/** Builds a lightweight taste profile from imported/synced interactions (design.md, Scenario 3). */
export function buildUserProfile(interactions: UserInteraction[], mediaById: Map<string, MediaItem>): UserProfile {
  const genreWeight: Record<string, number> = {};
  const dislikedGenreWeight: Record<string, number> = {};
  let totalWeight = 0;

  for (const interaction of interactions) {
    const item = mediaById.get(interaction.mediaId);
    if (!item) continue;

    const rating = interaction.ratingNormalized ?? 0.6;
    const weight = interaction.liked ? 1.2 : rating;
    totalWeight += 1;

    for (const genre of item.genres) {
      if (rating >= 0.5 || interaction.liked) {
        genreWeight[genre] = (genreWeight[genre] ?? 0) + weight;
      } else {
        dislikedGenreWeight[genre] = (dislikedGenreWeight[genre] ?? 0) + (1 - rating);
      }
    }
  }

  const normalize = (weights: Record<string, number>): Record<string, number> => {
    const max = Math.max(1, ...Object.values(weights));
    return Object.fromEntries(Object.entries(weights).map(([genre, value]) => [genre, value / max]));
  };

  if (totalWeight === 0) return EMPTY_USER_PROFILE;

  return {
    ...EMPTY_USER_PROFILE,
    preferredGenres: normalize(genreWeight),
    dislikedGenres: normalize(dislikedGenreWeight),
  };
}

export function topGenres(profile: UserProfile, limit = 3): string[] {
  return Object.entries(profile.preferredGenres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre);
}
