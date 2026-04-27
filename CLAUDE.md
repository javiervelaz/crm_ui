# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Start Next.js dev server (port 3000)
npm run start          # Start production server
npm run prettier       # Format all files
npm run prettier:check # Check formatting without changes
npm run seed           # Seed the database (uses dotenv)
```

There is no build, lint, or test script configured. ESLint and TypeScript errors are suppressed during builds (`next.config.js`).

## Architecture Overview

Next.js 14 **App Router** CRM/POS system for LATAM SMBs. The backend API is a separate Node.js/Express service (default `http://localhost:3001/api`), configured via `NEXT_PUBLIC_API_URL`.

### Routing & Access Control

All protected routes live under `/dashboard/*`. Public routes are `/`, `/catalogo/*`, and `/saas/*`.

Access control is **module-based**: the JWT payload includes a `modules` string array (e.g., `['operaciones', 'productos']`). The `useAuthCheck()` hook (at `app/lib/useAuthCheck.ts`) runs on every route change, decodes the token, checks expiration, and redirects unauthorized users to their first permitted module. The mapping from module names to routes is in `app/lib/modulePermissions.ts`.

Some dashboard routes bypass module checks (profile, upgrade-plan, etc.) — these are hardcoded as "auxiliary routes" in `useAuthCheck`.

### Authentication

- JWT stored in `localStorage` under the key `token`
- Decoded with `jwt-decode`; token structure includes `userId`, `username`, `roles`, `modules`, `exp`
- Axios interceptor (`app/lib/apiClient.ts`) attaches `Authorization: Bearer <token>` to every request
- 401 responses trigger logout + redirect to `/`; 403 responses show a toast about plan restrictions
- Auth state is broadcast via a custom `AUTH_CHANGED_EVENT` (see `app/lib/authEvents.ts`); components listen via `window.addEventListener`

### API Layer

Two patterns coexist — prefer `apiClient` for new code:

1. **`apiClient` (Axios)** — `app/lib/apiClient.ts`. Singleton with request/response interceptors for auth and error toasts. Use for all new feature code.
2. **Fetch-based `*.api.ts` files** — `app/lib/*.api.ts`. Legacy pattern used by specific features (productos, usuarios, operaciones, etc.). Token injected manually.

### State Management

No Redux, Zustand, or React Query. State is managed via:
- `useState` / `useEffect` in components with direct API calls
- Custom hooks (`useClientePlan`, `useCajaAbierta`, etc.) in `app/lib/`
- `ModalContext` (React Context) for modal open/close state only
- `localStorage` + `window` storage events for cross-component auth sync

### Page & Component Structure

Each dashboard feature follows this pattern:
```
app/dashboard/<feature>/
  page.tsx                 ← thin shell, imports from componentes/
  componentes/
    <feature>Page.tsx      ← main feature component
    <sub-components>.tsx
```

Shared UI primitives are in `components/ui/` (shadcn/ui style: button, card, select, calendar, etc.).
App-level UI (Header, Sidebar, LoginForm, global styles) lives in `app/ui/`.

### Design System

Tailwind CSS v3.4 with HSL CSS custom properties defined in `app/ui/global.css`. Colors are referenced as `bg-primary`, `text-foreground`, etc. — the actual values come from `--primary`, `--foreground`, etc. CSS variables.

- Fonts: **Inter** (sans, UI text) and **Lusitana** (serif, headings) — imported in `app/ui/fonts.ts`
- Dark mode: `.dark` class on root toggles all CSS variable values
- Plugins: `tailwindcss-animate`, `@tailwindcss/forms`

### Key Environment Variables

```
NEXT_PUBLIC_API_URL                 # Backend Express API base URL
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME   # Image uploads
NEXT_PUBLIC_MP_MOCK                 # Toggle Mercado Pago mock mode
NEXT_PUBLIC_MICROSITIO_CLIENTE_ID   # Multi-tenant public catalog IDs
CRON_SECRET                         # Validates cron job requests
```

### Integrations

- **Mercado Pago** — payment processing (toggle mock with `NEXT_PUBLIC_MP_MOCK`)
- **Cloudinary** — product image storage
- **Meta/WhatsApp Business API** — referenced in backend; token should be in env, not in README
- **Vercel Postgres** (`@vercel/postgres`) — used in API routes and seed script
