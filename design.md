# design.md

## Project

**Working title:** Lens C
**Tagline:** A cinematic movie and series recommendation app that feels instant, personal, and current.

Lens C is a static-first recommendation web app for movies and TV series built with React + Vite and deployed on GitHub Pages. The app uses free, key-free sources only in the MVP: TVmaze for TV metadata and discovery, Apple's iTunes Search/RSS APIs for movie metadata and charts, Trakt for optional community and personal sync, and Letterboxd CSV exports for personal watch history import.

The product goal is to make recommendations feel seamless from the first visit. Users should see relevant content immediately, with no hard requirement to sign in, paste a key, or upload files before the app becomes useful. Personalization is layered in gently afterward through optional Trakt connection and Letterboxd CSV import.

The product should also prefer newer movies and series by default so recommendations feel timely and socially relevant. Older titles remain available, but the ranking and defaults should bias toward recent releases, recent seasons, and current audience momentum.

## Product principles

### Instant value

The app must be useful on first load. A new visitor should land on a beautiful home screen and immediately see curated recent and trending titles without friction. No login wall, no giant setup step, no blank dashboard.

### Soft personalization

The app should progressively improve rather than block. It starts with public discovery, then offers low-pressure enhancements:

- Connect Trakt for history and watchlist.
- Upload a Letterboxd export for deeper taste modeling.

### Recent-first relevance

Recommendations should favor new and currently discussed titles unless the user explicitly asks for classics. This applies to:

- Home feed
- Trending rails
- Search suggestions
- Recommendation ranking
- "Because you liked..." outputs

### Static-first architecture

The MVP runs entirely in the browser and is hosted on GitHub Pages. There is no custom backend in the initial version, which keeps cost at zero and aligns with a local-first, privacy-respecting approach.

### Future portability

Even though the MVP is static, the architecture should separate UI, provider adapters, and recommendation logic so the app can later move to a backend-enabled commercial architecture if needed. This matters especially because TMDb's free tier is non-commercial and monetization may require changes later.

## Goals

### Primary goals

- Build a polished movie and series recommendation app with a modern cinematic look and feel.
- Deliver instant recommendations with no required account creation and no API key setup.
- Use only free, key-free data sources in MVP: TVmaze, Apple iTunes Search/RSS, Trakt free API, Letterboxd CSV import, optional MovieLens offline data.
- Make recommendations skew toward newer and relevant titles by default.
- Host entirely on GitHub Pages with React + Vite and hash routing.

### Secondary goals

- Support both movies and TV series, not just films.
- Give understandable recommendation reasons, not just opaque lists.
- Keep user data local to the browser whenever possible.
- Make the codebase Claude Code friendly, modular, and easy to scaffold in GitHub.

### Non-goals for MVP

- No social network features such as comments, following, or messaging.
- No custom account system.
- No server-hosted recommendation model.
- No scraping-based data acquisition.
- No commercial launch using a provider's free non-commercial tier without revisiting terms.

## Target users

### Primary user

A movie/series enthusiast who wants fast, aesthetically pleasing recommendations without creating another account. They like seeing what is trending now, what is new this year, and what fits their taste once they connect some history.

### Secondary user

A power user who tracks media on Trakt or Letterboxd and wants stronger recommendations, better discovery, and a more attractive interface than a utility tracker.

### User assumptions

- Users understand mainstream movie/TV browsing patterns.
- Some users will not have Trakt or Letterboxd data ready.
- Users expect the app to work immediately, with zero setup steps before first value.
- The experience should feel closer to a streaming app than a spreadsheet.

## Experience vision

The app should feel like a mix of a premium streaming service landing page, a discovery engine, and a personal recommendation notebook.

The design language should be dark, poster-led, cinematic, and smooth. Large hero areas, horizontal content rails, subtle gradients, rich cards, and restrained micro-interactions should make the experience feel premium without becoming visually noisy.

The user should never wonder "what do I do now?" Every screen should present strong defaults, clear actions, and visible value.

## Core scenarios

### Scenario 1: Guest user, zero setup

