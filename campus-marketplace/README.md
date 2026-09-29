# Bazaar — v6

```
npm install
npm run dev
```
Never run in a browser here (no network in this sandbox) — read carefully, not rendered.

## What changed in v6

**Fixed a real bug, not the .gitignore.** You were right something was off, but it wasn't `.gitignore` (it's correctly at the project root next to `package.json`). It was a stray, empty directory literally named `src/{context,data,components,pages,home}` — leftover from my very first `mkdir` command, where the brace expansion didn't run in that shell and created one literal folder instead of five real ones. Harmless, but sloppy — removed.

**3D — hover-follow (not click-drag).** Hover the model and it tracks your cursor's movement directly, no click needed. Move away and it eases back to its normal vertical-axis auto-spin. Implemented with one invisible hit-sphere per model (`HitTarget` in `LineArtModel.jsx`) rather than handlers on each sub-mesh — the book has several page meshes, and per-mesh handlers would fire spurious enter/leave every time the cursor crossed a seam between two of them.

**Page/sidebar numbers removed.** The bottom-left step counter is gone. The right-edge dots are now plain circles with no numbers in them (still clickable to jump to a category).

**Light-mode colour, two tones.** `--accent` in light mode is now the same navy as `--text` (was a sky blue) — buttons and borders are solid navy against cream, a real two-colour system. Card background (`--bg-raised`) is a warmer, slightly deeper cream instead of stark white, so cards don't look like white cutouts on a cream page. Where accent was being used as *text* colour (title-hover, active dot, CTA links) — which would've gone invisible now that accent equals the body text colour — those specific spots use a new `--accent-soft` (a mid navy-blue) instead, so hover/active feedback stays visible. Structural uses (button fills, borders, the focus ring) stay pure navy. Dark mode's teal accent is untouched — you were pointing at the light-mode blue specifically.

**Card exit now moves upward.** Was a clip-path wipe back toward its own side; now it's a clean lift + fade (`y: -70, autoAlpha: 0`).

**Closing-section hover, correctly scoped.** Before, hovering *anywhere in the whole diagonal half* inverted its colour. Now only the bordered card box inside each half responds — the half's own background never changes, exactly as asked.

**Your models are wired in.** `book_web.glb` → Academic, `chip_web.glb` → Electronics (from your last upload). Other still uses the placeholder torus.

## Where to edit things

- **Grab/follow feel:** `handleHoverMove` in `CategoryLayer.jsx` — the `0.011` multipliers control sensitivity, `0.55` caps how far it tilts on the vertical axis.
- **Accent colours:** `src/index.css` — `--accent` (structural: buttons/borders) and `--accent-soft` (text that needs to visibly differ from `--text`).
- **Instagram link / categories / models:** same as before — see the previous README section below if you kept it, or ask and I'll restate.

## Known limits

- Untested visually, as always here. First things to check: does the hover-follow feel like "grabbing" or too twitchy (tune the sensitivity constants above); do the new card colours actually read as "two-tone" the way you pictured; does the closing-card hover feel right when only the box (not the whole half) responds.
- Mobile / `prefers-reduced-motion`: unaffected by any of this, still the plain stacked page.
