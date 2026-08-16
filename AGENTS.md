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

## Memory Sync (mandatory)

- `memory.md` in this folder is the project's durable context record. **Update it in the same change as any code**, before shipping — it is a required deliverable, not optional.
- Update `memory.md` whenever you change: dependencies, scripts, env vars, routing/pages, `src/services/api.js` groups, pagination, conventions, the API contract, roles/permissions, or gotchas.
- When adding a feature/page/hook, add it to the relevant `memory.md` section (pages list, api groups, conventions).
- Keep `AGENTS.md` (the "do" ruleset) and `memory.md` (the "what is true" record) in sync — a change to one must be reflected in the other when it changes behavior.

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

## Coding Standards

### Core Principles
- **DRY:** Extract shared logic into reusable components (`src/components/`), hooks (`src/hooks/`), and utilities (`src/utils/`) instead of duplicating it.
- Keep functions and components small, focused on a single responsibility.
- Avoid deep nesting of loops, conditionals, and ternary chains — return early and split logic into named helpers.
- Write modular, reusable code; prefer composition over copy-paste.

### Readability & Formatting
- Use descriptive, meaningful names: `PascalCase` for components, `camelCase` for variables/functions/state, `UPPER_SNAKE_CASE` for constants.
- 2-space indentation, no trailing whitespace.
- Keep lines readable (~100 characters max).
- ESLint is the source of truth for style (`npm run lint`). There is no Prettier config — match existing file conventions.

### Comments
- Prefer self-explanatory code over comments.
- Use comments to explain the *why* behind complex or non-obvious decisions, not the *what*.
- Keep this file and other docs in sync when behavior changes.

### Error Handling & Security
- Validate and sanitize user input before sending it (required/pattern checks on forms, query params via `buildQueryString`).
- Never hardcode secrets or tokens — use `.env` and `src/config/env.js` only.
- Catch specific errors (e.g. `ApiError` / `NetworkError` from `src/services/api.js`) rather than swallowing everything; surface failures to the user via the toast system.
- Never log or expose credentials, JWTs, or personal data.

### Workflow & Testing
- Use Git with clear, conventional commit messages; open PRs for review.
- Run `lint → test → build` in that order before shipping changes.
- Write/keep unit and integration tests for critical flows (forms, API calls, permissions).
- **Always verify every UI change in BOTH light and dark mode.** Any new or edited page/component must be visually checked with the theme set to dark (and light) before shipping.
- **Always ensure responsiveness for all devices.** Any new or edited page/component must be checked at mobile (≤480px), tablet (≤768px), and desktop widths before shipping. Reuse existing breakpoint patterns: `@media (max-width: 768px)` in `src/index.css` for layout, Tailwind `sm:`/`md:` prefixes for component-level utilities.

## Dark Mode

- Implemented via `src/context/ThemeContext.jsx` (`ThemeProvider` / `useTheme`). Defaults to system (`prefers-color-scheme`), persisted in `localStorage['theme']` as `'light' | 'dark' | 'system'`; the resolved `dark` class is applied to `<html>`.
- `src/index.css` `.dark` block **inverts the design tokens** (`--color-gray-*`, `--color-indigo-*`, `--color-red-*`, etc.) so most Tailwind utilities adapt automatically.
- Pitfall: tokens that are inverted in `.dark` must NOT be used as text color on always-dark pages (Login, Apply, ChatBot). There `text-indigo-100`/`text-indigo-200` become dark → invisible. Use non-inverted tokens (`text-white/70`, `text-indigo-300`, ...) or explicit `dark:text-...` overrides.
- Pitfall: `bg-white` surfaces do NOT flip automatically — pair them with `dark:bg-[#1f2530]` (matches `--surface`) where the surface must be theme-aware.

## Roles & Permissions

- Single source of truth: `src/constants/permissions.js` — `ROLE_PERMISSIONS` (action keys per role), `PERMISSION_LABELS`, and `ROLE_MATRIX` (readable feature×role grid used by the Settings → Roles & Permissions tab).
- `useAuth()` exposes `hasPermission(key)` and `hasAnyPermission([...])`. Prefer these over hard-coded `user.role === 'ADMIN'` checks.
- Data scope semantics: `all` (whole org), `team` (manager's team), `own` (assigned to me). Scope is enforced **server-side**; the frontend only gates UI visibility/buttons.
- Matrix (agreed): TELECALLER = own leads + create + follow-ups only. COUNSELOR = own leads/reports/export + follow-ups + re-engage own. MANAGER = all leads, assign, bulk/export, team reports, manage courses/intakes + campaigns. ADMIN = everything incl. users and delete.
- Reminder: `delete_leads` and `bulk_import` permissions exist but have no UI buttons yet.

## Pagination

- List endpoints return `{ success, data, pagination: { total, page, limit, totalPages, hasMore } }`. Always read totals from `res.pagination.total`, never from `data.length`.
- Every list UI must send `page`/`limit` query params and render pagination UI (reuse the `.pagination` / `.pagination-btn` styles, or `<LeadPagination>` for leads).
- Reference implementations: `LeadListPage`, `ApplicationsPage`, `UsersPage`, `FollowUpsPage`, `FailedLeadsPage`, `ReEngagementPage`, `CampaignsPage`, `MessageTemplatesPage` (all server-driven). WhatsApp threads use load-more pagination in `WhatsAppTab` (`page`/`limit`, oldest first, prepended).
- Do NOT fetch with large hard-coded limits (`limit: 1000`) as a workaround — it silently drops data past the cap. Drive server pagination instead.
- Known gap: `FailedLeadsPage` reason-count chart reflects the current server page only (server-driven pagination). Re-engagement uses a dedicated paginated endpoint (`GET /api/leads/re-engagement`).

## Gotchas

- `useWebSocket` hook exists (`src/hooks/useWebSocket.js`) — the app has WebSocket support for real-time updates.
- API layer retries GET requests once on network/5xx errors but never retries POST/PUT/DELETE.
- Global API error handler can be set via `setApiErrorHandler()` in `src/services/api.js`.
- `dist/` is gitignored. Build output goes there.
- No CI/CD config exists in the repo (no `.github/` workflows).
