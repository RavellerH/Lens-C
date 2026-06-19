export interface ItunesSearchResult {
  trackId: number;
  trackName: string;
  shortDescription?: string;
  longDescription?: string;
  releaseDate?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
  trackViewUrl?: string;
  country?: string;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesSearchResult[];
}

export interface ItunesRssImage {
  label: string;
  attributes?: { height?: string };
}

export interface ItunesRssTextNode {
  label: string;
}

export interface ItunesRssEntry {
  id: { label: string; attributes?: { 'im:id'?: string } };
  'im:name': ItunesRssTextNode;
  'im:artist'?: ItunesRssTextNode;
  'im:image'?: ItunesRssImage[];
  'im:releaseDate'?: ItunesRssTextNode;
  category?: { attributes?: { label?: string } };
  summary?: ItunesRssTextNode;
  link?: { attributes?: { href?: string } };
}

export interface ItunesRssResponse {
  feed?: {
    entry?: ItunesRssEntry[];
  };
}
