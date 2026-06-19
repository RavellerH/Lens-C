import { useState, type FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './CommandBar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/for-you', label: 'For You' },
  { to: '/library', label: 'Library' },
  { to: '/watchlist', label: 'Watchlist' },
];

export function CommandBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="command-bar">
      <NavLink to="/" className="command-bar__brand" end>
        Cine<span>Weave</span>
      </NavLink>
      <nav className="command-bar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `command-bar__link${isActive ? ' command-bar__link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <form className="command-bar__search" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Search movies & series"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search movies and series"
        />
      </form>
      <NavLink to="/settings" className="command-bar__settings">
        Settings
      </NavLink>
    </header>
  );
}
