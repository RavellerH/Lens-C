// Parses Letterboxd CSV exports (diary.csv, ratings.csv, watched.csv) into
// raw entries. Letterboxd exports have no stable TMDb id, so callers must run
// these through services/matching to resolve a MediaItem (see design.md).

export interface LetterboxdEntry {
  name: string;
  year?: number;
  rating?: number;
  rewatch: boolean;
  watchedDate?: string;
  letterboxdUri?: string;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...rest] = rows.filter((r) => r.some((cell) => cell.length > 0));
  if (!header) return [];

  return rest.map((cells) =>
    header.reduce<Record<string, string>>((acc, key, index) => {
      acc[key.trim()] = (cells[index] ?? '').trim();
      return acc;
    }, {}),
  );
}

function parseDiaryOrRatings(csvText: string): LetterboxdEntry[] {
  return parseCsv(csvText).map((row) => ({
    name: row['Name'],
    year: row['Year'] ? Number(row['Year']) : undefined,
    rating: row['Rating'] ? Number(row['Rating']) : undefined,
    rewatch: (row['Rewatch'] ?? '').toLowerCase() === 'yes',
    watchedDate: row['Watched Date'] || row['Date'],
    letterboxdUri: row['Letterboxd URI'],
  }));
}

function mergeEntries(...entryLists: LetterboxdEntry[][]): LetterboxdEntry[] {
  const byKey = new Map<string, LetterboxdEntry>();
  for (const entries of entryLists) {
    for (const entry of entries) {
      const key = `${entry.name.toLowerCase()}::${entry.year ?? 'unknown'}`;
      const existing = byKey.get(key);
      byKey.set(key, existing ? { ...existing, ...entry } : entry);
    }
  }
  return Array.from(byKey.values());
}

export const letterboxdImportAdapter = {
  parseCsv,
  parseDiaryOrRatings,
  mergeEntries,
};
