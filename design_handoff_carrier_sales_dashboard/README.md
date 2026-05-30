# Handoff: Inbound Carrier Sales — Dashboard (Focused layout)

## Overview
A metrics dashboard for a freight brokerage's **inbound carrier sales automation** (HappyRobot FDE
challenge). An AI voice agent answers inbound carrier calls, verifies the carrier (FMCSA / MC number),
matches a load, pitches it, negotiates the rate (up to 3 rounds), and classifies each call's **outcome**
and **carrier sentiment**. This dashboard is the human-facing reporting layer over that pipeline.

The chosen direction is **"Focused"**: low information density, generous whitespace, a dark `#121212`
base, green as the single primary accent, and red/amber/gray used **only** for status semantics.

## About the Design Files
The files in `reference/` are a **design reference built in HTML** (React + in-browser Babel, hand-rolled
SVG charts). They are a prototype of the intended look and behavior — **not** production code to ship as-is.
Your task is to **recreate this design in the target codebase's environment** using its established
patterns. For this FDE challenge the natural target is a **React app (Vite/Next) + a charting lib**
(Recharts / visx / ECharts) talking to the metrics API. If you start from scratch, React + TypeScript +
Tailwind (or CSS Modules) maps cleanly onto the token list below.

Treat `reference/styles.css` as the source of truth for exact colors/spacing, and `reference/*.jsx` for
structure, data shape, and interaction logic.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions are all specified. Recreate the UI
pixel-accurately. Charts are hand-built SVG in the reference — feel free to swap in a charting library as
long as the visual result matches (smooth area/line, dashed secondary line, donut with hover-dim).

---

## Screen: Dashboard (single view, vertical scroll)

### Layout
- **App shell**: horizontal flex. Left **sidebar** (fixed `232px`) + **main** content area (fills rest).
  - Sidebar is `position: sticky; top: 0; height: 100vh` (stays put while main scrolls).
  - Main content is centered with `max-width: 1500px`, padding `28px 32px 40px`.
- **Main content** is a vertical flex with `gap: 22px`, in this order (top → bottom):
  1. **Header row** — title block (left) + status pills (right)
  2. **KPI row** — 4 equal cards, `display:grid; grid-template-columns:repeat(4,1fr); gap:16px`
  3. **Insight row** — 2 cards side by side via `display:flex; gap:16px; align-items:stretch`
     - Outcome Breakdown (`flex: 1.4`) + Carrier Sentiment (`flex: 1`)
  4. **Recent Calls** — full-width card with filter chips + table
- Responsive: below `1180px`, the KPI grid collapses to `repeat(2,1fr)`.

> Note: an earlier version had a large "Call Activity" line chart between KPIs and the insight row, plus
> an "Integration Status" strip at the bottom. **Both were removed** in the final design. The reference
> `charts.jsx` still ships a `LineChart`/`ResponsiveLine` (used by other layout options) — not needed for
> this screen, but kept if you want to reintroduce a trend chart later.

### Components

**1. Sidebar (`.hr-side`)**
- Background `#0e0e0e`, right border `1px solid rgba(255,255,255,.07)`, padding `26px 18px`, vertical flex `gap:30px`.
- **Brand**: 34×34 rounded square (`radius 9px`, bg `rgba(51,209,126,.13)`, border `rgba(51,209,126,.32)`, a bolt glyph in green) + "HappyRobot" (`800`, 16px) with a mono eyebrow "FREIGHT OS" (9.5px, letter-spacing `.22em`, green, uppercase).
- **Nav** group label "OPERATIONS" (mono, 10px, `.16em` tracking, tertiary). Items: Dashboard (active), Calls, Loads, Carriers, Reports, Settings. Each: icon (18px) + label (14px, weight 500), padding `10px 11px`, radius `10px`.
  - Hover: bg `#181818`, text → primary. Active: bg `#1f1f1f`, icon tinted green.
- **Footer** (pinned bottom via `margin-top:auto`, top border): avatar "AM" (green tinted circle) + "Alex Martinez" / "Operations Team" + chevron.

