# AGENTS.md

## Project

edu-crm-app — React 19 + Vite 8 SPA for education CRM (lead management, follow-ups, courses, reports, AI scoring). Plain JavaScript (no TypeScript). Tailwind CSS v4 via Vite plugin.

## Commands

```bash
npm install          # install deps
npm run dev          # Vite dev server (port 5173)
npm run build        # production build → dist/
npm run lint         # ESLint (must pass before changes)
npm run test         # vitest run (single run)
npm run test:watch   # vitest watch mode
npm run preview      # preview production build
```

**Required order:** `lint → test → build`

## Environment

Copy `.env.example` to `.env`. Only required var:

```
VITE_API_URL=http://localhost:5000/api
```

Env is loaded via `src/config/env.js`. Missing `VITE_API_URL` in production logs an error but doesn't crash.

## Architecture

- **Entry:** `src/main.jsx` → `src/App.jsx`
- **Routing:** react-router-dom v7, lazy-loaded pages via `React.lazy` + `Suspense`
- **Auth:** `src/context/AuthContext.jsx` — JWT stored in `localStorage` as `token`
- **API layer:** `src/services/api.js` — fetch wrapper with 30s timeout, 1 retry, auth headers injected automatically
- **Layout:** `src/components/layout/MainLayout.jsx` wraps all protected routes
- **Toast system:** `src/context/ToastContext.jsx` + `src/components/Toast.jsx`
- **Testing:** Vitest + jsdom + Testing Library. Setup file: `src/test/setup.js`
- **Charts:** recharts v3

## Key Directories

```
src/
  components/       # Reusable UI (leads/, dashboard/, layout/, apply/)
  pages/            # Route-level page components (lazy-loaded)
  services/api.js   # All API calls — edit here for backend integration
  context/          # React contexts (Auth, Toast)
  hooks/            # Custom hooks (useDebounce, useKeyboardShortcut, useWebSocket)
  constants/        # Filter options, permissions
  config/env.js     # Environment config
  data/mockData.js  # Mock/fallback data
  test/setup.js     # Test setup (jest-dom import)
```

## Conventions

- All files are `.jsx` / `.js` — no TypeScript. Do not add `.ts` or `.tsx` files.
- ESLint `no-unused-vars` ignores uppercase (`^[A-Z_]`) — component names and constants are exempt.
- Components use functional style with hooks.
- API responses expect `{ success, data, message }` shape from the backend.
- Auth token is read from `localStorage` key `token`, sent as `Bearer` header.
- Route nesting: all protected pages are children of `MainLayout` via nested `<Route>`.

## Gotchas

- `useWebSocket` hook exists (`src/hooks/useWebSocket.js`) — the app has WebSocket support for real-time updates.
- API layer retries GET requests once on network/5xx errors but never retries POST/PUT/DELETE.
- Global API error handler can be set via `setApiErrorHandler()` in `src/services/api.js`.
- `dist/` is gitignored. Build output goes there.
- No CI/CD config exists in the repo (no `.github/` workflows).