1. User opens the app.
2. They immediately see: New & Hot Movies, Fresh Series, Trending This Week, Popular in US.
3. They click a title and open its detail modal/page.
4. They see a "Why this is trending" or "Because audiences are watching this now" explanation.
5. They optionally add it to a local watchlist.

This scenario must work with no imports and no auth, assuming at least public discovery data is available.

### Scenario 2: User imports Letterboxd export

1. User uploads CSV files from Letterboxd.
2. App parses diary, ratings, and watched entries.
3. App matches titles against iTunes (movies) and TVmaze (TV) using title + year.
4. App calculates a taste profile: favorite genres, recency patterns, rating behavior.
5. Recommendations update to "For You" mode.

### Scenario 4: User connects Trakt

1. User authorizes Trakt via OAuth2.
2. App syncs watch history, ratings, and watchlist.
3. App merges Trakt and Letterboxd-derived taste signals.
4. App adds community-aware recommendations from trending and popular community signals.

## Information architecture

Top-level routes use hash routing for GitHub Pages compatibility, such as `/#/discover` and `/#/settings`, because GitHub Pages does not natively support SPA route fallback in the same way as a custom server.

### Main routes

- `/#/` — Home / Discover landing
- `/#/for-you` — Personalized recommendations
- `/#/library` — Imported/synced user history
- `/#/watchlist` — Local watchlist and optional Trakt watchlist view
- `/#/search` — Search and quick discovery
- `/#/settings` — sources, region, personalization options
- `/#/about` — Data sources, privacy, attribution, disclaimers

### Route roles

**Home** — A cinematic landing page with immediate recommendations and no blockers.

**For You** — The primary personalized view. If user data is missing, it gracefully degrades to "recently trending for you to start with."

**Library** — A browsable history of watched/rated/imported items with filters and source badges.

**Watchlist** — Locally stored items and, if available, imported Trakt watchlist.

**Search** — Cross-source search across iTunes movie search and TVmaze show search, plus local history.

**Settings** — The operational heart of the app. This is where users connect Trakt, manage imports, set recency preference, and choose region.

**About** — Must include TVmaze and Apple/iTunes attribution language and credits as required.

## Data sources

### TVmaze

TVmaze is the main TV metadata and discovery provider. It supplies show metadata, genres, cast, ratings, posters, and the daily airing schedule — all without an API key. No "trending" endpoint exists, so the app derives a "this week" proxy by merging the last 7 days of schedule data and ranking by rating.

Constraints: free, keyless, but no continuous popularity metric — the rating-based proxy is a heuristic, not true trending data. TVmaze's terms ask for a "Powered by TVmaze.com" credit/link.

### Apple / iTunes

Apple's iTunes Search API and RSS charts are the movie metadata and discovery provider. Search supplies title, overview, artwork, release date, and runtime. The Top Movies RSS chart supplies a rank-ordered "trending" proxy. No API key or account is required.

Constraints: no cast/crew data, no "similar titles" endpoint, weaker region/language filtering than a dedicated metadata provider, artwork quality varies by title.

### Trakt

Trakt is the optional sync/community provider. It supplies watch history, ratings, watchlist, public lists, and community-oriented discovery and popularity context.

Constraints: OAuth2 required, free-tier usage limits exist, the app should degrade gracefully if limits are reached.

### Letterboxd export

Letterboxd contributes user-owned watch and rating history through CSV import. Useful files include `diary.csv`, `ratings.csv`, `watched.csv`.

Constraints: no stable ids into iTunes/TVmaze in the export, must match by title + year, no official public app API for this use case.

### MovieLens

MovieLens can be used offline for testing algorithms, calibrating similarity, or shipping lightweight precomputed recommendation helpers in future phases.

### JustWatch (streaming availability, best-effort)

The media detail modal shows a "Where to watch" section, sourced from JustWatch's undocumented content API (no key, no signup — but also no official support contract). It's used for a single per-title lookup when a user opens detail, never for bulk rail filtering, to avoid hammering an API we don't have a real agreement with.

