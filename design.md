# design.md

## Project

**Working title:** CineWeave
**Tagline:** A cinematic movie and series recommendation app that feels instant, personal, and current.

CineWeave is a static-first recommendation web app for movies and TV series built with React + Vite and deployed on GitHub Pages. The app uses free sources only in the MVP: TMDb for metadata and discovery, Trakt for optional community and personal sync, TVmaze for TV enrichment, and Letterboxd CSV exports for personal watch history import.

The product goal is to make recommendations feel seamless from the first visit. Users should see relevant content immediately, with no hard requirement to sign in or upload files before the app becomes useful. Personalization is layered in gently afterward through optional TMDb key setup, Trakt connection, and Letterboxd CSV import.

The product should also prefer newer movies and series by default so recommendations feel timely and socially relevant. Older titles remain available, but the ranking and defaults should bias toward recent releases, recent seasons, and current audience momentum.

## Product principles

### Instant value

The app must be useful on first load. A new visitor should land on a beautiful home screen and immediately see curated recent and trending titles without friction. No login wall, no giant setup step, no blank dashboard.

### Soft personalization

The app should progressively improve rather than block. It starts with public discovery, then offers low-pressure enhancements:

- Enter your TMDb key once.
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
- Deliver instant recommendations with no required account creation.
- Use only free-access data sources in MVP: TMDb, Trakt free API, TVmaze, Letterboxd CSV import, optional MovieLens offline data.
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
- No commercial launch using TMDb's free non-commercial tier.

## Target users

### Primary user

A movie/series enthusiast who wants fast, aesthetically pleasing recommendations without creating another account. They like seeing what is trending now, what is new this year, and what fits their taste once they connect some history.

### Secondary user

A power user who tracks media on Trakt or Letterboxd and wants stronger recommendations, better discovery, and a more attractive interface than a utility tracker.

### User assumptions

- Users understand mainstream movie/TV browsing patterns.
- Some users will not have Trakt or Letterboxd data ready.
- Many users will tolerate one-time setup for a TMDb key if the value is obvious and the app still works before that.
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

### Scenario 2: User adds TMDb key

1. User opens Settings.
2. They paste their TMDb API key.
3. The app validates the key with a simple endpoint call.
4. The app stores it locally and refreshes content.
5. Discovery becomes richer and more personalized over time through caching and deeper metadata access.

### Scenario 3: User imports Letterboxd export

1. User uploads ZIP or CSV files from Letterboxd.
2. App parses diary, ratings, and watched entries.
3. App maps titles to TMDb IDs using title + year.
4. App calculates a taste profile: favorite genres, directors, actors, recency patterns, rating behavior.
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
- `/#/settings` — API keys, sources, region, language, personalization options
- `/#/about` — Data sources, privacy, attribution, disclaimers

### Route roles

**Home** — A cinematic landing page with immediate recommendations and no blockers.

**For You** — The primary personalized view. If user data is missing, it gracefully degrades to "recently trending for you to start with."

**Library** — A browsable history of watched/rated/imported items with filters and source badges.

**Watchlist** — Locally stored items and, if available, imported Trakt watchlist.

**Search** — Cross-source search across TMDb movie/TV search plus local history.

**Settings** — The operational heart of the app. This is where users add the TMDb key, connect Trakt, manage imports, set recency preference, and choose region/language.

**About** — Must include TMDb attribution language and logos/credits as required.

## Data sources

### TMDb

TMDb is the main metadata and discovery provider in MVP. It supplies movie metadata, TV metadata, cast and crew, posters and backdrops, release dates, trending/popular/top rated feeds, and search endpoints.

Constraints: free tier is for non-commercial use, attribution is required, rate limits exist and should be respected.

### Trakt

Trakt is the optional sync/community provider. It supplies watch history, ratings, watchlist, public lists, and community-oriented discovery and popularity context.

Constraints: OAuth2 required, free-tier usage limits exist, the app should degrade gracefully if limits are reached.

