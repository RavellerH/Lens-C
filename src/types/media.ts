export type MediaType = 'movie' | 'tv';

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profilePath?: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  originalTitle?: string;
  year?: number;
  releaseDate?: string;
  firstAirDate?: string;
  tvmazeId?: number;
  itunesId?: number;
  imdbId?: string;
  genres: string[];
  overview: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  runtime?: number;
  episodeCount?: number;
  seasonCount?: number;
  status?: string;
  originCountries?: string[];
  popularity: number;
  voteAverage?: number;
  cast?: CastMember[];
  crew?: CrewMember[];
  sourceFlags?: Record<string, boolean>;
  reason?: string;
}

export interface MediaDetail extends MediaItem {
  tagline?: string;
}