Constraints: unofficial and reverse-engineered — endpoint shape, rate limits, or CORS behavior could change or break without notice. The app treats any failure (network error, CORS block, empty/unexpected response) as "unknown availability" and simply omits the section, never as "not available." Netflix gets a visual highlight when present since it's the most commonly requested provider, but the same lookup surfaces whatever providers JustWatch returns (Prime Video, Max, Disney+, etc.).

## Data model

The app is client-first and stores most working data in memory plus local browser storage.

### Core entities

**MediaItem** — represents a movie or TV series enriched from external providers.

Fields: `id`, `type` (movie | tv), `title`, `originalTitle`, `year`, `releaseDate`, `firstAirDate`, `tvmazeId`, `itunesId`, `imdbId`, `genres[]`, `overview`, `posterUrl`, `backdropUrl`, `runtime`, `episodeCount`, `seasonCount`, `status`, `originCountries[]`, `popularity`, `voteAverage`, `cast[]`, `crew[]`, `sourceFlags`. `posterUrl`/`backdropUrl` are full absolute URLs returned directly by the source adapter (no path + base-URL helper needed, unlike TMDb).

**UserInteraction** — represents the user's relationship to a title.

Fields: `mediaId`, `source` (letterboxd | trakt | local), `watched`, `watchedDates[]`, `ratingNormalized`, `rewatchCount`, `watchlist`, `reviewSnippet`, `ignored`, `liked`, `lastUpdated`.

**UserProfile** — a computed taste model.

Fields: `preferredGenres`, `dislikedGenres`, `preferredDirectors`, `preferredActors`, `preferredNetworks`, `preferredEras`, `recencyPreference`, `ratingDistribution`, `completionBias`, `seriesVsMovieBias`.

**AppSettings**

Fields: `region`, `theme`, `defaultRecencyMode`, `includeMature`, `useTrakt`, `traktToken`, `showExplanations`, `enableAnimations`.

### Storage strategy

- `localStorage` for: app settings, small user preferences, lightweight local watchlist state.
- `IndexedDB` for: cached metadata responses, imported Letterboxd data, merged normalized history, recommendation cache.

This avoids pushing too much into localStorage and helps performance for larger libraries.

## Provider architecture

The codebase isolates API and import logic in adapters: `itunesAdapter`, `tvmazeAdapter`, `traktAdapter`, `letterboxdImportAdapter`.

Each adapter exposes: fetch/search methods, normalization methods, error handling, and result mapping into shared internal entities.

This keeps the app flexible if later you add OMDb or JustWatch-like data, move logic server-side for monetization, or need to support multiple recommendation backends.

## Recommendation system

The app needs recommendations that feel current, understandable, and useful even with sparse user data.

### Strategy layers

**Layer 1: Public discovery** — for zero-setup users: trending movies, trending TV, now playing, upcoming, popular, top-rated recent content.

**Layer 2: Taste profile** — for imported or synced users: weighted genre affinity, creator affinity, format preference, release-era preference, rating strictness.

**Layer 3: Similarity engine** — recommend items based on shared genres, shared director, shared lead cast, similar tone proxy via metadata, popularity overlap, release recency proximity.

**Layer 4: Recency bias** — a first-class part of the ranking system, not a minor tie-breaker.

### Recency scoring

The app prioritizes recent titles unless a user switches to "All Time" or "Classics" mode.

Suggested age bands:

- 0–2 years: highest boost
- 3–5 years: high boost
- 6–10 years: moderate
- 10+ years: low by default unless otherwise favored by strong taste match

Recommended scoring formula:

```
score(B) = a * affinity(B) + b * similarity(B) + c * popularity(B) + d * recency(B) + e * freshnessMomentum(B)
```

Where:

- `affinity(B)` = alignment with user profile
- `similarity(B)` = overlap with liked titles
- `popularity(B)` = current broad audience signal
- `recency(B)` = age decay score
- `freshnessMomentum(B)` = current trend strength or recent release boost

### Default ranking behavior

For a new user, the defaults are: region = US, language = en, mode = New & Hot, release window = last 5 years, content mix = recent mainstream + critically strong recent picks.

### User controls for recency

The user can switch among New & Hot, Balanced, All Time, Classics Friendly. Default remains New & Hot.

