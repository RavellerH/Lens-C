// TVmaze enrichment adapter (Phase 1 stub). Wired in for airing schedule and
// episode-level detail once the TMDb-driven core experience is stable (see design.md, Open questions).
const API_BASE = 'https://api.tvmaze.com';

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
  getNextEpisode,
};
