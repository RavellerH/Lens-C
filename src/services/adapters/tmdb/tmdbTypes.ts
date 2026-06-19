export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
}

export interface TmdbMovieResult {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  release_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids?: number[];
  genres?: TmdbGenre[];
  popularity: number;
  vote_average: number;
  runtime?: number;
  original_language?: string;
  origin_country?: string[];
  tagline?: string;
  credits?: { cast: TmdbCastMember[]; crew: TmdbCrewMember[] };
}

export interface TmdbTvResult {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids?: number[];
  genres?: TmdbGenre[];
  popularity: number;
  vote_average: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
  origin_country?: string[];
  original_language?: string;
  tagline?: string;
  credits?: { cast: TmdbCastMember[]; crew: TmdbCrewMember[] };
}

export interface TmdbPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMultiSearchResult extends TmdbMovieResult, TmdbTvResult {
  media_type: 'movie' | 'tv' | 'person';
}