### Letterboxd export

Letterboxd contributes user-owned watch and rating history through CSV import. Useful files include `diary.csv`, `ratings.csv`, `watched.csv`.

Constraints: no stable TMDb IDs in export, must match by title + year, no official public app API for this use case.

### TVmaze

TVmaze is optional but useful for series/episode metadata, especially for airing schedule and detailed episode listings.

### MovieLens

MovieLens can be used offline for testing algorithms, calibrating similarity, or shipping lightweight precomputed recommendation helpers in future phases.

## Data model

The app is client-first and stores most working data in memory plus local browser storage.

### Core entities

**MediaItem** — represents a movie or TV series enriched from external providers.

Fields: `id`, `type` (movie | tv), `title`, `originalTitle`, `year`, `releaseDate`, `firstAirDate`, `tmdbId`, `tvmazeId`, `imdbId`, `genres[]`, `overview`, `posterPath`, `backdropPath`, `runtime`, `episodeCount`, `seasonCount`, `status`, `languages[]`, `originCountries[]`, `popularity`, `voteAverage`, `cast[]`, `crew[]`, `providers[]`, `sourceFlags`.

**UserInteraction** — represents the user's relationship to a title.

Fields: `mediaId`, `source` (letterboxd | trakt | local), `watched`, `watchedDates[]`, `ratingNormalized`, `rewatchCount`, `watchlist`, `reviewSnippet`, `ignored`, `liked`, `lastUpdated`.

**UserProfile** — a computed taste model.

Fields: `preferredGenres`, `dislikedGenres`, `preferredDirectors`, `preferredActors`, `preferredNetworks`, `preferredEras`, `recencyPreference`, `ratingDistribution`, `completionBias`, `seriesVsMovieBias`.

**AppSettings**

Fields: `tmdbApiKey`, `region`, `language`, `theme`, `defaultRecencyMode`, `includeMature`, `useTrakt`, `traktToken`, `showExplanations`, `enableAnimations`.

### Storage strategy

- `localStorage` for: app settings, TMDb key, small user preferences, lightweight local watchlist state.
- `IndexedDB` for: cached metadata responses, imported Letterboxd data, merged normalized history, recommendation cache.

This avoids pushing too much into localStorage and helps performance for larger libraries.

## Provider architecture

The codebase isolates API and import logic in adapters: `tmdbAdapter`, `traktAdapter`, `letterboxdImportAdapter`, `tvmazeAdapter`.

Each adapter exposes: fetch/search methods, normalization methods, error handling, rate limiting hooks, and result mapping into shared internal entities.

This keeps the app flexible if later you replace TMDb, add OMDb or JustWatch-like data, move logic server-side for monetization, or need to support multiple recommendation backends.

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

**If only TMDb is available** — recommendations are public and trend-based: current trending, popular with genre filters, similar to selected title.

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

- Global content search via TMDb
- Local library search
- Search-as-discovery suggestions
- Similar-title recommendations

### Matching Letterboxd to TMDb

Because Letterboxd export lacks TMDb ids, use: normalized title, year match, alternative title fallback, confidence score.

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

**Never hard-block first use.** Even if the user has no TMDb key yet, the app shows a polished starter state. If truly required data is unavailable, show demo placeholders or a graceful explainer rather than an empty app.

**Ask only when helpful.** The app should not bombard users with setup prompts. Use contextual nudges — after browsing, suggest adding a TMDb key; after viewing recommendations, suggest import for stronger results.

**Explain recommendations simply.** Every recommendation card or detail view has a short reason, like "Because you like recent sci-fi", "Trending strongly this week", "Similar cast and tone to your favorites", "New season in a genre you rate highly".

**Avoid dead ends.** Every empty state includes a next action: add TMDb key, import Letterboxd, connect Trakt, browse trending, search by title.

## Onboarding and settings

### First-visit experience