## Personalization logic

**With no imported history** — recommendations are public and chart/rating-based: top movie charts, highly-rated current TV, genre filters.

**If Letterboxd is imported** — build profile from ratings, watched dates, rewatches, tags if available.

**If Trakt is connected** — add watchlist intent, TV-series behavior, community-aware ranking.

### Merge rules

If multiple sources disagree:

- prefer explicit user rating over popularity
- prefer more recent watched/rated state
- do not duplicate the same title across sources
- preserve source badges for transparency

## Search and matching

### Search modes

- Global content search via iTunes (movies) and TVmaze (TV)
- Local library search
- Search-as-discovery suggestions

### Matching Letterboxd to iTunes/TVmaze

Because Letterboxd export lacks stable ids into either source, use: normalized title, year match, alternative title fallback, confidence score.

If confidence is low: show a review queue, let the user confirm a few ambiguous matches.

## UI design system

### Visual direction

The UI should feel cinematic and modern: dark surfaces, soft gradients, large poster art, roomy spacing, glossy but restrained highlights.

### Color system

- Base: deep charcoal / near-black backgrounds, slate panels, muted text grays
- Accent: electric blue or teal for action, magenta or amber sparingly for status and mood
- Semantic: green for watchlist success, red for unavailable/error, gold for top picks

### Typography

- Large display headings for hero and rails
- Clean sans-serif body text
- Tight metadata chips
- Numeric emphasis for rating and year

### Component style

**PosterCard** — 2:3 poster ratio, gradient overlay, hover lift and glow, metadata row (year, type, rating), optional rationale chip ("Trending", "Because you liked sci-fi", "Fresh season").

**HeroPanel** — full-width or large split layout, backdrop image with overlay, title, synopsis, CTAs, optional "Why this is for you".

**Rail** — horizontally scrollable, lazy-loaded images, keyboard and touch friendly.

**CommandBar** — persistent top search and quick actions, access to settings, library, import, and connect actions.

**SettingsSheet** — compact, polished settings flow instead of an admin form, clear sections, inline validation, save feedback.

## UX rules

**Never hard-block first use.** The app loads straight into a fully working discovery feed — no key, signup, or setup step. If a data fetch genuinely fails, show demo placeholders or a graceful explainer rather than an empty app.

**Ask only when helpful.** The app should not bombard users with setup prompts. Use contextual nudges — after browsing, suggest importing Letterboxd history or connecting Trakt for stronger results.

**Explain recommendations simply.** Every recommendation card or detail view has a short reason, like "Because you like recent sci-fi", "Popular this week", "New season in a genre you rate highly".

**Avoid dead ends.** Every empty state includes a next action: import Letterboxd, connect Trakt, browse trending, search by title.

## Onboarding and settings

### First-visit experience

Home opens with a cinematic hero section, trending/recent rows, and a subtle banner: "Make this personal in 30 seconds."

### Settings sections

Region, theme, recency mode, data sources, privacy and local storage controls, reset app data.

## Pages in detail

**Home** — immediate delight, no-friction discovery. Sections: hero spotlight, top movies this week, currently airing series, highly rated series this week, improve-your-feed prompt.

**For You** — main recommendation destination. Sections: top picks for you, because you liked X, new series you may like, fresh releases matching your favorite genres, hidden gems this year.

**Library** — personal media memory. Features: grid/list switch, filters by source/type/genre/rating/year, watched and rewatch badges, search within library.

**Watchlist** — intent management. Features: local watchlist, imported Trakt watchlist view if available, sort by newest/popularity/runtime.

**Search** — direct lookup and discovery. Features: instant suggestions, result tabs for movies/series, recent searches, "search and recommend" flow.

**Settings** — configuration without friction. Features: source management (Letterboxd, Trakt), recency preference, local cache clear, appearance controls.

## Technical architecture

### Frontend stack

- React + Vite
- React Router with `HashRouter` for GitHub Pages compatibility
- TypeScript strongly preferred for maintainability
- Lightweight global state via Context + hooks (Zustand-style stores)
- Framer Motion optional for subtle transitions

