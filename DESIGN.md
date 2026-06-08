# Florista — Design Guidelines

## Color Palette
- **Primary**: Emerald green (`#10b981` / `emerald-500`) — fresh, natural, main brand color
- **Accent**: Rose (`#f43f5e` / `rose-500`) — bloom, warmth, used for alerts and highlights
- **Neutral**: Slate (`#64748b` / `slate-500`) — clean backgrounds, secondary text
- **Background**: White + `slate-50` for page backgrounds
- **Danger/Alert**: `rose-500` for spoilage warnings, overdue orders
- **Success**: `emerald-500` for healthy stock, fulfilled orders

## Typography
- **Font**: Inter (system-level, sans-serif)
- **Headings**: Semi-bold, slate-900
- **Body text**: Regular, slate-700
- **Labels/Captions**: Small, slate-500
- **Hierarchy**: H1 (2xl) → H2 (xl) → H3 (lg) → body (sm/base)

## Elevation & Spacing
- Cards use subtle `shadow-sm` with `rounded-xl` corners
- Sidebar uses `slate-900` dark background with `emerald` active states
- Consistent 4-point spacing grid (Tailwind default)
- Content areas use `p-6` padding, sections separated with `gap-6`

## Components & Patterns
- **Sidebar navigation**: Dark slate sidebar, emerald active indicators, icon + label items
- **Stat cards**: White cards with bold metric, label, and trend/icon
- **Data tables**: Clean, minimal, alternating row shading, sortable headers
- **Badges**: Pill-shaped, color-coded by status (fresh=emerald, warning=amber, critical=rose)
- **Alerts**: Rose-tinted banner/card for spoilage warnings, amber for near-expiry
- **Buttons**: Primary = emerald fill, Secondary = slate outline, Danger = rose fill
- **Forms**: Clean labels, generous input padding, inline validation

## Layout
- **Admin shell**: Full-height sidebar + main content area
- **Dashboard grid**: 2–4 column stat card row at top, data sections below
- **Mobile**: Collapsible sidebar, stacked cards, tap-friendly inputs (44px min touch targets)
- **Page max-width**: `max-w-7xl mx-auto` for content areas

## Tone & Microcopy
- Short, direct labels: "Add Flower", "Mark Fulfilled", "Assign Driver"
- Status language: "Fresh", "Use Soon", "Critical", "Fulfilled", "Out for Delivery"
- No decorative copy — every label does operational work
- Error messages: Plain, helpful — "Shelf life must be a positive number"