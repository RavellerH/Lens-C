// Co-locating the provider and its hook is the standard Context idiom; fast
// refresh just can't preserve state across edits to this file.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MediaItem } from '../../types/media';
import { readLocal, writeLocal } from '../../utils/storage';

const WATCHLIST_KEY = 'watchlist';

interface WatchlistState {
  items: MediaItem[];
}

interface WatchlistContextValue {
  items: MediaItem[];
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WatchlistState>(() => readLocal(WATCHLIST_KEY, { items: [] }));

  const persist = (items: MediaItem[]) => {
    const next = { items };
    writeLocal(WATCHLIST_KEY, next);
    setState(next);
  };

  const isInWatchlist = (id: string) => state.items.some((item) => item.id === id);

  const toggleWatchlist = (item: MediaItem) => {
    if (isInWatchlist(item.id)) {
      persist(state.items.filter((existing) => existing.id !== item.id));
    } else {
      persist([item, ...state.items]);
    }
  };

  const removeFromWatchlist = (id: string) => {
    persist(state.items.filter((item) => item.id !== id));
  };

  const value: WatchlistContextValue = { items: state.items, isInWatchlist, toggleWatchlist, removeFromWatchlist };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
