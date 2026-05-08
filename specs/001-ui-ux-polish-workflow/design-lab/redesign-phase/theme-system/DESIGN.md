# SpecFlow AI — Theme System (Light + Dark)

**Source**: Design Brief Skill (design-brief)
**Product**: SpecFlow AI - spec-driven SaaS workflow tool
**Created**: 2026-05-08
**Direction**: Agent Control Room — Dual Theme
**Theme Purpose**: Operator-grade workspace, full-app theme switch

---

## 1. Visual Theme & Atmosphere

**The concept**: One product, two atmospheres. Light mode is a crisp operator workspace. Dark mode is a serious mission-control room. Same hierarchy, same component behavior, same workflow visibility — only surface treatment changes.

**Light mode feel**:
- Clean, high-contrast, crisp paper feel
- Like a well-organized control room with bright task boards
- Subtle shadows instead of dark backgrounds for elevation
- Strong borders carry the structure
- Accents are slightly more saturated to pop against white/gray

**Dark mode feel**:
- Deep charcoal, not pure black — reduces eye strain
- Strong shell separation (canvas → panel → surface)
- Borders do the elevation work, minimal shadows
- Accents are electric against dark — high signal
- Same density as light, just inverted luminance

**Both share**:
- Same component hierarchy (shell → workspace → cards → inputs)
- Same typography scale and weights
- Same spacing system
- Same status indicators (dot + label)
- Same interaction patterns
- Same workflow visibility (sessions, agents, handoffs, approvals)

**Guiding rule**: Neither theme should feel like a fallback. Both are first-class.

---

## 2. Color Palette — Token Sets

### Semantic Token Mapping

Every component uses semantic tokens, not raw colors. The implementation swaps the token values based on the active theme class (`.theme-light` or `.theme-dark`).

### Dark Theme Tokens

| Token | Role | Hex | Usage |
|---|---|---|---|
| `--bg-canvas` | Full app background | `#0C1117` | Main workspace, behind everything |
| `--bg-panel` | Shell, sidebar, header | `#131A24` | Navigation, top bar |
| `--bg-surface` | Cards, elevated content | `#1A2332` | Active cards, dropdowns |
| `--bg-input` | Input fields, code blocks | `#0F1822` | Form fields, inline code |
| `--border-default` | Dividers, row separators | `#1E2D3D` | Subtle structure |
| `--border-strong` | Active, focus, selected | `#2D4A6B` | Current context |
| `--text-primary` | Main text | `#E8EDF3` | Titles, body |
| `--text-secondary` | Supporting text | `#8B9DB3` | Labels, metadata |
| `--text-muted` | Tertiary, timestamps | `#536077` | IDs, timestamps, hints |
| `--accent-agent` | AI action / running | `#00C8D4` | Cyan — AI at work |
| `--accent-agent-soft` | Agent bg tint | `rgba(0,200,212,0.08)` | Row highlight |
| `--accent-sync` | Done / complete / synced | `#00A87A` | Teal — success |
| `--accent-sync-soft` | Sync bg tint | `rgba(0,168,122,0.10)` | Success highlight |
| `--accent-attention` | Review / awaiting | `#E5A000` | Amber — needs human |
| `--accent-attention-soft` | Attention bg tint | `rgba(229,160,0,0.10)` | Warning highlight |
| `--accent-danger` | Error / failed / blocked | `#D94040` | Red — intervention needed |
| `--accent-danger-soft` | Danger bg tint | `rgba(217,64,64,0.10)` | Error highlight |
| `--shadow-card` | Card elevation | `0 2px 8px rgba(0,0,0,0.3)` | Subtle lift |
| `--shadow-dropdown` | Dropdown/modal | `0 8px 24px rgba(0,0,0,0.5)` | Floating elements |

### Light Theme Tokens

| Token | Role | Hex | Usage |
|---|---|---|---|
| `--bg-canvas` | Full app background | `#F4F6F8` | Main workspace |
| `--bg-panel` | Shell, sidebar, header | `#FFFFFF` | Navigation, top bar |
| `--bg-surface` | Cards, elevated content | `#FAFBFC` | Active cards |
| `--bg-input` | Input fields, code blocks | `#F0F2F5` | Form fields, code |
| `--border-default` | Dividers, row separators | `#E2E6EB` | Subtle structure |
| `--border-strong` | Active, focus, selected | `#C8D2DC` | Current context |
| `--text-primary` | Main text | `#1A2332` | Titles, body |
| `--text-secondary` | Supporting text | `#5A6775` | Labels, metadata |
| `--text-muted` | Tertiary, timestamps | `#94A3B3` | IDs, timestamps |
| `--accent-agent` | AI action / running | `#0891B2` | Darker cyan for light bg |
| `--accent-agent-soft` | Agent bg tint | `rgba(8,145,178,0.06)` | Row highlight |
| `--accent-sync` | Done / complete / synced | `#059669` | Darker teal |
| `--accent-sync-soft` | Sync bg tint | `rgba(5,150,105,0.08)` | Success highlight |
| `--accent-attention` | Review / awaiting | `#D97706` | Darker amber |
| `--accent-attention-soft` | Attention bg tint | `rgba(217,119,6,0.08)` | Warning highlight |
| `--accent-danger` | Error / failed / blocked | `#DC2626` | Darker red |
| `--accent-danger-soft` | Danger bg tint | `rgba(220,38,38,0.08)` | Error highlight |
| `--shadow-card` | Card elevation | `0 1px 3px rgba(0,0,0,0.08)` | Subtle lift |
| `--shadow-dropdown` | Dropdown/modal | `0 4px 16px rgba(0,0,0,0.12)` | Floating elements |

