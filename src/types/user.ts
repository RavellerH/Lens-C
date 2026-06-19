export type InteractionSource = 'letterboxd' | 'trakt' | 'local';

export interface UserInteraction {
  mediaId: string;
  source: InteractionSource;
  watched: boolean;
  watchedDates: string[];
  ratingNormalized?: number;
  rewatchCount: number;
  watchlist: boolean;
  reviewSnippet?: string;
  ignored: boolean;
  liked: boolean;
  lastUpdated: string;
}

export interface UserProfile {
  preferredGenres: Record<string, number>;
  dislikedGenres: Record<string, number>;
  preferredDirectors: Record<string, number>;
  preferredActors: Record<string, number>;
  preferredNetworks: Record<string, number>;
  preferredEras: Record<string, number>;
  recencyPreference: number;
  ratingDistribution: Record<number, number>;
  completionBias: number;
  seriesVsMovieBias: number;
}

export const EMPTY_USER_PROFILE: UserProfile = {
  preferredGenres: {},
  dislikedGenres: {},
  preferredDirectors: {},
  preferredActors: {},
  preferredNetworks: {},
  preferredEras: {},
  recencyPreference: 0.6,
  ratingDistribution: {},
  completionBias: 0.5,
  seriesVsMovieBias: 0,
};
