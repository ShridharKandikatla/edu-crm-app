# edu-crm-app — Project Memory

Purpose of this file: preserve durable project context so any future session (human or AI) can work here without re-discovering the architecture. Keep this file in sync when behavior changes.

## Project Identity

- **What:** Frontend SPA for an education CRM (lead management, follow-ups, courses, applications, reports, WhatsApp, AI). Brand: "Eportal" (`src/constants/app.js`).
- **Stack:** React 19 + Vite 8, **plain JavaScript (no TypeScript)**, Tailwind CSS v4 (via Vite plugin), react-router-dom v7, recharts v3, react-icons, date-fns. Tests: Vitest 4 + Testing Library + jsdom.
- **Backend companion:** `../edu-crm-server` (Node.js Express 5 + Prisma 7 + MariaDB). The two apps are the contract for each other — see "API Integration Contract" below.
- **Workspace:** `C:\New folder` is the multi-project root; `edu-crm-app.code-workspace` is the VS Code multi-root workspace file. Do not assume anything outside `edu-crm-app` and `edu-crm-server` is relevant.

## Commands (run in `C:\New folder\edu-crm-app`)

```bash
npm install          # install deps
npm run dev          # Vite dev server (port 5173)
npm run build        # production build -> dist/
npm run lint         # ESLint (must pass before shipping)
npm run test         # vitest run (single run)
npm run test:watch   # vitest watch mode
npm run preview      # preview production build
```

**Required order before shipping: `lint` -> `test` -> `build`.** Frontend lint is currently clean (0 errors); the only warnings are 2 pre-existing React `exhaustive-deps` warnings in `CampaignsPage.jsx` (~line 51) and `MessageTemplatesPage.jsx` (~line 58) — do not "fix" them by adding the missing dependency blindly; the pattern is intentional (server-driven refetch).

## Environment

- Copy `.env.example` to `.env`. Only required var: `VITE_API_URL=http://localhost:5000/api`.
- Env loaded via `src/config/env.js` (`config.apiUrl`); defaults to `/api`. In production, missing `VITE_API_URL` logs an error but does not crash.

## Architecture

- **Entry:** `src/main.jsx` -> `ThemeProvider` -> `ToastProvider` -> `App` -> `createRoot`. Wrapped in `StrictMode`.
- **Routing:** `src/App.jsx` — `BrowserRouter` + `AuthProvider` + `ErrorBoundary` + `ToastContainer`. All pages are `React.lazy()` + `Suspense`. Protected routes are children of `MainLayout` (`src/components/layout/MainLayout.jsx`).
- **Auth:** `src/context/AuthContext.jsx` — JWT in `localStorage['token']`, sent as `Bearer`. Exposes `useAuth()` -> `{ user, setUser, features, isAuthenticated, login, logout, hasPermission, hasAnyPermission, refreshFeatures }`. On login/refresh it calls `loadFeatures()` and stores feature flags in state.
- **Feature flags:** `src/constants/features.js` — `DEFAULT_FEATURES` + `FEATURE_FLAG_LABELS` + `loadFeatures({force})` (fetches `api.features.getAll()`, cached in module scope). Consumed via `useFeatures()` hook (`src/hooks/useFeatures.js`).
- **API layer:** `src/services/api.js` — the ONLY place backend integration happens. Fetch wrapper with 30s timeout, 1 retry on GET network/5xx (never retries POST/PUT/DELETE), auth header injection, `buildQueryString` (skips `undefined`/`null`/`''`). Optional global `setApiErrorHandler()`. Returns the **full JSON** from the server (NOT just `data`).
- **Toasts:** `src/context/ToastContext.jsx` + `src/components/Toast.jsx` — `useToast()`.
- **Theme:** `src/context/ThemeContext.jsx` — light/dark/system, persisted `localStorage['theme']`, resolved `dark` class on `<html>`. Defaults to system.
- **Charts:** recharts v3 (dashboard, reports).
- **WebSocket:** `src/hooks/useWebSocket.js` exists — real-time support wired to backend WebSocket server.

### api.js endpoint groups (all under `api.<group>`)
`auth`, `leads` (incl. `getReEngagement`), `followUps` (incl. `getStats`), `dashboard`, `reports`, `courses`, `users`, `notifications`, `notificationPreferences`, `features`, `templates`, `campaigns`, `whatsapp`, `applications`, `portal` (public student self-service), `ai`. When the backend changes a controller, update the matching group here.

## Key Directories

```
src/
  components/       # Reusable UI — subfolders: leads/, dashboard/, layout/, apply/
  pages/            # Route-level pages (lazy-loaded)
  services/api.js   # All API calls
  context/          # AuthContext, ThemeContext, ToastContext
  hooks/            # useFeatures, useDebounce, useCoursesAndIntakes, useNotificationPreferences, useKeyboardShortcut, useWebSocket
  constants/        # app.js (branding), features.js, permissions.js, filterOptions.js
  config/env.js     # Env config
  utils/            # renderTemplate.js (client-side template rendering for WhatsApp/email bodies)
  test/setup.js     # jest-dom setup
  data/mockData.js  # Mock/fallback data
```

