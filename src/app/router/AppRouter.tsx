import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { HomePage } from '../../features/discover/HomePage';
import { ForYouPage } from '../../features/recommendations/ForYouPage';
import { LibraryPage } from '../../features/library/LibraryPage';
import { WatchlistPage } from '../../features/watchlist/WatchlistPage';
import { SearchPage } from '../../features/search/SearchPage';
import { SettingsPage } from '../../features/settings/SettingsPage';
import { AboutPage } from '../../features/about/AboutPage';

export function AppRouter() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/for-you" element={<ForYouPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
