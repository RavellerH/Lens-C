import { normalizeTitle } from '../../matching/titleMatcher';
import type { JustWatchOffer, JustWatchSearchItem, JustWatchSearchResponse } from './justwatchTypes';

const API_BASE = 'https://apis.justwatch.com';
const NETFLIX_SHORT_NAME = 'nfx';

export interface JustwatchRequestOptions {
  region?: string;
}

export interface StreamingOffer {
  providerShortName: string;
  monetizationType: string;
  url?: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  nfx: 'Netflix',
  amp: 'Amazon Prime Video',
  dnp: 'Disney+',
  hbo: 'Max',
  hbm: 'Max',
  atp: 'Apple TV+',
  hlu: 'Hulu',
  pmp: 'Paramount+',
  pck: 'Peacock',
};

function localeFor(region?: string): string {
  return `en_${region ?? 'US'}`;
}

function pickBestMatch(query: { name: string; year?: number }, items: JustWatchSearchItem[]): JustWatchSearchItem | undefined {
  const queryTitle = normalizeTitle(query.name);
  let best: { item: JustWatchSearchItem; score: number } | undefined;
  for (const item of items) {
    if (normalizeTitle(item.title) !== queryTitle) continue;
    const yearDiff = query.year && item.original_release_year ? Math.abs(query.year - item.original_release_year) : 1;
    const score = yearDiff === 0 ? 2 : yearDiff <= 1 ? 1 : 0;
    if (!best || score > best.score) best = { item, score };
  }
  return best?.item ?? items[0];
}

async function searchTitle(
  name: string,
  opts: JustwatchRequestOptions = {},
  year?: number,
): Promise<JustWatchSearchItem | undefined> {
  if (!name.trim()) return undefined;
  const response = await fetch(`${API_BASE}/content/titles/${localeFor(opts.region)}/popular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: name, page: 1, page_size: 5, content_types: ['movie', 'show'] }),
  });
  if (!response.ok) throw new Error(`JustWatch search failed (${response.status})`);
  const data = (await response.json()) as JustWatchSearchResponse;
  if (!data.items?.length) return undefined;
  return pickBestMatch({ name, year }, data.items);
}

function normalizeOffer(raw: JustWatchOffer): StreamingOffer | undefined {
  if (!raw.package_short_name) return undefined;
  return {
    providerShortName: raw.package_short_name,
    monetizationType: raw.monetization_type,
    url: raw.urls?.standard_web,
  };
}

/** Best-effort streaming availability. JustWatch's API is undocumented and may break or be CORS-blocked at any time — callers must treat a thrown error or empty result as "unknown," not "unavailable." */
async function getStreamingOffers(name: string, opts: JustwatchRequestOptions = {}, year?: number): Promise<StreamingOffer[]> {
  const match = await searchTitle(name, opts, year);
  if (!match?.offers) return [];
  const seen = new Set<string>();
  const offers: StreamingOffer[] = [];
  for (const raw of match.offers) {
    if (raw.monetization_type !== 'flatrate' && raw.monetization_type !== 'free' && raw.monetization_type !== 'ads') continue;
    const offer = normalizeOffer(raw);
    if (!offer || seen.has(offer.providerShortName)) continue;
    seen.add(offer.providerShortName);
    offers.push(offer);
  }
  return offers;
}

function labelFor(offer: StreamingOffer): string {
  return PROVIDER_LABELS[offer.providerShortName] ?? offer.providerShortName.toUpperCase();
}

async function isAvailableOnNetflix(name: string, opts: JustwatchRequestOptions = {}, year?: number): Promise<boolean> {
  const offers = await getStreamingOffers(name, opts, year);
  return offers.some((offer) => offer.providerShortName === NETFLIX_SHORT_NAME);
}

export const justwatchAdapter = {
  getStreamingOffers,
  isAvailableOnNetflix,
  labelFor,
};