### Pages (`src/pages/`)
`DashboardPage`, `LeadListPage`, `LeadDetailPage`, `AddLeadPage`, `FollowUpsPage`, `FailedLeadsPage`, `ReEngagementPage`, `CoursesPage`, `IntakesPage`, `ApplicationsPage`, `UsersPage`, `MessageTemplatesPage`, `CampaignsPage`, `ReportsPage`, `SettingsPage`, `LoginPage`, `ApplyPage` (public), `NotFoundPage`.

### Lead detail tabs (`src/components/leads/`)
`WhatsAppTab`, `FollowUpsTab`, `CommentsTab`, `ActivityTimeline`, `AIRecommendation`, `LeadTable`, `LeadFilters`, `LeadModals`, `LeadProfileCard`, `LeadPagination`, `QuickActionsSidebar`.

## Conventions

- All files `.jsx`/`.js` — **never add `.ts`/`.tsx`**.
- ESLint `no-unused-vars` ignores uppercase identifiers (`^[A-Z_]`) — component names and constants are exempt.
- Naming: `PascalCase` components, `camelCase` functions/variables/state, `UPPER_SNAKE_CASE` constants. 2-space indent, ~100 char lines. No Prettier — ESLint is the source of truth.
- Functional components + hooks. Composition over copy-paste. Return early; keep functions small.
- API responses expected as `{ success, data, message }`. **Paginated** responses are `{ success, data: array, pagination: { total, page, limit, totalPages, hasMore } }`.
- Error handling: catch specific errors (`ApiError`/`NetworkError` from `api.js`), surface via toast. Never log secrets/tokens.

## Roles & Permissions

- Single source of truth: `src/constants/permissions.js` — `ROLES`, `ROLE_PERMISSIONS` (action keys per role), `PERMISSION_LABELS`, `ROLE_MATRIX` (used by Settings -> Roles & Permissions).
- Use `hasPermission(key)` / `hasAnyPermission([...])` — never hard-code `user.role === 'ADMIN'`.
- Data scope (`all`/`team`/`own`) is enforced **server-side**; the frontend only gates UI.
- TELECALLER = own leads + create + follow-ups only. COUNSELOR = own + re-engage. MANAGER = all leads, team reports, courses/intakes, campaigns. ADMIN = everything.
- `delete_leads` and `bulk_import` permissions exist but have no UI buttons yet.

## Pagination (IMPORTANT — established pattern)

- List endpoints return `{ data, pagination: { total, page, limit, totalPages, hasMore } }`. **Always read totals from `res.pagination.total`, never `data.length`.**
- Every list UI must send `page`/`limit` query params and render footer pagination UI (`.pagination` / `.pagination-btn` styles, or `<LeadPagination>` for leads). Reset `currentPage` to 1 whenever filters or data-mutating actions change.
- **Reference implementations (server-driven):** `LeadListPage`, `ApplicationsPage`, `UsersPage`, `FollowUpsPage`, `FailedLeadsPage`, `ReEngagementPage`, `CampaignsPage`, `MessageTemplatesPage`. WhatsApp threads use load-more (prepend) pagination in `WhatsAppTab` (`page`/`limit` 50, oldest-first, scroll preserved via `suppressScrollRef` + rAF).
- **Do NOT** fetch with large hard-coded limits (e.g. `limit: 1000`) as a workaround — it silently drops data past the cap. Drive server pagination instead.
- Re-engagement uses the dedicated paginated endpoint `GET /api/leads/re-engagement` (limit 12). If a fetch expects `res.data` to be the array directly, guard with `res.data || []` (new pattern; templates endpoints already do this).

## Dark Mode

- `src/index.css` `.dark` block **inverts design tokens** (`--color-gray-*`, `--color-indigo-*`, `--color-red-*`, etc.) so most Tailwind utilities adapt automatically.
- Pitfall: inverted tokens must NOT be used as text color on always-dark pages (Login, Apply, ChatBot) — use `text-white/70`, `text-indigo-300`, or explicit `dark:text-...` overrides.
- Pitfall: `bg-white` surfaces do NOT flip automatically — pair with `dark:bg-[#1f2530]` where the surface must be theme-aware.
- **Always verify UI changes in BOTH light and dark mode** and at mobile (≤480px), tablet (≤768px), and desktop widths.

## API Integration Contract (with `../edu-crm-server`)

- Server base URL: `http://localhost:5000/api` (see `VITE_API_URL`). All `/api` routes are behind JWT auth except `auth/*`, `public/*`, `portal/*`.
- Response shapes: success `{ success: true, data }` (paginated: `{ data: array, pagination: {...} }`); errors `{ success: false, message }` with proper HTTP status; `errors` array for validation.
- Query params are optional-server-side; the frontend drives `page`/`limit` and filters via `buildQueryString`.
- When the server adds/changes a route: update the matching `api.<group>` method in `src/services/api.js` first, then the consuming page/component, then run `lint -> test -> build`.

## Testing

- Vitest + jsdom + Testing Library; setup `src/test/setup.js` (jest-dom). 66 tests across 10 files currently pass.
- Run `npm run test` (single run) — `npm run test:watch` for development.
- Mock `api.js` methods or fetch in component tests; cover critical flows (forms, API calls, permissions/role gating).

## Gotchas

- `useWebSocket` exists; WebSocket server lives in the backend (`src/websocket/`).
- `dist/` is gitignored (build output).
- No CI/CD config in the repo (no `.github/` workflows). Both `AGENTS.md` and `memory.md` document this project — AGENTS.md is the "do" ruleset, memory.md is the "what is true" record. Keep both in sync.
