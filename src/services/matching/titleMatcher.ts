import type { MediaItem } from '../../types/media';

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Confidence in [0, 1]. Exact normalized title + year match scores highest. */
export function matchConfidence(query: { name: string; year?: number }, candidate: MediaItem): number {
  const queryTitle = normalizeTitle(query.name);
  const candidateTitle = normalizeTitle(candidate.title);
  const candidateOriginal = candidate.originalTitle ? normalizeTitle(candidate.originalTitle) : undefined;

  const titleMatches = queryTitle === candidateTitle || queryTitle === candidateOriginal;
  if (!titleMatches) return 0;

  if (!query.year || !candidate.year) return 0.6;
  const yearDiff = Math.abs(query.year - candidate.year);
  if (yearDiff === 0) return 1;
  if (yearDiff === 1) return 0.7;
  return 0.3;
}

export function findBestMatch(
  query: { name: string; year?: number },
  candidates: MediaItem[],
): { item: MediaItem; confidence: number } | undefined {
  let best: { item: MediaItem; confidence: number } | undefined;
  for (const candidate of candidates) {
    const confidence = matchConfidence(query, candidate);
    if (!best || confidence > best.confidence) {
      best = { item: candidate, confidence };
    }
  }
  return best && best.confidence > 0 ? best : undefined;
}

export const CONFIDENT_MATCH_THRESHOLD = 0.6;
