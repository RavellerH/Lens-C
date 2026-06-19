export interface TvmazeImage {
  medium?: string;
  original?: string;
}

export interface TvmazeShow {
  id: number;
  name: string;
  genres: string[];
  status?: string;
  premiered?: string | null;
  ended?: string | null;
  rating?: { average: number | null };
  image?: TvmazeImage | null;
  summary?: string | null;
  runtime?: number | null;
  externals?: { imdb?: string | null };
  _embedded?: {
    cast?: { person: { id: number; name: string; image?: TvmazeImage | null }; character?: { name: string } }[];
  };
}

export interface TvmazeSearchResult {
  score: number;
  show: TvmazeShow;
}

export interface TvmazeScheduleEntry {
  id: number;
  airdate: string;
  airtime: string;
  show: TvmazeShow;
}
