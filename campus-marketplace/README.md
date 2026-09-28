# Bazaar — v4

```
npm install
npm run dev
```
Still never run in a browser (the build sandbox has no network). Read carefully, not rendered.

## Where to edit things

- **Instagram link:** `src/home/ClosingSection.jsx`, line 6 — `CREATOR_INSTAGRAM_URL`. That single constant is also used by the mobile layout, so one edit covers both.
- **Category copy / order / which side each model sits on:** `src/home/stepConfig.js`.
- **Scroll feel:** top of `src/home/HomeExperience.jsx` — `MIN_ANIM_MS` (minimum time between steps) and `QUIET_MS` (how long input must go quiet before the next gesture counts). Raise either for a slower, more deliberate feel.
- **Real 3D models:** drop `.glb` files in `public/models/`, then follow the swap-in comment at the top of `src/home/PlaceholderModel.jsx`.

## The Home sequence (8 steps, 0–7)

0 hero · 1/2 Academic (title → title+copy) · 3/4 Electronics · 5/6 Other · 7 closing (About / Discover).
One gesture = one step, either direction. Right-edge dots jump to a category (there is deliberately no dot for the closing step).

## What changed in v4

- **Category cards are real links** to `/category/<name>`, clickable in both phases. Hovering the card tints the title and swells the 3D model slightly.
- **Closing section:** one screen, diagonal `/` split. Left = "About the creator" (dark palette → Instagram), right = "Discover products" (light palette → `/discover`). Each side uses a *fixed* palette (`--ink-*` / `--paper-*` in `index.css`), so both are visible at once whichever site theme is active; hovering a side inverts it.
- **Hero bug fixed:** the hero used to stay on screen if you scrolled away within ~1.6s of load.
- **3D hidden-line removal:** an invisible depth-only occluder mesh now hides back-facing edges, so you only see edges facing you (no x-ray).
- **Gesture lock:** now waits for input to go quiet (absorbing a trackpad's momentum tail) *and* for a minimum animation time, instead of a fixed timeout a long flick could outlast.
- **Motion:** slower, softer easing on entry/exit; entry = title char-reveal + model overshoot/spin/scale pop from its own side; reading = title shrink + clip-path text wipe + rule draw; exit = accelerating spin-out through the same side; idle = slow two-axis tumble.
- **Contact seller:** listings have an optional `sellerContact` field (add/edit form). The detail modal has a "Contact seller" button revealing it (email → `mailto:`, phone → `tel:`). Existing listings in localStorage won't have the field until edited.

## Assumptions I made (tell me if wrong)

- "Remove the one" → no 4th dot for the closing step.
- Contact seller lives in the product detail modal, not on every grid card.
- Left/right halves of the closing section: dark = About, light = Discover.

## Known limits

- Everything above is untested visually. Highest-risk to check first: the diagonal clip-path alignment, the faint background numeral vs. text on short screens, and whether the lock timing feels right on your trackpad/mouse.
- Mobile and `prefers-reduced-motion` get a plain stacked page (no locking, no 3D), with the same links and closing content.
- `editPassword` is plaintext, a UX gate only.
