# BRAND_GUIDELINES.md — Ward & Fall (ورد وفل)

## Palette source
Extracted from the logo's watercolor lavender wreath: deep violet for the
wordmark, mid-lavender petals, soft stem green, and the pale plum watercolor
wash behind the text. A touch of floral blush is layered in as a secondary
accent so the palette doesn't read as a single flat purple. Product
photography and category colors stay swappable later — the user will
finalize product images/details afterward.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `primary` | `#5B3A73` | CTAs, links, primary accents — deep violet from the wordmark |
| `primary-light` | `#8C6BA8` | hover/active states, mid-lavender petals |
| `primary-dark` | `#3A2450` | headings on light surfaces, dark-mode primary |
| `lavender` | `#C9AEDD` | soft accents, chips |
| `lavender-light` | `#E9DCF2` | section alt-background, pale wash |
| `blush` | `#F3D9E4` | floral warmth accent — occasion tags, soft highlights |
| `sage` | `#7C9473` | logo's stem green — small botanical accents only |
| `sage-light` | `#C7D6BE` | subtle green fills |
| `ink` | `#2E2036` | body text, dark surfaces |
| `gold` | `#B99A66` | price highlights, dividers — used sparingly against the purple |
| `background` | `#FBF8FC` | page background — soft watercolor white, never stark white |
| `surface` | `#FFFFFF` | cards |
| `muted` | `#F3ECF7` | section alt-background |
| `border` | `#E4D7EC` | hairlines |

Dark mode is an intentional second palette (`#211A28` background, `#2B2233`
surface, `#F1E9F5` text) — not an inversion.

## Typography
- Display (EN): **Fraunces** — warm serif with real character, pairs with
  the logo's script/serif wordmark treatment.
- Display (AR): **Amiri**.
- Body (EN): **Work Sans**.
- Body (AR): **Cairo**.

## Spacing / radius / shadow
- Radius: `0.5rem` on cards — soft, floral, not sharp editorial.
- Shadow: single soft violet-tinted elevation (`shadow-card` token).

## Buttons
- Primary: filled `primary` (deep violet).
- WhatsApp CTA: `gold` fill, `ink` text — visually distinct from "Shop" actions.
- Secondary: outline, `border` + `ink`, fills `lavender-light` on hover.

## Product cards
- Placeholder product data/photos are swappable later — the user will
  supply final product images and may adjust category colors then.
- 4:5 image ratio, `blush` or `sage-light` used for occasion/category chips.

## Dark mode — readability fix (important)
Earlier dark mode reused light-mode heading/price tokens (`primary-dark`,
a near-black plum) directly, which read as dark text on a dark background.
Fixed by introducing theme-aware semantic tokens that flip inside `.dark`:

| Token | Light | Dark |
|---|---|---|
| `--color-heading` | `#3A2450` (deep plum) | `#E9D9F5` (light lavender) |
| `--color-text` | `#2E2036` | `#F5EEFA` |
| `--color-text-secondary` | `#5B4A6B` | `#C9B8D9` |
| `--color-lavender-light` (chip/icon-circle bg) | `#E9DCF2` | `#3A2E48` |
| `--color-blush` | `#F3D9E4` | `#4A2E3D` |

Rule going forward: **no component may hardcode `primary-dark` for text or
prices** — always use `--color-heading`. This is the token that's designed
to stay readable in both modes; `primary-dark` is reserved for things that
are deliberately always-dark (e.g. the footer's solid plum background).

## Semantic feedback colors
`--color-success` `#2E7D4F` (dark: `#6FCF97`), `--color-error` `#B3261E`
(dark: `#F2A29C`), `--color-warning` `#A6710A` (dark: `#E8C468`) — used for
status badges (Active/Inactive, Out of stock, Featured) in the dashboard.

## Dashboard UI rules
- Sidebar: fixed 256px on desktop, drawer + overlay under `lg` breakpoint.
- Topbar: sticky, page title left-aligned (RTL: right-aligned) via logical
  properties (`ms-`/`me-`/`ps-`/`pe-`), never `ml-`/`mr-`.
- Tables collapse to stacked cards below `md`; never horizontal-scroll a
  data table as the primary mobile pattern.
- Destructive actions (delete product/category) always go through a
  confirm dialog — no silent deletes.
- Badges use the semantic tone tokens above, never inline hex.

## Navbar / Light / Dark / RTL / LTR / Responsive rules
See `CLAUDE.md` — this file owns visual tokens, CLAUDE.md owns
architectural rules.