### Theme Switch Rules

1. **CSS custom properties** hold the token values. Theme class on `<html>` swaps the entire set.
2. **No component-specific theme logic** — every component references tokens, not colors.
3. **Same accent hues** in both themes, just slightly adjusted lightness for contrast.
4. **Borders are more visible in dark mode** (light borders on dark don't compete), **stronger borders in light mode** (dark borders on light need weight).
5. **Shadows are stronger in dark mode** (to lift from dark canvas), **subtle in light mode** (to lift from white canvas).

---

## 3. Typography Rules

**Identical in both themes** — only the text color token changes.

**Font Stack**:
```
Display/UI: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Mono:       'JetBrains Mono', 'Fira Code', ui-monospace, Consolas, monospace
```

**Scale** (unchanged from base design system):

| Role | Size | Weight | Line Height |
|---|---|---|---|
| Page title | 18px | 600 | 26px |
| Panel heading | 14px | 600 | 20px |
| Body | 13px | 400 | 20px |
| Label | 12px | 500 | 16px |
| Metric | 20px | 700 | 26px |
| Code/ID | 12px | 400 | 16px |

**Typography rules** (both themes):
- Tabular numbers everywhere (`font-variant-numeric: tabular-nums`)
- Monospace for: session IDs, agent IDs, timestamps, hashes, diffs
- Letter-spacing: -0.01em on page titles

---

## 4. Component Adaptations Across Themes

All components share the same structure. Only surface treatment changes.

### App Shell

| Element | Dark | Light |
|---|---|---|
| Background | `--bg-canvas` (#0C1117) | `--bg-canvas` (#F4F6F8) |
| Sidebar/header | `--bg-panel` (#131A24) | `--bg-panel` (#FFFFFF) |
| Borders | `--border-default` (#1E2D3D) | `--border-default` (#E2E6EB) |
| Text | `--text-primary` (#E8EDF3) | `--text-primary` (#1A2332) |

**Behavior unchanged**: Sidebar width, header height, nav structure identical.

### KPI Panel

| Element | Dark | Light |
|---|---|---|
| Card bg | `--bg-panel` (#131A24) | `--bg-panel` (#FFFFFF) |
| Border | 1px `--border-default` | 1px `--border-default` |
| Shadow | None | `--shadow-card` (subtle) |
| Dot colors | Same accent values | Same accent values, slight saturation boost |

**Behavior unchanged**: 4-column layout, dot + number + label structure, hover state.

### Session Card

| Element | Dark | Light |
|---|---|---|
| Card bg | `--bg-surface` (#1A2332) | `--bg-surface` (#FAFBFC) |
| Border | 1.5px `--border-strong` | 1.5px `--border-strong` |
| Shadow | None | `--shadow-card` |
| Progress track | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` |
| Progress fill | `--accent-agent` | `--accent-agent` |

**Behavior unchanged**: Agent dot, task label, progress bar, tags — all identical.

### Prompt Chain Table

| Element | Dark | Light |
|---|---|---|
| Header bg | `--bg-canvas` | `--bg-canvas` |
| Row bg | `--bg-panel` | `--bg-panel` |
| Active row | `--accent-agent-soft` | `--accent-agent-soft` |
| Hover row | `--bg-surface` | `--bg-surface` |
| Borders | `--border-default` | `--border-default` |

**Behavior unchanged**: Grid layout, step numbers, status dots, durations.

### Approval Queue

| Element | Dark | Light |
|---|---|---|
| Card bg | `--bg-panel` (#131A24) | `--bg-panel` (#FFFFFF) |
| Border | `--border-default` | `--border-default` |
| Shadow | None | `--shadow-card` |
| Buttons | Same styles | Same styles |

**Behavior unchanged**: Amber dot, title, description, action buttons.

### Command/Search Trigger

| Element | Dark | Light |
|---|---|---|
| Button bg | `--bg-panel` | `--bg-panel` |
| Border | `--border-default` | `--border-default` |
| Hover | `--border-strong`, `--bg-surface` | `--border-strong`, `--bg-surface` |
| Text | `--text-muted` | `--text-muted` |

**Behavior unchanged**: Icon + label + Cmd+K badge + keyboard shortcut.

### Status Indicators

**Exactly the same in both themes** — the 8px dots and labels are the one element that doesn't need adaptation.

```
[8px dot] [Status label]

- Active: --accent-agent (cyan)
- Done: --accent-sync (teal)
- Awaiting: --accent-attention (amber)
- Error: --accent-danger (red)
- Idle: --accent-neutral (#4A5568 dark / #6B7280 light)
```

Only difference: In light mode, the neutral dot uses `#6B7280` (slightly darker to show against white).

---

## 5. Layout Principles

**Identical in both themes.**

**Spacing Scale** (4px base):
```
4, 8, 12, 16, 24, 32, 48, 64
```

**Layout structure** (both themes):
```
┌─────────────────────────────────────────────────┐
│ Header: 56px · bg-panel · bottom border          │
├────────────┬────────────────────────────────────┤
│            │                                     │
│  Sidebar   │  Main: bg-canvas                    │
│  240px     │                                     │
│  bg-panel  │  Page header                         │
│            │  KPI bar                             │
│  Nav       │  Content cards (bg-panel/bg-surface)│
│  - Status  │                                     │
│  - Session │                                     │
│  - Agents  │                                     │
│  - Review  │                                     │
│  - Exports │                                     │
│  - Settings│                                     │
└────────────┴────────────────────────────────────┘
```

**Responsive**: Same breakpoints and behavior in both themes.

---

## 6. Depth & Elevation

**Dark mode**:
- Borders do elevation: `--border-strong` (1.5px) for active, `--border-default` (1px) for static
- Shadows only on dropdowns/modals: `--shadow-dropdown`
- Surface layers: canvas (darkest) → panel → surface → input (darkest)

**Light mode**:
- Shadows do elevation: `--shadow-card` on cards, `--shadow-dropdown` on floating
- Borders lighter: `--border-default` (1px), `--border-strong` (1.5px) for active
- Surface layers: canvas (lightest) → surface → panel → input (slightly darker)

**Both modes**:
- No gradients anywhere
- Focus ring: 2px `--accent-agent` with 2px offset
- Modal overlay: `rgba(0,0,0,0.5)` dark / `rgba(0,0,0,0.3)` light

---

## 7. Do's and Don'ts

**DO**:
- Use semantic tokens for every color (`--bg-canvas`, `--accent-agent`, not `#0C1117`)
- Both themes must pass WCAG AA contrast on `--text-primary` (4.5:1 minimum)
- Maintain identical component behavior across themes
- Same animation durations in both themes (sidebar: 200ms, modal: 150ms, hover: 100ms)
- Tabular numbers in both themes
- Agent status pulse animation works identically in both (respects `prefers-reduced-motion`)

**DON'T**:
- Hardcode colors in components — always reference tokens
- Add theme-specific features (e.g., "dark mode has more padding")
- Swap accent colors between themes (keep cyan for AI, teal for sync, amber for review)
- Make light theme feel like a "day mode" default and dark as "pro mode" — both are equal
- Use different border radii between themes
- Add different typography weights between themes

---

## 8. Accessibility

**Both themes**:
- `--text-primary` on `--bg-panel`: Dark 7.8:1, Light 14.2:1
- `--text-secondary` on `--bg-panel`: Dark 5.2:1, Light 6.8:1
- `--text-muted` on `--bg-panel`: Dark 3.8:1, Light 4.1:1 (reserved for IDs/timestamps only)
- Focus ring uses `--accent-agent` in both themes — visible on both backgrounds

**Theme toggle**:
- Store preference in `localStorage` key `specflow-theme`
- Respect `prefers-color-scheme` as initial value if no stored preference
- Toggle applies to `<html>` class, all components respond via CSS custom properties

---

## 9. Implementation Notes

**CSS architecture**:
```css
/* Base tokens (dark default) */
:root {
  --bg-canvas: #0C1117;
  --bg-panel: #131A24;
  --text-primary: #E8EDF3;
  /* ... */
}

/* Light theme override */
.theme-light {
  --bg-canvas: #F4F6F8;
  --bg-panel: #FFFFFF;
  --text-primary: #1A2332;
  /* ... */
}

/* Component uses tokens */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  /* No theme-specific code needed */
}
```

**Theme toggle implementation**:
```js
const themes = { dark: 'theme-dark', light: 'theme-light' };
function setTheme(theme) {
  document.documentElement.classList.remove(...Object.values(themes));
  document.documentElement.classList.add(themes[theme]);
  localStorage.setItem('specflow-theme', theme);
}
```

**No per-component theming** — the entire app switches at once. Every component inherits from the token layer.

---

## 10. Agent Prompt Guide

- Do NOT use hex values in components — always use `--token` references
- Both themes must be equally complete — no "dark mode first" / "light mode fallback"
- Keep accent colors consistent: cyan = AI, teal = sync, amber = review, red = error
- Same component structure in both — only color treatment changes
- Test contrast in both themes — light mode needs darker text, dark mode needs lighter
- Tabular numbers, monospace IDs, status dots — identical behavior in both
- Shadow treatment differs: dark mode uses borders for elevation, light mode uses shadows
- Theme toggle persists to localStorage, respects system preference on first load