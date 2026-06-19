# CineWeave

A cinematic, static-first movie and series recommendation app. Built with React + Vite, deployed on GitHub Pages, no backend or accounts — your TMDb key, watchlist, and imported history all live in your browser.

See [`design.md`](./design.md) for the full product and technical design.

## Getting started

```bash
npm install
npm run dev
```

Open the app and add a free [TMDb API key](https://www.themoviedb.org/settings/api) from Settings to unlock discovery, search, and recommendations.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — lint the codebase

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which builds the app and publishes `dist/` to GitHub Pages. The app uses `HashRouter` and a `/lens-c/` base path so it works correctly as a GitHub Pages project site — no server-side route handling required.

## Architecture

- `src/app` — providers, routing, and global state (settings, watchlist, library)
- `src/components` — shared UI: poster cards, rails, layout, modals, forms
- `src/features` — route-level pages (discover, for-you, library, watchlist, search, settings, about)
- `src/services` — provider adapters (TMDb, Trakt, TVmaze, Letterboxd), the ranking engine, and caching
- `src/types` — shared domain types

## Status

Phase 1 (discovery, TMDb key setup, watchlist, recency-biased ranking) and a working slice of Phase 2 (Letterboxd CSV import → taste profile → "For You" recommendations) are implemented. Trakt sync is stubbed pending OAuth support. See the Roadmap section of `design.md` for what's next.
