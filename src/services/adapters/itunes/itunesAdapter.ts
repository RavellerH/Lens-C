import type { MediaItem } from '../../../types/media';
import { yearFromDate } from '../../../utils/formatters';
import type { ItunesRssEntry, ItunesRssResponse, ItunesSearchResponse, ItunesSearchResult } from './itunesTypes';

const SEARCH_BASE = 'https://itunes.apple.com/search';
const RSS_BASE = 'https://itunes.apple.com';

export interface ItunesRequestOptions {
  region?: string;
}

function upscaleArtwork(url?: string, size = 600): string | undefined {
  if (!url) return undefined;
  return url.replace(/\d+x\d+bb/, `${size}x${size}bb`);
}

function normalizeSearchResult(raw: ItunesSearchResult): MediaItem {
  return {
    id: `movie-itunes-${raw.trackId}`,
    type: 'movie',
    itunesId: raw.trackId,
    title: raw.trackName,
    year: yearFromDate(raw.releaseDate),
    releaseDate: raw.releaseDate,
    genres: raw.primaryGenreName ? [raw.primaryGenreName] : [],
    overview: raw.longDescription ?? raw.shortDescription ?? '',
    posterUrl: upscaleArtwork(raw.artworkUrl100),
    backdropUrl: upscaleArtwork(raw.artworkUrl100),
    runtime: raw.trackTimeMillis ? Math.round(raw.trackTimeMillis / 60000) : undefined,
    popularity: 1,
  };
}

function normalizeRssEntry(raw: ItunesRssEntry, rank: number, total: number): MediaItem | undefined {
  const id = Number(raw.id?.attributes?.['im:id']);
  if (!id || !raw['im:name']?.label) return undefined;
  const images = raw['im:image'] ?? [];
  const artwork = images[images.length - 1]?.label;
  return {
    id: `movie-itunes-${id}`,
    type: 'movie',
    itunesId: id,
    title: raw['im:name'].label,
    year: yearFromDate(raw['im:releaseDate']?.label),
    releaseDate: raw['im:releaseDate']?.label,
    genres: raw.category?.attributes?.label ? [raw.category.attributes.label] : [],
    overview: raw.summary?.label ?? '',
    posterUrl: upscaleArtwork(artwork),
    backdropUrl: upscaleArtwork(artwork),
    // Rank-based proxy: chart position 1 maps near the top of the popularity
    // curve scoring.ts compresses with log10, trailing positions decay toward it.
    popularity: Math.max(1, (total - rank)) * 20,
  };
}

async function searchMovies(opts: ItunesRequestOptions, query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const url = new URL(SEARCH_BASE);
  url.searchParams.set('term', query);
  url.searchParams.set('media', 'movie');
  url.searchParams.set('entity', 'movie');
  url.searchParams.set('limit', '20');
  if (opts.region) url.searchParams.set('country', opts.region);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`iTunes search failed (${response.status})`);
  const data = (await response.json()) as ItunesSearchResponse;
  return data.results.map(normalizeSearchResult);
}

async function getTopMovies(opts: ItunesRequestOptions, limit = 25): Promise<MediaItem[]> {
  const country = (opts.region ?? 'US').toLowerCase();
  const url = `${RSS_BASE}/${country}/rss/topmovies/limit=${limit}/json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`iTunes top movies feed failed (${response.status})`);
  const data = (await response.json()) as ItunesRssResponse;
  const entries = data.feed?.entry ?? [];
  return entries
    .map((entry, index) => normalizeRssEntry(entry, index, entries.length))
    .filter((item): item is MediaItem => item !== undefined);
}

export const itunesAdapter = {
  searchMovies,
  getTopMovies,
};
