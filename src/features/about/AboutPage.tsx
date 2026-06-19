import './AboutPage.css';

export function AboutPage() {
  return (
    <div className="about-page">
      <h1>About Lens C</h1>

      <section>
        <h2>What this is</h2>
        <p>
          Lens C is a static, browser-only movie and series recommendation app. There's no account system, no
          backend, and no API key to set up — your watchlist and any imported history stay in your browser's local
          storage and IndexedDB.
        </p>
      </section>

      <section>
        <h2>Data sources</h2>
        <ul>
          <li>
            <strong>TVmaze</strong> — TV show metadata, posters, cast, ratings, and the daily airing schedule.
          </li>
          <li>
            <strong>Apple / iTunes</strong> — movie metadata, artwork, and the Top Movies charts used for trending
            picks.
          </li>
          <li>
            <strong>Letterboxd</strong> — optional CSV export import for personal watch and rating history.
          </li>
          <li>
            <strong>Trakt</strong> — planned integration for community sync.
          </li>
        </ul>
      </section>

      <section>
        <h2>Attribution</h2>
        <p>
          TV data is powered by{' '}
          <a href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">
            TVmaze.com
          </a>
          . Movie data and artwork come from the Apple iTunes Search and RSS APIs. Neither service requires a key or
          account — that's what keeps Lens C usable instantly, with no setup step.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          Your watchlist and any imported watch history are stored only on this device. Nothing is uploaded to a
          server we control. You can clear everything from the Settings page at any time.
        </p>
      </section>
    </div>
  );
}
