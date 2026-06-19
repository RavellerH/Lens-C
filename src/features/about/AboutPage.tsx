import './AboutPage.css';

export function AboutPage() {
  return (
    <div className="about-page">
      <h1>About Lens C</h1>

      <section>
        <h2>What this is</h2>
        <p>
          Lens C is a static, browser-only movie and series recommendation app. There's no account system and no
          backend — your TMDb key, watchlist, and any imported history stay in your browser's local storage and
          IndexedDB.
        </p>
      </section>

      <section>
        <h2>Data sources</h2>
        <ul>
          <li>
            <strong>TMDb</strong> — metadata, posters, cast and crew, and discovery feeds (trending, popular, now playing,
            top rated).
          </li>
          <li>
            <strong>Letterboxd</strong> — optional CSV export import for personal watch and rating history.
          </li>
          <li>
            <strong>Trakt</strong> and <strong>TVmaze</strong> — planned integrations for community sync and episode-level
            enrichment.
          </li>
        </ul>
      </section>

      <section>
        <h2>TMDb attribution</h2>
        <p>
          This product uses the TMDb API but is not endorsed or certified by{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDb
          </a>
          . All movie and TV metadata, posters, and backdrops are provided by TMDb under their free, non-commercial API
          terms.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          Your TMDb key and any imported watch history are stored only on this device. Nothing is uploaded to a server
          we control. You can clear everything from the Settings page at any time.
        </p>
      </section>
    </div>
  );
}
