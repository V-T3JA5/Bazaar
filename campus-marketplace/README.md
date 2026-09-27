# Bazaar

## Run it

Still written without network access, still hasn't been installed or run.

```
npm install
npm run dev
```

## What changed in this pass

**The scroll mechanism is now discrete, not proportional.** The old version tied animation
progress directly to how far you scrolled — fast flicks blew through the motion instantly,
which read as blocky. It's rebuilt in `src/home/`:

- `stepConfig.js` — the whole experience is one linear list of 7 steps (hero → 3 categories ×
  [title-only, title+description]). Pure data/math, no side effects.
- `HomeExperience.jsx` — owns a `step` number and intercepts wheel/touch/keyboard input directly
  (native page scroll is locked via `overflow: hidden` on `<body>` while this is mounted). **Every
  gesture — however hard or light — advances exactly one step**, because a `lockedRef` ignores any
  further input until the current transition's animation finishes (~950ms). A big fast flick and a
  tiny nudge produce the same result: one step.
- `CategoryLayer.jsx` — each category is a layer that just asks "am I idle, entering, or reading?"
  and tweens toward that target with GSAP. Direction-agnostic on purpose: scrolling up plays the
  same states in reverse for free, no separate reverse-animation code.
- `HeroLayer.jsx` — the SplitText character reveal now plays once, on first mount only. Returning
  to the hero later is a plain fade, not a replayed party trick (repeating it would get old fast).
- `MobileStack.jsx` — mobile and `prefers-reduced-motion` get a completely different, normal
  scrollable stacked page. No locking, no wheel-jacking, no 3D. This was already the policy before;
  it just lives in its own file now instead of being an inline fallback branch.

**3D entry/exit direction, fixed.** A model now enters from, and retreats back out through, its own
side only — it no longer travels all the way across to exit through the opposite edge.

**The final "about / discover" section is gone**, per your note that it didn't match the theme.
Home now ends after the third category's read step; there's nothing further to scroll to.

**Visual pass:** the whole thing leans into the wireframe/blueprint idea the 3D models already
carry, instead of generic card-with-shadow styling — hairline rule under each title that draws
itself in on the "read" step, a `01 / 03` spec-sheet index per category, small corner registration
marks and a step readout while on the stepped experience, a very low-opacity grain texture site-wide
so flat color fields don't read as flat, and font pairing unchanged from last pass (Big Shoulders
Display / IBM Plex Sans / IBM Plex Mono).

## Still true from before

- No network in this sandbox — this has been read closely, never run in an actual browser. Treat it
  as unrun code. If anything about the wheel-lock timing feels off (too sticky, not sticky enough),
  `LOCK_MS` at the top of `HomeExperience.jsx` is the one number to tune.
- The 3D models are still wireframe placeholders (box / icosahedron / torus). Drop your `.glb` files
  into `public/models/` and follow the swap-in comment at the top of `src/home/PlaceholderModel.jsx`.
- `editPassword` is a UX gate only, stored in plaintext, no recovery if lost — matches what was
  already discussed and agreed.
- Four locked/pinned-style regions worth of scroll-jacking on one page is more than typical UX
  guidance recommends — flagged again for awareness since the mechanism changed, not because the
  concern changed.