### Folder structure

```
src/
  app/
    router/
    providers/
    store/
  components/
    cards/
    rails/
    layout/
    modals/
    forms/
  features/
    discover/
    recommendations/
    library/
    watchlist/
    search/
    settings/
    onboarding/
  services/
    adapters/
      itunes/
      trakt/
      tvmaze/
      letterboxd/
    ranking/
    matching/
    cache/
  types/
  utils/
  styles/
```

### Routing

Use hash routing because GitHub Pages does not natively support standard SPA history routing without workarounds.

### Caching

- Persist expensive metadata fetches in IndexedDB
- Cache recommendation results by settings fingerprint
- Revalidate stale data lazily

### Performance

- Lazy-load poster images
- Virtualize long lists
- Debounce search
- Chunk import parsing
- Avoid duplicate API requests

## GitHub Pages constraints

GitHub Pages has a soft bandwidth limit of 100 GB/month and a soft limit of 10 builds/hour, with recommended repository and published site size considerations around 1 GB. Because of this: keep assets optimized, avoid shipping large offline datasets directly, do heavy preprocessing outside the published bundle when needed.

This reinforces the static-first design and the importance of browser-side caching.

## Security and privacy

### Principles

- No server-side user account
- No uploading personal watch history to a backend in MVP
- Tokens stored locally only
- Clear reset/clear-data controls

### Sensitive items

- Trakt OAuth token is stored locally and revocable
- Letterboxd CSV data stays in browser storage unless the user clears it

### Risks

Since this is a static site, client-side secrets are visible to the user by nature. With no API keys in the app at all, this risk no longer applies to the discovery/search/recommendation path — only to the optional Trakt OAuth token.

## Attribution and legal

The app must include clear attribution for any provider whose terms require it. TVmaze's terms ask for a "Powered by TVmaze.com" credit/link; the footer and About page include this. Apple's iTunes Search/RSS APIs don't require attribution, but the About page credits them anyway for transparency.

Important: the current architecture is suitable for non-commercial use of these free, key-free tiers. If monetization becomes real, revisit provider terms and possibly redesign the data layer.

## Error handling

**API errors** — show elegant inline messages, retry where sensible, preserve last cached successful content.

**Import mismatch** — flag ambiguous titles, let the user resolve manually in a lightweight review flow.

**Rate limits** — Trakt limits should trigger graceful backoff, reduced refresh rate, cached fallback content. TVmaze and iTunes have no published per-key rate limit since no key is used, but the app still caches aggressively to be a good citizen.

## Analytics and observability

For MVP on GitHub Pages: keep analytics minimal or none, optionally use privacy-respecting static analytics later, log only non-personal UI events if added later. Avoid anything that undermines the "local-first and privacy-friendly" message.

## Accessibility

The cinematic look must still remain usable: sufficient contrast for text on dark backgrounds, keyboard navigation for rails and dialogs, visible focus states, reduced motion mode, descriptive labels for settings and actions.

## Roadmap

**Phase 1** — React + Vite scaffold, hash routing, cinematic home/discover page, key-free TVmaze/iTunes discovery rails, local watchlist, recency-biased ranking.

**Phase 2** — Letterboxd CSV import, library page, personalized profile generation, "For You" recommendation feed.

**Phase 3** — Trakt OAuth integration, community-aware ranking, better TV-specific recommendations.

**Phase 4** — Smarter similarity engine, offline precomputed helper model, future backend portability work for possible monetization.

## Open questions

- Do we support local export/import of app state for backup?
- How aggressive should recency bias be by default?
- Should the app lean more editorial/curated or algorithmic in tone?
- Is there a better keyless "trending" proxy for TV than the rolling-week schedule-rating heuristic?

## Build guidance for Claude Code

Treat this document as the product contract for scaffolding and implementation. Priorities:

1. Polished UI shell first
2. Key-free discovery rails (TVmaze + iTunes)
3. Settings (region, recency, data sources)
4. Recommendation engine
5. Imports and sync

Code generation should prefer: small reusable components, strongly typed adapters, clean separation of provider logic from UI, explicit empty/error/loading states.
