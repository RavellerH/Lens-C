// Co-locating the provider and its hook is the standard Context idiom; fast
// refresh just can't preserve state across edits to this file.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MediaItem } from '../../types/media';
import type { UserInteraction } from '../../types/user';
import { letterboxdImportAdapter, type LetterboxdEntry } from '../../services/adapters/letterboxd/letterboxdImportAdapter';
import { CONFIDENT_MATCH_THRESHOLD, findBestMatch } from '../../services/matching/titleMatcher';
import { itunesAdapter } from '../../services/adapters/itunes/itunesAdapter';
import { tvmazeAdapter } from '../../services/adapters/tvmaze/tvmazeAdapter';
import { loadImportData, saveImportData } from '../../services/cache/indexedDbCache';
import { useSettings } from './settingsStore';

const IMPORT_SOURCE = 'letterboxd';
const MAX_IMPORT_ENTRIES = 250;

interface LibraryData {
  interactions: UserInteraction[];
  mediaItems: MediaItem[];
}

interface ImportResult {
  matched: number;
  unmatched: number;
}

interface LibraryContextValue extends LibraryData {
  mediaById: Map<string, MediaItem>;
  importing: boolean;
  lastImportResult?: ImportResult;
  importLetterboxdFiles: (files: { name: string; text: string }[]) => Promise<ImportResult>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [data, setData] = useState<LibraryData>({ interactions: [], mediaItems: [] });
  const [importing, setImporting] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportResult>();

  useEffect(() => {
    loadImportData<LibraryData>(IMPORT_SOURCE).then((stored) => {
      if (stored) setData(stored);
    });
  }, []);

  const importLetterboxdFiles = useCallback(
    async (files: { name: string; text: string }[]): Promise<ImportResult> => {
      setImporting(true);
      try {
        const entryLists: LetterboxdEntry[][] = files.map((file) => letterboxdImportAdapter.parseDiaryOrRatings(file.text));
        const entries = letterboxdImportAdapter.mergeEntries(...entryLists).slice(0, MAX_IMPORT_ENTRIES);

        const opts = { region: settings.region };
        const mediaItems: MediaItem[] = [];
        const interactions: UserInteraction[] = [];
        let unmatched = 0;

        for (const entry of entries) {
          try {
            const [movieCandidates, tvCandidates] = await Promise.all([
              itunesAdapter.searchMovies(opts, entry.name).catch(() => []),
              tvmazeAdapter.searchShows(entry.name).catch(() => []),
            ]);
            const candidates = [...movieCandidates, ...tvCandidates];
            const best = findBestMatch(entry, candidates);
            if (!best || best.confidence < CONFIDENT_MATCH_THRESHOLD) {
              unmatched += 1;
              continue;
            }
            mediaItems.push(best.item);
            interactions.push({
              mediaId: best.item.id,
              source: 'letterboxd',
              watched: true,
              watchedDates: entry.watchedDate ? [entry.watchedDate] : [],
              ratingNormalized: entry.rating ? entry.rating / 5 : undefined,
              rewatchCount: entry.rewatch ? 1 : 0,
              watchlist: false,
              ignored: false,
              liked: (entry.rating ?? 0) >= 4,
              lastUpdated: new Date().toISOString(),
            });
          } catch {
            unmatched += 1;
          }
        }

        const next: LibraryData = { interactions, mediaItems };
        await saveImportData(IMPORT_SOURCE, next);
        setData(next);
        const result: ImportResult = { matched: interactions.length, unmatched };
        setLastImportResult(result);
        return result;
      } finally {
        setImporting(false);
      }
    },
    [settings.region],
  );

  const mediaById = useMemo(() => new Map(data.mediaItems.map((item) => [item.id, item])), [data.mediaItems]);

  const value = useMemo<LibraryContextValue>(
    () => ({ ...data, mediaById, importing, lastImportResult, importLetterboxdFiles }),
    [data, mediaById, importing, lastImportResult, importLetterboxdFiles],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
