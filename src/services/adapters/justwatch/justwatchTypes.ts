// JustWatch has no official public API — this targets their undocumented
// content API (used by several open-source JustWatch clients). It can change
// or disappear without notice, so callers must treat failures as "unknown,"
// never as "not available."

export interface JustWatchOffer {
  monetization_type: 'flatrate' | 'free' | 'ads' | 'rent' | 'buy' | string;
  provider_id: number;
  package_short_name?: string;
  urls?: { standard_web?: string };
}

export interface JustWatchSearchItem {
  id: number;
  title: string;
  original_release_year?: number;
  object_type: 'movie' | 'show' | string;
  offers?: JustWatchOffer[];
}

export interface JustWatchSearchResponse {
  items: JustWatchSearchItem[];
  total_results: number;
}

export interface JustWatchProvider {
  id: number;
  short_name: string;
  clear_name: string;
}
