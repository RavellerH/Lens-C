import type { ReactNode } from 'react';
import { SettingsProvider } from '../store/settingsStore';
import { WatchlistProvider } from '../store/watchlistStore';
import { LibraryProvider } from '../store/libraryStore';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <WatchlistProvider>
        <LibraryProvider>{children}</LibraryProvider>
      </WatchlistProvider>
    </SettingsProvider>
  );
}
