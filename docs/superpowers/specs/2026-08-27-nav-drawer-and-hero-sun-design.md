# Mobile nav drawer + hero CN Tower sun/glow

## Problem

Two visual issues on the public site, both flagged from a live mobile screenshot:

1. **Mobile nav is cluttered.** `Nav.tsx` has no mobile collapse at all — the header just
   `flexWrap`s, so on narrow screens all 6 links plus the Register button stack directly
   under the logo, pushing the hero content far down the page.
2. **The CN Tower graphic competes with the hero text.** `CnTower.tsx` renders with
   `zIndex: 0` while the hero copy around it is plain static-positioned content. A
   positioned `z-index: 0` element paints above non-positioned in-flow content, so the
   tower visually sits on top of the headline instead of behind it. (This half of the
   problem — `zIndex: -1` — was already fixed as a quick correctness fix before this
   design session; it's noted here for completeness, not proposed as new work.) Beyond
   that fix, the tower itself reads as a lone flat-blue line icon floating in space with
   a hard-cut bottom edge where it's clipped.

## Decisions made (via visual brainstorming)

### 1. Mobile nav → slide-in drawer, grid-textured

- Below the existing 720px mobile breakpoint (same one `AgendaFlightPath` and `CnTower`
  already use — stay consistent, don't introduce a second breakpoint), the header
  collapses to **logo + hamburger icon only**. The 6 links and the Register button move
  into a drawer.
- Desktop (≥720px) is **unchanged** — full inline nav, no hamburger, no drawer markup
  rendered.
- The drawer **slides in from the right** over a dimmed backdrop (not a dropdown that
  pushes content, not a full-screen takeover).
- Drawer surface is **grid-textured**: reuses the sitewide blueprint-grid pattern
  (`gridBg` in `lib/tokens.ts`) as its background, at a tighter tile size than the
  full-page backdrop so it reads as a distinct panel, not a continuation of the page.
- Content inside the drawer, top to bottom: close (×) control, the 6 links stacked
  vertically, then the Register Free / Registration Closed action — same open/closed
  logic the desktop nav already has.
- Active link gets the same treatment as desktop: accent color + bold weight, plus a
  left accent bar (this detail is drawer-only, desktop's active state stays text-color
  only as it is today).
- Interaction: opens on hamburger tap; closes on backdrop tap, Escape, or picking a
  link. Body scroll is locked while the drawer is open. Hamburger button gets
  `aria-expanded` + `aria-label`; the drawer's close control gets `aria-label="Close
  menu"` (matching the existing pattern in `RecordDrawer.tsx`).

### 2. CN Tower → gradient + halo, plus a small standalone "sun"

Two independent light sources, both subtle:

- **Tower**: its spire/legs pick up an accent gradient stroke (`accentHi` → `accent` /
  `accentDim`, the same gradient the agenda rail already uses) instead of the current
  flat `#4da8ff`. A soft blurred radial glow sits behind it. The whole graphic fades out
  near its bottom edge via a gradient mask to the page background color, instead of
  hard-cutting at a fixed height.
- **Sun**: a small, separate warm-colored (`c.warn` amber) glowing orb — roughly a
  12–14px solid core inside a ~30–35px soft blurred halo — positioned near the tower's
  tip, independent of the tower's own blue glow. It drifts gently using the existing
  `softFloat` keyframe (the same one already used on the small accent square elsewhere
  in the hero), rather than sitting perfectly still.
- Explicitly **not** doing: a blinking beacon light, a radar-ping ring
  (`pulseRing`), staggered multi-level lights, a light beam down the spire, a large
  horizon-sunrise composition, or a retro striped sun. All of these were explored and
  shown during brainstorming; the approved direction is the small floating sun described
  above, not any of the blink/ping/beam variants.
- The sun is part of the same decorative group as the tower and shares its existing
  ref-driven scroll parallax (no separate scroll logic).
- Everything here stays `aria-hidden`, `pointer-events: none`, and hidden below 720px,
  same as today.

## Component boundaries

- **`components/site/Nav.tsx`**: add `open` state for the drawer, the hamburger button,
  and the drawer markup, gated behind the same `(max-width: 720px)` `matchMedia` pattern
  already used in `CnTower.tsx` / `AgendaFlightPath.tsx`. No new file — the component is
  small enough (~130 lines) that this stays a straightforward addition, not a split.
- **`components/site/CnTower.tsx`**: add the gradient stroke, halo, bottom fade mask, and
  the sun element directly in the existing component. No new file for the same reason.

## Out of scope

- No changes to desktop nav layout or behavior.
- No changes to the tower's parallax speed/mechanics (already fixed for scroll-jank in a
  prior change) — this spec only touches its visual treatment.
- No focus-trap library or scroll-lock library — body scroll lock while the drawer is
  open is a plain `overflow: hidden` toggle, matching the project's "no new
  dependencies" convention.
