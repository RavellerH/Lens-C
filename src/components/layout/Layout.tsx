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
        TV data powered by TVmaze.com · Movie data from Apple/iTunes ·{' '}
        <Link to="/about">About &amp; data sources</Link>
      </footer>
    </div>
  );
}
