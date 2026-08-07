# Civic Lens — Frontend

> AI-Powered civic issue reporting and transparency platform. Citizens report infrastructure problems (potholes, waterlogging, streetlight faults, illegal dumping), while municipal admins triage, resolve, and audit tickets — all with full lifecycle transparency via AI-assisted classification and de-duplication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routing Architecture](#routing-architecture)
- [Folder & Component Conventions](#folder--component-conventions)
- [State Management & Data Fetching](#state-management--data-fetching)
- [Styling Guidelines](#styling-guidelines)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Contributing Guidelines](#contributing-guidelines)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | ![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white&style=flat-square) | `^18.3.1` |
| Build Tool | ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white&style=flat-square) | `^5.4.2` |
| Language | ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black&style=flat-square) | ESM (`"type": "module"`) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) | `^3.4.10` |
| Routing | ![React Router](https://img.shields.io/badge/React_Router-6.26-CA4245?logo=reactrouter&logoColor=white&style=flat-square) | `^6.26.0` |
| HTTP Client | ![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?logo=axios&logoColor=white&style=flat-square) | `^1.7.4` |
| Maps | ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white&style=flat-square) + react-leaflet `^4.2.1` | `^1.9.4` |
| Charts | Recharts | `^2.12.7` |
| Icons | Lucide React | `^0.428.0` |
| Linter | Oxlint | `^1.75.0` |
| CSS Post-Processing | PostCSS + Autoprefixer | `^8.4.41` / `^10.4.20` |
| Font | Inter (Google Fonts, via CSS `@import`) | — |

> **No TypeScript.** The project is pure JavaScript (`.jsx` files). Type annotations from `@types/react` and `@types/react-dom` exist for editor intellisense only.

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | **18.x LTS** or higher | <!-- TODO: confirm with team — no `.nvmrc` or `engines` field present --> |
| npm | **9.x** or higher | `package-lock.json` is committed; use `npm` (not `yarn`/`pnpm`) |
| Git | Any modern version | — |

> No global CLI tools are required beyond Node.js and npm.

---

## Project Structure

```
civic_lens_frontend/
├── index.html                  # Single HTML entry point; SEO meta & OG tags
├── vite.config.js              # Vite build configuration (React plugin)
├── tailwind.config.js          # Design tokens: colors, fonts, border-radius
├── postcss.config.js           # PostCSS pipeline: Tailwind + Autoprefixer
├── .oxlintrc.json              # Oxlint rules: react/rules-of-hooks, export conventions
├── package.json                # Dependencies and npm scripts
│
├── public/                     # Static assets served as-is (not processed by Vite)
│
└── src/
    ├── main.jsx                # React root; mounts <App /> into #root
    ├── App.jsx                 # Top-level component; wraps routes in <BrowserRouter>
    ├── index.css               # Global styles: Tailwind directives, Leaflet overrides,
    │                           #   custom keyframe animations (fadeIn, shake, scanline)
    ├── App.css                 # Minimal app-level style resets
    │
    ├── assets/                 # Static assets imported by components (e.g., logo.svg)
    │
    ├── components/             # Shared, reusable UI components
    │   └── Navigation/
    │       ├── Navbar.jsx      # Public-facing top nav bar (dark mode toggle)
    │       └── AdminSidebar.jsx# Collapsible sidebar for the admin dashboard
    │
    ├── features/               # Feature-sliced modules; each feature owns its pages
    │   ├── auth/
    │   │   └── pages/
    │   │       ├── Login.jsx         # Citizen login form
    │   │       ├── Signup.jsx        # Citizen registration form
    │   │       └── AdminLogin.jsx    # Dedicated admin login (standalone UI)
    │   │
    │   ├── dashboard/
    │   │   └── pages/
    │   │       ├── LandingPage.jsx   # Public hero/marketing page; contact modal
    │   │       ├── MapDashboard.jsx  # Interactive Leaflet map with ticket filtering
    │   │       └── Leaderboard.jsx   # Citizen & ward contribution leaderboards
    │   │
    │   ├── report/
    │   │   └── pages/
    │   │       └── SubmitReport.jsx  # Multi-step report form; geo-tag & AI scan UI
    │   │
    │   ├── ticket/
    │   │   └── pages/
    │   │       ├── TicketDetail.jsx  # Full ticket view: comments, upvotes, photo carousel
    │   │       └── MyReports.jsx     # Citizen's personal report history
    │   │
    │   └── admin/
    │       └── pages/
    │           ├── AdminOverview.jsx      # KPI cards and summary stats
    │           ├── AdminMap.jsx           # Admin-scoped interactive map
    │           ├── AdminTickets.jsx       # Full ticket management table
    │           ├── AdminAnalytics.jsx     # Recharts-powered analytics dashboard
    │           ├── ManualReviewQueue.jsx  # AI-flagged reports awaiting human review
    │           ├── AdminAuditLog.jsx      # Immutable action audit trail
    │           └── AdminRequests.jsx      # Municipal support request inbox
    │
    ├── routes/
    │   └── AppRoutes.jsx       # Centralised route definitions; layout wrappers;
    │                           #   ProtectedRoute guard (citizen + admin)
    │
    └── services/
        └── api.js              # Axios instance: base URL, JWT interceptor,
                                #   401 auto-logout, session cleanup
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/Civic-Lens.git
cd Civic-Lens/civic_lens_frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

There is currently no `.env.example` file. The API base URL is hardcoded in `src/services/api.js` as `http://localhost:8000/api/v1`. If your backend runs on a different host or port, update that file directly or create a `.env.local` file and refactor `api.js` to use `import.meta.env.VITE_API_BASE_URL`.

```bash
# .env.local (not committed — already .gitignored via *.local)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **`http://localhost:5173`** (Vite default).

---

## Environment Variables

> No `.env.example` exists in the repository at this time. The table below documents variables that the frontend **would require** if the API base URL is externalised.

<!-- TODO: confirm with team — create .env.example with these entries -->

| Variable Name | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Django REST API (e.g., `http://localhost:8000/api/v1`) | Y |

**Rules for Vite env vars:**
- Must be prefixed with `VITE_` to be exposed to the browser bundle.
- Access them in code with `import.meta.env.VITE_<VARIABLE_NAME>`.
- Never commit `.env.local` or any file containing real secrets — already `.gitignore`d via `*.local`.

---

## Available Scripts

All scripts are defined in `package.json` and invoked via `npm run <command>`.

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR at `http://localhost:5173` |
| `npm run build` | Production build; output written to `dist/` |
| `npm run preview` | Serve the `dist/` folder locally to preview the production build |
| `npm run lint` | Run Oxlint across the entire `src/` directory |

---

## Routing Architecture

All routes are defined centrally in `src/routes/AppRoutes.jsx` using **React Router v6** with nested layout routes.

### Layouts

| Layout | Wraps | Description |
|---|---|---|
| `PublicLayout` | Citizen routes | Renders `<Navbar />` + `<Outlet />` on a light/dark background |
| `AdminLayout` | Admin routes | Renders `<AdminSidebar />` + `<Outlet />`; guards against non-admin sessions |

### Route Map

| Path | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/dashboard` | `MapDashboard` | Public |
| `/ticket/:id` | `TicketDetail` | Public |
| `/leaderboard` | `Leaderboard` | Public |
| `/login` | `Login` | Public |
| `/signup` | `Signup` | Public |
| `/report` | `SubmitReport` | **Protected** (citizen) |
| `/my-reports` | `MyReports` | **Protected** (citizen) |
| `/admin/login` | `AdminLogin` | Public (standalone — no layout wrapper) |
| `/admin/overview` | `AdminOverview` | **Admin only** |
| `/admin/map` | `AdminMap` | **Admin only** |
| `/admin/tickets` | `AdminTickets` | **Admin only** |
| `/admin/analytics` | `AdminAnalytics` | **Admin only** |
| `/admin/review-queue` | `ManualReviewQueue` | **Admin only** |
| `/admin/audit-log` | `AdminAuditLog` | **Admin only** |
| `/admin/requests` | `AdminRequests` | **Admin only** |

### Auth Guard

Authentication state is persisted in **`sessionStorage`** using the following keys:

| Key | Type | Description |
|---|---|---|
| `token` | `string` | JWT Bearer token |
| `isLoggedIn` | `"true"` or `"false"` | Login flag (stored as a string, not boolean) |
| `userRole` | `"admin"` or `"citizen"` | Determines layout and route access |
| `userName` | `string` | Display name |
| `userId` | `string` | Backend user ID |
| `userEmail` | `string` | User email address |

`ProtectedRoute` redirects unauthenticated citizens to `/login`. `AdminLayout` redirects non-admin sessions to `/admin/login`. A global `auth-change` custom DOM event is dispatched on session mutations (e.g., 401 auto-logout) so any component can react without requiring shared context.

---

## Folder & Component Conventions

### Feature-Sliced Architecture

`src/features/` is organised by **product domain**, not technical layer. Each feature currently contains only `pages/`. As features grow, add sub-directories:

```
features/<feature-name>/
├── pages/          # Route-level page components
├── components/     # Feature-specific presentational components
├── hooks/          # Feature-specific custom hooks (e.g., useTicketData.js)
└── utils/          # Pure helper functions scoped to this feature
```

### Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase `.jsx` | `TicketDetail.jsx` |
| Custom hooks | camelCase, prefixed `use` | `useTicketData.js` |
| Utility functions | camelCase `.js` | `formatDate.js` |
| Services | camelCase `.js` | `api.js` |
| CSS classes | Tailwind utilities; custom classes use kebab-case | `animate-fade-in` |

### Where to Add New Code

| What | Where |
|---|---|
| New citizen-facing page | `src/features/<feature>/pages/` → register in `AppRoutes.jsx` |
| New admin page | `src/features/admin/pages/` → register under `AdminLayout` in `AppRoutes.jsx` |
| Shared UI component | `src/components/<ComponentGroup>/` |
| Feature-specific component | `src/features/<feature>/components/` (create if absent) |
| Custom hook | `src/features/<feature>/hooks/` (create if absent) |
| Additional API calls | Co-locate in the calling component, or extract to `src/services/` |

---

## State Management & Data Fetching

### State Management

There is **no global state library** (no Redux, Zustand, Recoil, or Context API). All state is managed locally with **React `useState` and `useEffect` hooks** within each page component.

Auth state lives in `sessionStorage` and is read directly by route guards at render time. Components subscribe to auth changes via the `auth-change` custom DOM event:

```js
window.addEventListener('auth-change', handleAuthChange);
// Always clean up in the useEffect return
return () => window.removeEventListener('auth-change', handleAuthChange);
```

### Data Fetching

All HTTP requests go through the shared Axios instance in `src/services/api.js`:

```js
import api from '../../../services/api';

// GET
const { data } = await api.get('/tickets');

// POST with multipart/form-data
const formData = new FormData();
formData.append('photo', file);
await api.post('/reports', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

**Interceptors baked in:**

| Interceptor | Behaviour |
|---|---|
| Request | Attaches `Authorization: Bearer <token>` from `sessionStorage` (skipped for `/auth/` endpoints) |
| Response (error) | On HTTP `401`: clears all session keys, dispatches `auth-change` event |

> There is no React Query, SWR, or similar caching layer. Loading and error states are managed manually via local `useState` flags in each component.

---

## Styling Guidelines

### Stack

- **Tailwind CSS v3** — utility-first with `class`-based dark mode (`darkMode: 'class'`).
- **PostCSS** + Autoprefixer for cross-browser compatibility.
- **Google Fonts** — `Inter` (400, 500, 600, 700) via `@import` in `index.css`.
- **Leaflet CSS** — imported globally at the top of `index.css`.

### Design Tokens (`tailwind.config.js`)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1E5F8C` | Civic blue — primary CTAs, active states |
| `accent` | `#E8A33D` | Warm amber — highlights, severity-medium |
| `severity-low` | `#4CAF7D` | Muted green — low-priority badges |
| `severity-medium` | `#E8A33D` | Amber — medium-priority badges |
| `severity-high` | `#D64545` | Muted red — high-priority badges |
| `bg-light` | `#F7F9FB` | Off-white light mode background |
| `bg-dark` | `#1A1D21` | Charcoal dark mode background |
| `text-primary` | `#1F2937` | Near-black body text |
| `text-secondary` | `#6B7280` | Slate gray secondary text |
| `success` | `#2F9E5B` | Success feedback |
| `error` | `#C0392B` | Error feedback |
| `font-sans` | `Inter` | Global default font family |
| `rounded-card` | `8px` | Card border radius |
| `rounded-button` | `6px` | Button border radius |

### Dark Mode

Dark mode is toggled by adding/removing the `dark` class on `<html>` (managed by `Navbar.jsx`). The current preference is persisted in `localStorage` under the key `'theme'`.

Apply dark variants with the `dark:` prefix:

```jsx
<div className="bg-bg-light dark:bg-[#0E131F] text-text-primary dark:text-gray-200 transition-colors duration-300">
```

> **All new UI must support both light and dark modes.**

### Custom Animations (`index.css`)

| Class | Effect | Duration |
|---|---|---|
| `animate-fade-in` | Fade in with upward slide | 0.6s ease |
| `animate-shake` | Horizontal shake (form validation feedback) | 0.5s ease |
| `ai-scan-line` | Vertical scan line (AI processing overlay) | 2s linear loop |
| `ai-scan-glow` | Pulsing amber glow | 1s ease loop |
| `dropzone-shimmer` | Glass shimmer on drag-and-drop zones | 2.5s linear loop |

---

## Testing

<!-- TODO: confirm with team — no test framework is currently configured -->

No testing setup (Jest, Vitest, Playwright, Cypress, or React Testing Library) is present. `package.json` contains no `test` script.

**Recommended addition** given the Vite + React stack:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

---

## Build & Deployment

### Production Build

```bash
npm run build
```

Output is written to **`dist/`**. This folder is `.gitignore`d and must not be committed.

### Preview the Production Build Locally

```bash
npm run preview
```

Serves `dist/` at `http://localhost:4173` (Vite default preview port).

### Deployment Notes

The app is a **client-side SPA**. Your web server or CDN must serve `index.html` as a fallback for all routes.

**Nginx:**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Vercel / Netlify** — create `public/_redirects`:

```
/* /index.html 200
```

Set `VITE_API_BASE_URL` (or equivalent) as an environment variable in your CI/CD platform **before** running `npm run build`.

---

## Contributing Guidelines

1. **Branch naming:** `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
2. **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
3. **Linting:** Run `npm run lint` and resolve all Oxlint errors before opening a PR.
4. **Component scope:** Keep page components focused on layout and data orchestration. Extract reusable UI into `components/` or a feature-level `components/` directory.
5. **No secrets:** Never commit `.env.local`, API tokens, or credentials. Always use environment variables.
6. **Dark mode:** All new UI must support both light and dark modes via `dark:` Tailwind variants.
7. **Pull Requests:** At least one reviewer approval is required before merging to `main`.

---

<!-- TODO: confirm with team — no LICENSE file was found in the repository root -->