**2. Header**
- Title `h1` "Inbound Carrier Sales": 25px, weight 800, letter-spacing `-.025em`.
- Subtitle: "Carrier verification, load matching & automated rate negotiation." — 13.5px, secondary `#9a9a96`, margin-top 6px.
- **Status pills** (right, wrap, `gap:8px`), each a `999px` pill, bg `#181818`, border `rgba(255,255,255,.07)`, 12px text:
  - `● Operational` (green 7px dot with green glow ring)
  - `🛡 FMCSA Live` ("Live" in mono, primary color; shield icon green)
  - `🕐 Updated 2m ago` ("2m ago" in mono)

**3. KPI card (`.hr-kpi`)** — 4 of them. Card: bg `#181818`, border `rgba(255,255,255,.07)`, radius `16px`, padding `22px`. Hover lifts border to `rgba(255,255,255,.11)`. Internal vertical flex `gap:14px`:
- Top row: label (12.5px, secondary) + 30×30 icon chip (radius 8px, bg `#1f1f1f`).
- Value: 34px, weight 800, letter-spacing `-.03em`, `font-variant-numeric: tabular-nums`. Optional unit suffix (16px, secondary) e.g. `%`, `rounds`.
- Foot row: delta pill + sub-label + sparkline (pushed right).
  - Delta: arrow icon + value, 12.5px weight 700. **Up = green, down = red.** Exception: when a *lower* number is better (negotiation rounds), pass a "good-down" flag so a downward delta renders **green**.
  - Sub-label: 12px tertiary `#646461`.
  - Sparkline: 96×30 SVG area+line, green (or red if it's a genuine bad-down metric).

The four KPIs (exact copy & data):
| Label | Value | Delta | Sub | Spark trend |
|---|---|---|---|---|
| Inbound Calls | `4,982` | `+12.4%` (up/green) | vs prior 7 days | rising |
| Booking Rate | `39.7%` | `+3.2 pp` (up/green) | 732 of 1,842 eligible | rising |
| Avg Margin / Load | `$312` | `+9.0%` (up/green) | vs $284 prior | rising |
| Avg Negotiation | `2.3 rounds` | `−0.4` (down, **green** via good-down) | to reach agreement | falling |

**4. Card shell (`.hr-card`)** — used by Outcome / Sentiment / Recent Calls. bg `#181818`, border `rgba(255,255,255,.07)`, radius `16px`, padding `22px`. Header: title (15px, weight 700) on left, a green text-link "Report →" / "View all calls →" on right (12.5px, weight 600, green, hover → lighter green `#6fe0a3`).

**5. Outcome Breakdown card** — horizontal flex, `gap:30px`:
- **Donut** (184×184, stroke 26px): segments in legend order, track color `#262626`. Center label "4,982" (27px, 800) over "Total Calls" (11px tertiary).
- **Legend** (`flex:1`): one row per outcome — 9px rounded swatch + name (13px) on the left, value (mono, 13px, weight 600) + percent (mono, 11.5px, tertiary, right-aligned 48px col) on the right. Row hover bg `#1f1f1f`.
- **Hover linkage**: hovering a donut segment OR its legend row dims the other segments to `opacity .28` and thickens the active arc by 4px. Implemented via a shared `activeKey` state.

Outcome data (maps to the agent's call-outcome classification):
| Key | Name | Value | % | Color |
|---|---|---|---|---|
| booked | Booked | 732 | 14.7% | green `#33d17e` |
| agreed | Rate Agreed | 1,102 | 22.1% | light green `#6fe0a3` |
| match | Not a Match | 1,563 | 31.4% | amber `#e8b84b` |
| noans | No Answer | 892 | 17.9% | gray `#7c7c79` |
| disq | Disqualified | 693 | 13.9% | red `#e5645a` |

**6. Carrier Sentiment card** — vertical flex. Three labeled progress bars (maps to the agent's sentiment classification):
- Each: label + right-aligned percent (mono) above a 7px track (`#262626`, radius 99) with a colored fill.
  - Positive `72%` (green), Neutral `18%` (amber), Negative `10%` (red).
- Footer note (pinned bottom, 12px tertiary): "Classified from transcript tone across **4,289** completed calls." (the number in mono/secondary).

**7. Recent Calls card** — the operational core.
- Header: "Recent Calls" + "View all calls →".
- **Filter chips** row (`gap:7px`): All `8`, Booked `2`, Rate Agreed `2`, Not a Match `2`, No Answer / Disq. `2`. Chip: 12.5px weight 600, bg `#1f1f1f`, border, radius 8px, padding `6px 12px`, with a mono count. Selected chip: bg `#262626`, brighter border, primary text. Clicking filters the table rows; counts are computed from the data.
- **Table** (`.hr-table`): columns **Carrier · Eligibility · Lane · Outcome · Offer · Agreed · Rounds · Sentiment**.
  - Header cells: 11px uppercase, tertiary, `.06em` tracking. Offer/Agreed/Rounds are right-aligned (`.num`).
  - Rows: `14px` padding, top border `rgba(255,255,255,.07)`, hover bg `#1f1f1f`, cursor pointer.
  - **Carrier** cell: name (13.5px, weight 650) + MC number (mono, 11.5px, tertiary).
  - **Eligibility / Outcome**: status badges (see below). Eligibility badge uses a leading dot.
  - **Lane**: mono `ORIG → DEST` (weight 600, arrow icon tertiary) + equipment sub-line e.g. "Van · 2,200 mi" (11.5px tertiary).
  - **Offer**: mono, muted (e.g. `$2.45` or `—`).
  - **Agreed**: mono, weight 600, **green** when present, tertiary when `—`.
  - **Rounds**: mono, muted integer.
  - **Sentiment**: 8px colored dot + label (Positive/Neutral/Negative/Unknown, 12px).

Row data (8 rows):
```
Pinnacle Logistics  MC 123456  Eligible      DAL→LAX  Van·2,200mi    Booked       $2.45 $2.38 3 Positive
Summit Freight LLC  MC 654321  Eligible      ATL→ORD  Reefer·720mi   Rate Agreed  $2.10 $2.05 2 Positive
Velocity Transport  MC 789012  Not a Match   PHX→DEN  Van·602mi      Not a Match   —     —    1 Neutral
Northline Carriers  MC 345678  Eligible      MIA→ATL  Reefer·662mi   No Answer     —     —    1 Unknown
Rapid Haul Inc.     MC 901234  Disqualified  CHI→SEA  Van·1,730mi    Disqualified  —     —    1 Negative
Cascade Freight Co. MC 553311  Eligible      SLC→PDX  Flatbed·765mi  Booked       $2.60 $2.52 2 Positive
Lone Star Logistics MC 778210  Eligible      HOU→MEM  Van·561mi      Rate Agreed  $1.95 $1.92 3 Neutral
Evergreen Trucking  MC 442109  Not a Match   SEA→BOI  Reefer·502mi   Not a Match   —     —    1 Unknown
```

**Status badge (`.hr-badge`)** — radius 7px, 12px weight 600, padding `4px 10px`, tinted bg + matching border:
- green (Booked / Eligible / Positive): text `#33d17e`, bg `rgba(51,209,126,.13)`, border `rgba(51,209,126,.32)`. "Rate Agreed" uses the lighter green `#6fe0a3` text.
- amber (Not a Match / Neutral): text `#e8b84b`, bg `rgba(232,184,75,.12)`, border `rgba(232,184,75,.30)`.
- red (Disqualified / Negative): text `#e5645a`, bg `rgba(229,100,90,.12)`, border `rgba(229,100,90,.32)`.
- gray (No Answer / Unknown): text `#7c7c79`, bg `rgba(150,150,148,.12)`, border `rgba(255,255,255,.07)`.

---

## Interactions & Behavior
- **Sidebar nav**: clicking sets the active item (visual only in the prototype; wire to routes).
- **Filter chips** (Recent Calls): single-select; filters the table to that outcome category. "No Answer / Disq." matches either No Answer or Disqualified. Counts are derived from the dataset.
- **Donut ↔ legend hover linkage**: shared `activeKey`; hover dims non-active segments (`opacity .28`, `transition .15s`) and grows the active arc.
- **Hover states**: cards lift their border on hover; table rows and legend rows highlight (`#1f1f1f`).
- **Text links** ("Report →", "View all calls →") brighten green on hover.
- Transitions are subtle: `.12s–.16s` ease on background/border/color/opacity.
- No modals/loading/error states are specified in this screen — add per your app's conventions.

## State Management
- `activeNav` — selected sidebar item.
- `outcomeFilter` — selected Recent Calls chip (`all | booked | agreed | match | lost`).
- `activeOutcomeKey` — hovered donut/legend segment (or null).
- Data: in production, fetch KPIs, the outcome distribution, sentiment distribution, and a paginated
  recent-calls list from the metrics API. The reference hardcodes everything in `shell.jsx`'s `DATA` object —
  use that as the **API response shape contract**.

### Suggested API → UI mapping (from the challenge's per-call extraction)
Each completed call yields: `mc_number`, `eligible` (FMCSA), matched `load` (origin, destination,
equipment_type, miles, loadboard_rate), negotiation `initial_offer` / `agreed_rate` / `rounds`,
`outcome` (booked | rate_agreed | not_a_match | no_answer | disqualified), and `sentiment`
(positive | neutral | negative). KPIs and the donut/sentiment cards are aggregations over that table.

---

## Design Tokens (from `styles.css`, all prefixed `--hr-`)
**Color**
- bg `#121212` · sidebar `#0e0e0e` · surface `#181818` · surface-2 `#1f1f1f` · surface-3 `#262626`
- line `rgba(255,255,255,.07)` · line-2 `rgba(255,255,255,.11)`
- text t1 `#f3f3f1` · t2 `#9a9a96` · t3 `#646461`
- green `#33d17e` · green-2 `#6fe0a3` · green-bg `rgba(51,209,126,.13)` · green-bd `rgba(51,209,126,.32)`
- amber `#e8b84b` (bg `rgba(232,184,75,.12)`, bd `rgba(232,184,75,.30)`)
- red `#e5645a` (bg `rgba(229,100,90,.12)`, bd `rgba(229,100,90,.32)`)
- gray `#7c7c79` (bg `rgba(150,150,148,.12)`)

**Type** — UI: **Hanken Grotesk** (400/500/600/700/800). Data/codes/numbers: **JetBrains Mono**
(400–700). Numeric displays use `font-variant-numeric: tabular-nums`. Base tracking `-0.011em`.
Scale used: 25 (h1) · 15 (card title) · 13.5 (body/carrier) · 12.5 (labels/links) · 11–12 (sub/mono caps) · 34 (KPI value) · 27 (donut center).

**Radius** — card 16 · inner 11 · chip/badge 7–8 · pill 999.
**Spacing** — page gap 22 · grid/flex gap 16 · card padding 22 · table cell 14.
**Borders** — 1px hairlines using the line tokens; no drop shadows (flat dark surfaces, depth via border + bg steps).

## Assets
- **Fonts**: Hanken Grotesk + JetBrains Mono via Google Fonts.
- **Icons**: a small inline-SVG set (24×24, stroke 1.7, `currentColor`) defined in `shell.jsx` (`ICONS`): grid, phone, truck, swap, bars, gear, target, dollar, loop, check, headset, shield, clock, bolt, mic, board, eld, arrow, chevron, search, bell, info, dots. Replace with your icon library (Lucide is the closest match) — keep stroke weight ~1.7 and the same metaphors.
- **Charts**: hand-built SVG in `charts.jsx` (Donut + Sparkline are used here; LineChart/ResponsiveLine are optional extras). No raster assets.
- No logos beyond the text wordmark + bolt glyph.

## Files (`reference/`)
- `Carrier Sales Dashboard — Focused.html` — the standalone, full-screen final screen (open in a browser to interact).
- `styles.css` — **the design-token + component-class source of truth**.
- `variantA.jsx` — the Focused screen's structure + interaction logic (filters, hover linkage).
- `shell.jsx` — `DATA` (API shape contract), the icon set, and shared primitives (Sidebar, KpiCard, Badge, OutcomeLegend, RecentCalls, SentimentBody).
- `charts.jsx` — SVG Donut + Sparkline (+ optional LineChart/ResponsiveLine).
- `screenshots/01-top.png`, `02-bottom.png` — reference renders.
