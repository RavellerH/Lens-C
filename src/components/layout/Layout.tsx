import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CommandBar } from './CommandBar';
import './Layout.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <CommandBar />
      <main className="layout__main">{children}</main>
      <footer className="layout__footer">
        This product uses the TMDb API but is not endorsed or certified by TMDb. ·{' '}
        <Link to="/about">About &amp; data sources</Link>
      </footer>
    </div>
  );
}
