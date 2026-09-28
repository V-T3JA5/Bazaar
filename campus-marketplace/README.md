# Bazaar — v5

```
npm install
npm run dev
```
Never run in a browser by me (the build sandbox has no network) — read carefully, not rendered.

## Where to edit things

- **Instagram link:** `src/home/ClosingSection.jsx`, line 6 — `CREATOR_INSTAGRAM_URL` (also used by the mobile layout).
- **Categories, copy, which side each model sits on, which model file each uses:** `src/home/stepConfig.js`.
  - Academic → `public/models/book_web.glb`, Electronics → `public/models/chip_web.glb`.
  - **Other still uses a placeholder torus.** To give it a model: drop the `.glb` in `public/models/` and set `model: '/models/your_file.glb'` (and `shape: null`) on the "Other" entry.
  - `edgeAngle` (degrees) controls how much detail shows as lines: raise it for a cleaner drawing, lower it to see more facets. `tilt` is the viewing elevation.
- **Scroll pacing:** top of `src/home/HomeExperience.jsx` — `MIN_ANIM_MS`, `QUIET_MS`.

## What v5 fixes

**The missing 3D in/out animation (root cause).** Every layer ran `ctx.revert()` on each step change. `revert()` snaps animated properties back to their pre-animation values, so before any transition could play, the model was already reset to its resting spot and the card to opacity 0 — nothing left to travel. All layers now `kill()` the old timeline and tween from the current values (see the comment at the top of `CategoryLayer.jsx`). The hero had the same bug (it didn't animate back in) and is fixed too.

**Model entry/exit.** Model parks just past the edge on its own side (computed from the camera's actual view width), flies in with a slow settle, a small scale overshoot and a spin flourish, then settles into a continuous turntable rotation. Exit reverses out through the same side with an accelerating spin. Card wipes open from its own outer edge and closes back toward it.

**Your models.** Loaded with `useGLTF` (preloaded at startup). Node transforms are baked in, then each model is centred and scaled into a unit sphere so any model fits and never clips while rotating; the camera is fitted to the canvas at any window size. Hidden edges are removed with a two-sided depth-only occluder — two-sided because `book_web.glb` is stored with negative scale on all three axes, which flips triangle winding and would break a one-sided occluder. Both models are thin slabs, so they're viewed from an elevated angle rather than edge-on.

**Closing section.** Content is now inside each half's visible area (before, it was centred across the full width, so the diagonal cut through it). The seam is clipped along exactly the same edge as the halves.

**Borders.** New `--border-strong` token. Category cards, product cards, the closing cards and modals all have a visible border; accent-coloured on hover (and while reading, for category cards).

## Known limits

- Untested visually. First things to check: line density on the two models (tune `edgeAngle`), how big the models sit in their half, and the pacing of the entry/exit.
- Mobile and `prefers-reduced-motion` get the plain stacked page (no locking, no 3D).
- `editPassword` is plaintext — a UX gate, not security.
