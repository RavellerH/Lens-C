import type { MediaItem } from '../../../types/media';
import { yearFromDate } from '../../../utils/formatters';
import type {
  TmdbMovieResult,
  TmdbMultiSearchResult,
  TmdbPagedResponse,
  TmdbTvResult,
} from './tmdbTypes';

const API_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Standard TMDb genre ids are stable across the catalog, so we keep a local
// map to label list endpoints (which only return genre_ids) without an extra round trip.
const MOVIE_GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const TV_GENRES: Record<number, string> = {
  10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids', 9648: 'Mystery',
  10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics', 37: 'Western',
};

export class TmdbAuthError extends Error {
  constructor() {
    super('TMDb API key is missing or invalid.');
    this.name = 'TmdbAuthError';
  }
}

export class TmdbRateLimitError extends Error {
  constructor() {
    super('TMDb rate limit reached. Showing cached results instead.');
    this.name = 'TmdbRateLimitError';
  }
}

interface RequestOptions {
  apiKey: string;
  language?: string;
  region?: string;
}

async function tmdbFetch<T>(path: string, opts: RequestOptions, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(API_BASE + path);
  url.searchParams.set('api_key', opts.apiKey);
  url.searchParams.set('language', opts.language ?? 'en-US');
  if (opts.region) url.searchParams.set('region', opts.region);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (response.status === 401) throw new TmdbAuthError();
  if (response.status === 429) throw new TmdbRateLimitError();
  if (!response.ok) throw new Error(`TMDb request failed (${response.status})`);

  return response.json() as Promise<T>;
}

export function posterUrl(path?: string | null, size: 'w342' | 'w500' = 'w342'): string | undefined {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : undefined;
}

export function backdropUrl(path?: string | null, size: 'w780' | 'w1280' = 'w1280'): string | undefined {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : undefined;
}

function normalizeMovie(raw: TmdbMovieResult): MediaItem {
  const genreNames = raw.genres?.map((g) => g.name) ?? (raw.genre_ids ?? []).map((id) => MOVIE_GENRES[id]).filter(Boolean);
  return {
    id: `movie-${raw.id}`,
    type: 'movie',
    tmdbId: raw.id,
    title: raw.title,
    originalTitle: raw.original_title,
    year: yearFromDate(raw.release_date),
    releaseDate: raw.release_date,
    genres: genreNames,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    runtime: raw.runtime,
    popularity: raw.popularity,
    voteAverage: raw.vote_average,
    languages: raw.original_language ? [raw.original_language] : undefined,
    originCountries: raw.origin_country,
    cast: raw.credits?.cast?.slice(0, 8).map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })),
    crew: raw.credits?.crew?.filter((c) => c.job === 'Director').map((c) => ({ id: c.id, name: c.name, job: c.job })),
  };
}

function normalizeTv(raw: TmdbTvResult): MediaItem {
  const genreNames = raw.genres?.map((g) => g.name) ?? (raw.genre_ids ?? []).map((id) => TV_GENRES[id]).filter(Boolean);
  return {
    id: `tv-${raw.id}`,
    type: 'tv',
    tmdbId: raw.id,
    title: raw.name,
    originalTitle: raw.original_name,
    year: yearFromDate(raw.first_air_date),
    firstAirDate: raw.first_air_date,
    genres: genreNames,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    episodeCount: raw.number_of_episodes,
    seasonCount: raw.number_of_seasons,
    status: raw.status,
    popularity: raw.popularity,
    voteAverage: raw.vote_average,
    languages: raw.original_language ? [raw.original_language] : undefined,
    originCountries: raw.origin_country,
    cast: raw.credits?.cast?.slice(0, 8).map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })),
    crew: raw.credits?.crew?.filter((c) => c.job === 'Director' || c.job === 'Creator').map((c) => ({ id: c.id, name: c.name, job: c.job })),
  };
}

async function validateKey(apiKey: string): Promise<boolean> {
  try {
    await tmdbFetch('/authentication', { apiKey });
    return true;
  } catch {
    return false;
  }
}

async function getTrendingMovies(opts: RequestOptions, window: 'day' | 'week' = 'week'): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>(`/trending/movie/${window}`, opts);
  return data.results.map(normalizeMovie);
}

async function getTrendingTv(opts: RequestOptions, window: 'day' | 'week' = 'week'): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbTvResult>>(`/trending/tv/${window}`, opts);
  return data.results.map(normalizeTv);
}

async function getNowPlayingMovies(opts: RequestOptions): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>('/movie/now_playing', opts);
  return data.results.map(normalizeMovie);
}

async function getPopularMovies(opts: RequestOptions): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>('/movie/popular', opts);
  return data.results.map(normalizeMovie);
}

async function getOnTheAirTv(opts: RequestOptions): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbTvResult>>('/tv/on_the_air', opts);
  return data.results.map(normalizeTv);
}

async function getTopRatedMovies(opts: RequestOptions): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>('/movie/top_rated', opts);
  return data.results.map(normalizeMovie);
}

async function searchMulti(opts: RequestOptions, query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMultiSearchResult>>('/search/multi', opts, { query });
  return data.results
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
    .map((item) => (item.media_type === 'movie' ? normalizeMovie(item) : normalizeTv(item)));
}

async function getMovieDetail(opts: RequestOptions, tmdbId: number): Promise<MediaItem> {
  const data = await tmdbFetch<TmdbMovieResult>(`/movie/${tmdbId}`, opts, { append_to_response: 'credits' });
  return normalizeMovie(data);
}

async function getTvDetail(opts: RequestOptions, tmdbId: number): Promise<MediaItem> {
  const data = await tmdbFetch<TmdbTvResult>(`/tv/${tmdbId}`, opts, { append_to_response: 'credits' });
  return normalizeTv(data);
}

async function getSimilarMovies(opts: RequestOptions, tmdbId: number): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>(`/movie/${tmdbId}/similar`, opts);
  return data.results.map(normalizeMovie);
}

async function getSimilarTv(opts: RequestOptions, tmdbId: number): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbTvResult>>(`/tv/${tmdbId}/similar`, opts);
  return data.results.map(normalizeTv);
}

export const tmdbAdapter = {
  validateKey,
  getTrendingMovies,
  getTrendingTv,
  getNowPlayingMovies,
  getPopularMovies,
  getOnTheAirTv,
  getTopRatedMovies,
  searchMulti,
  getMovieDetail,
  getTvDetail,
  getSimilarMovies,
  getSimilarTv,
};
