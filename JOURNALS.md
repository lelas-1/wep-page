# JOURNALS.md — Ward & Fall

## Session 1 — Phase 1: Foundation

### Completed
- Scaffolded Vite + React 19 + TypeScript project
- Installed Tailwind CSS v4, React Router, Lucide React, react-helmet-async
- Defined "Atelier Bloom" design tokens (`src/index.css`) — rose/ink/gold on
  warm ivory, deliberately different from the logo's lavender-wreath default
- Created `CLAUDE.md`, `BRAND_GUIDELINES.md`, `JOURNALS.md`

### Components created
- None yet — tokens only.

### Components tested
- None yet.

### Responsive tests
- Not started.

### Design decisions
- Palette sourced from real product photography, not the logo alone (see
  BRAND_GUIDELINES.md "Why not the lavender-wreath default").

### Remaining tasks
- Phase 2: Navbar, Hero, Categories, Product cards, Featured products,
  About, Occasions, Testimonials, Contact, Footer
- Phase 3: Product details, WhatsApp ordering, mock product data
- Phase 4: Admin dashboard
- Phase 5: Full responsive/RTL/dark-mode QA

### Known issues
- None yet.

### Next recommended step
Get design-system approval, then build Navbar + Hero (Phase 2 start).

## Session 2 — Admin Dashboard (frontend, mock data layer)

### Completed
- Fixed the dark-mode readability bug: introduced theme-aware semantic
  tokens (`--color-heading`, `--color-text-secondary`, plus dark-mode
  swaps for `lavender-light`/`blush`) and moved every storefront component
  off hardcoded `primary-dark` text
- `productService` / `categoryService` — mock, localStorage-backed, async,
  Supabase-shaped call signatures (`list/get/create/update/remove`)
- Admin layout: collapsible/drawer `Sidebar`, responsive `Topbar`
  (search, language, theme, notifications, avatar)
- Dashboard overview: real stat cards (from the mock service, not
  fabricated numbers), Recent Orders empty state, Quick Actions
- Products page: table (desktop) / stacked cards (mobile), search,
  category + status filters, toggle active/featured, delete with confirm
  dialog
- Shared `ProductForm` (Add + Edit use the same component), with
  validation and a mock image-upload/preview flow
- Categories CRUD (add/edit/delete/activate, product count per category)
- Orders & Customers pages: honest empty states, no fake data
- Settings page: visual-only store info fields (WhatsApp/Facebook), not
  persisted — flagged in the UI
- `npx tsc --noEmit` and `npm run build` both pass clean

### Components tested
- Type-check + production build only (no browser/QA pass yet this session)

### Design decisions
- No live Supabase connection: this sandbox has no network route to
  supabase.co and no project credentials were supplied. Documented in
  CLAUDE.md under "Supabase" with the exact swap path when credentials
  are available.
- No auth implemented on `/admin` per spec §4 ("do not invent a complex
  auth system") — sidebar/topbar are UI-only, not a real access boundary

### Remaining tasks
- Connect a real Supabase project (schema, storage bucket, service
  rewrite) once credentials are provided
- Wire the storefront's `FeaturedProducts`/product data to the same
  service instead of the separate `data/mockProducts.ts`
- Persist Settings fields
- Full responsive/RTL/dark-mode QA pass across all breakpoints (320–1920px)
- Skeleton loaders (currently a plain "Loading..." string)
- Toast feedback for save/delete actions

### Known issues
- Image upload only creates a local object URL (lost on refresh) — expected
  until Supabase Storage is connected
- `/admin` has no route guard

### Next recommended step
Get sign-off on the dashboard UI, then decide: (a) supply Supabase
credentials to go live, or (b) continue frontend-only polish (skeletons,
toasts, full QA pass) first.

## Session 3 — Real Supabase Integration

### Root causes found (for the "CRUD not reaching Supabase" report)
1. **No Supabase Auth user existed at all.** RLS correctly requires
   `authenticated` role for writes; with zero accounts, no session could
   ever be created, so every write was correctly rejected — not a bug in
   the write code itself. Fixed by creating a real admin account directly
   via SQL (pgcrypto bcrypt hash + `auth.identities` row), since no
   MCP/dashboard "create user" tool was available in this environment.
2. **`src/types/database.ts` was missing required shape.** Supabase-js v2's
   generic `insert`/`update` helpers require each table to include a
   `Relationships` array key, and the `Database` type to include `Views`,
   `Functions`, `Enums`, `CompositeTypes` — even empty. Without them,
   `tsc -b` (used by `npm run build`) silently resolved insert/update
   argument types to `never`, breaking the production build. `vite dev`
   masked this because esbuild strips types without full checking.

### Completed
- Connected real Supabase project `aspqohlunqyjvgduqwrm`: 5 tables, RLS on
  all of them, `product-images` storage bucket, verified with actual
  role-switched SQL (`set local role anon/authenticated`) — not assumed
- Rewrote `productService`, added `categoryService`, `orderService`,
  `customerService`, `authService` as real Supabase calls
- Real image upload to Storage (`uploadProductImage`), returns public URL
- Supabase Auth login page + session-gated `AdminLayout`
- Seeded 6 categories + 4 products directly into the live DB
- Removed all mock/localStorage data files from the flow
  (`data/mockProducts.ts`, `data/seedAdminData.ts`, old `types/product.ts`)
- Verified end-to-end via direct SQL role simulation: anon insert →
  blocked; authenticated insert/update/delete → all succeeded; anon
  storage upload → blocked; authenticated storage upload → succeeded
- `npx tsc -b --force` and `npm run build` both pass clean

### Known issues
- One harmless orphaned `storage.objects` metadata row from a test upload
  (`rls-test-auth.jpg`) — Supabase blocks direct SQL deletion of storage
  metadata by design; would need the Storage API or dashboard to remove.
  No real file behind it.
- Chunk-size build warning (523KB main bundle) — not an error, could be
  code-split later.
- Settings page still doesn't persist.

### Next recommended step
Log in at `/admin/login`, do a real create/edit/delete of a product in the
browser to confirm the UI flow end-to-end (the database layer itself is
now verified), then decide on Settings persistence and order entry.