Home opens with a cinematic hero section, trending/recent rows, and a subtle banner: "Make this personal in 30 seconds."

### Settings sections

TMDb API key, region and language, theme, recency mode, data sources, privacy and local storage controls, reset app data.

### TMDb key flow

The key is user-provided, stored locally, and validated once via a test request. This is cleaner for static hosting and avoids centralizing API responsibility.

## Pages in detail

**Home** — immediate delight, no-friction discovery. Sections: hero spotlight, new & hot movies, fresh series, trending this week, critically strong recent releases, improve-your-feed prompt.

**For You** — main recommendation destination. Sections: top picks for you, because you liked X, new series you may like, fresh releases matching your favorite genres, hidden gems this year.

**Library** — personal media memory. Features: grid/list switch, filters by source/type/genre/rating/year, watched and rewatch badges, search within library.

**Watchlist** — intent management. Features: local watchlist, imported Trakt watchlist view if available, sort by newest/popularity/runtime.

**Search** — direct lookup and discovery. Features: instant suggestions, result tabs for movies/series/people, recent searches, "search and recommend" flow.

**Settings** — configuration without friction. Features: TMDb key entry, source management, recency preference, local cache clear, appearance controls.

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
      tmdb/
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

- TMDb key is user-owned and stored locally
- Trakt OAuth token is stored locally and revocable
- Letterboxd CSV data stays in browser storage unless the user clears it

### Risks

Since this is a static site, client-side secrets are visible to the user by nature. That is acceptable for user-supplied keys, but not ideal for centrally managed commercial credentials.

## Attribution and legal

The app must include clear attribution for TMDb and any other provider whose terms require it. TMDb requires attribution and provides official logos and branding guidance. The About page and footer should include wording such as: "This product uses the TMDb API but is not endorsed or certified by TMDb."

Important: the current architecture is suitable for non-commercial use of TMDb free access. If monetization becomes real, revisit provider terms and possibly redesign the data layer.

## Error handling

**API errors** — show elegant inline messages, retry where sensible, preserve last cached successful content.

**Missing key** — show limited public/discovery state if possible, guide user to Settings with a clear value proposition.

**Import mismatch** — flag ambiguous titles, let the user resolve manually in a lightweight review flow.

**Rate limits** — TMDb and Trakt limits should trigger graceful backoff, reduced refresh rate, cached fallback content.

## Analytics and observability

For MVP on GitHub Pages: keep analytics minimal or none, optionally use privacy-respecting static analytics later, log only non-personal UI events if added later. Avoid anything that undermines the "local-first and privacy-friendly" message.

## Accessibility

The cinematic look must still remain usable: sufficient contrast for text on dark backgrounds, keyboard navigation for rails and dialogs, visible focus states, reduced motion mode, descriptive labels for settings and actions.

## Roadmap

**Phase 1** — React + Vite scaffold, hash routing, cinematic home/discover page, TMDb key settings, TMDb discovery rails, local watchlist, recency-biased ranking.

**Phase 2** — Letterboxd CSV import, library page, personalized profile generation, "For You" recommendation feed.

**Phase 3** — Trakt OAuth integration, community-aware ranking, better TV-specific recommendations.

**Phase 4** — Smarter similarity engine, offline precomputed helper model, future backend portability work for possible monetization.

## Open questions

- Do we ship any no-key demo mode, or require a TMDb key after a limited preview?
- Do we include TVmaze in MVP or defer until the TMDb flow is stable?
- Do we support local export/import of app state for backup?
- How aggressive should recency bias be by default?
- Should the app lean more editorial/curated or algorithmic in tone?

## Build guidance for Claude Code

Treat this document as the product contract for scaffolding and implementation. Priorities:

1. Polished UI shell first
2. Settings + TMDb key flow
3. Discovery rails
4. Recommendation engine
5. Imports and sync

Code generation should prefer: small reusable components, strongly typed adapters, clean separation of provider logic from UI, explicit empty/error/loading states.
