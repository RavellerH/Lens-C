import type { MediaItem } from '../../../types/media';
import { yearFromDate } from '../../../utils/formatters';
import type { TvmazeScheduleEntry, TvmazeSearchResult, TvmazeShow } from './tvmazeTypes';

const API_BASE = 'https://api.tvmaze.com';

export interface TvmazeRequestOptions {
  region?: string;
}

function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').trim();
}

function normalizeShow(raw: TvmazeShow): MediaItem {
  const rating = raw.rating?.average ?? undefined;
  return {
    id: `tv-tvmaze-${raw.id}`,
    type: 'tv',
    tvmazeId: raw.id,
    title: raw.name,
    year: yearFromDate(raw.premiered ?? undefined),
    firstAirDate: raw.premiered ?? undefined,
    genres: raw.genres,
    overview: stripHtml(raw.summary),
    posterUrl: raw.image?.original ?? raw.image?.medium,
    backdropUrl: raw.image?.original ?? raw.image?.medium,
    status: raw.status,
    runtime: raw.runtime ?? undefined,
    imdbId: raw.externals?.imdb ?? undefined,
    // No true popularity metric on TVmaze; the 0-10 critic rating is the closest proxy.
    popularity: rating ? rating * 10 : 0,
    voteAverage: rating,
    cast: raw._embedded?.cast
      ?.slice(0, 8)
      .map((c) => ({ id: c.person.id, name: c.person.name, character: c.character?.name, profilePath: c.person.image?.medium })),
  };
}

async function searchShows(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const response = await fetch(`${API_BASE}/search/shows?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`TVmaze search failed (${response.status})`);
  const data = (await response.json()) as TvmazeSearchResult[];
  return data.map((result) => normalizeShow(result.show));
}

function dateOffset(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

async function getScheduleForDate(opts: TvmazeRequestOptions, date: string): Promise<MediaItem[]> {
  const country = opts.region ?? 'US';
  const response = await fetch(`${API_BASE}/schedule?country=${encodeURIComponent(country)}&date=${date}`);
  if (!response.ok) throw new Error(`TVmaze schedule failed (${response.status})`);
  const data = (await response.json()) as TvmazeScheduleEntry[];
  return data.map((entry) => normalizeShow(entry.show));
}

/** Shows airing today, deduped — the closest honest proxy for "currently airing". */
async function getOnTheAir(opts: TvmazeRequestOptions): Promise<MediaItem[]> {
  const items = await getScheduleForDate(opts, dateOffset(0));
  const seen = new Map<string, MediaItem>();
  for (const item of items) seen.set(item.id, item);
  return Array.from(seen.values());
}

/** Shows that aired sometime in the last week, ranked by rating — an honest "this week" proxy since TVmaze has no trending endpoint. */
async function getWeeklyTopShows(opts: TvmazeRequestOptions, limit = 25): Promise<MediaItem[]> {
  const days = Array.from({ length: 7 }, (_, i) => dateOffset(i));
  const results = await Promise.all(days.map((date) => getScheduleForDate(opts, date).catch(() => [])));
  const seen = new Map<string, MediaItem>();
  for (const items of results) {
    for (const item of items) seen.set(item.id, item);
  }
  return Array.from(seen.values())
    .filter((item) => (item.voteAverage ?? 0) > 0)
    .sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0))
    .slice(0, limit);
}

export interface TvmazeSchedule {
  airdate: string;
  airtime: string;
  name: string;
  season: number;
  number: number;
}

async function getNextEpisode(imdbId: string): Promise<TvmazeSchedule | null> {
  const response = await fetch(`${API_BASE}/lookup/shows?imdb=${encodeURIComponent(imdbId)}`);
  if (!response.ok) return null;
  const show = await response.json();
  if (!show?._links?.nextepisode?.href) return null;
  const episodeResponse = await fetch(show._links.nextepisode.href);
  if (!episodeResponse.ok) return null;
  return episodeResponse.json();
}

export const tvmazeAdapter = {
  searchShows,
  getOnTheAir,
  getWeeklyTopShows,
  getNextEpisode,
};
