# Campus Marketplace

## Run it

This was written without network access, so it hasn't been installed or run yet.

```
npm install
npm run dev
```

## Status

**Done:**
- Full CRUD (add/edit/delete, password-gated edit & delete), search + category filters, product detail modal, localStorage persistence via `src/data/storage.js`
- Routing: `/`, `/category/:name`, `/discover` (also the hero search destination)
- Sticky nav + sidebar, light/dark theme (`src/context/ThemeContext.jsx`)
- Home page: shrinking hero, three pinned GSAP category sections with alternating layout, final "about / discover" section
- Seed data so the grids aren't empty on first load — safe to delete via browser devtools (`localStorage.clear()`) or by editing `SEED_LISTINGS` in `storage.js`

**Placeholder, by design (see chat):**
- The 3D models are simple wireframe primitives (box / icosahedron / torus), not your real assets. Drop your three `.glb` files into `public/models/` and follow the swap-in comment at the top of `src/home/PlaceholderModel.jsx` — nothing else needs to change.
- `INSTAGRAM_URL` in `src/home/FinalSection.jsx` is a placeholder — update it to your real handle.

**Worth knowing:**
- On mobile (<769px) the 3D canvas isn't rendered at all and the pinned scroll-jacking is skipped — sections just stack normally, same cards and copy.
- Same fallback (no pinning/scrubbing) kicks in for anyone with `prefers-reduced-motion` set, at any screen size.
- The `editPassword` is stored in plaintext in localStorage — it's a UX gate only, not real security, and there's no recovery if it's lost (matches what was discussed).
- Haven't been able to run this in the sandbox (no network to `npm install`), so treat the hero/category scroll choreography as untested until you run it locally — the trickiest part is the timing between the R3F canvas mounting and the GSAP timeline picking up the model's ref, flagged with a comment in `CategorySection.jsx`.
