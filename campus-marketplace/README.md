# Bazaar

## Run it

This was written without network access, so it hasn't been installed or run yet.

```
npm install
npm run dev
```

## Status

**Done:**
- Full CRUD (add/edit/delete, password-gated edit & delete), search + category filters, product detail modal, localStorage persistence via `src/data/storage.js`
- Routing: `/`, `/category/:name`, `/discover` (also the search destination — the nav's search icon, not the hero, is the entry point now)
- Sticky nav + sidebar (with an active-category highlight and an animated theme switch), light/dark theme (`src/context/ThemeContext.jsx`)
- Home page: hero is just the "Bazaar" wordmark (character-by-character reveal on load) + "by T", no search bar, shrinking into the nav on scroll; three pinned GSAP category sections with alternating layout and a working entry → lock/shrink+fade → exit sequence; final "about / discover" section
- Redesigned type system: **Big Shoulders Display** for the hero/category identity moments, **IBM Plex Sans** for body/UI, **IBM Plex Mono** for price tags and metadata (unchanged from the original brief)
- General motion pass: card hover lift + image zoom, grid stagger-in on first load, animated theme toggle, modal entrance, page fade-in — all skipped/reduced under `prefers-reduced-motion`
- Seed data so the grids aren't empty on first load — safe to delete via browser devtools (`localStorage.clear()`) or by editing `SEED_LISTINGS` in `storage.js`

**Fixed from the previous pass:**
- The category-section entry/lock/fade animation wasn't showing up because it was gated behind a `requestAnimationFrame` guess for when the 3D canvas had mounted, which could silently fail and skip *all* of that section's setup (including the plain-DOM text animation, which never needed to wait in the first place). Replaced with a ref-callback so the timeline is only ever built once the model is actually there.

**Placeholder, by design (see chat):**
- The 3D models are simple wireframe primitives (box / icosahedron / torus), not your real assets. Drop your three `.glb` files into `public/models/` and follow the swap-in comment at the top of `src/home/PlaceholderModel.jsx` — nothing else needs to change.
- `INSTAGRAM_URL` in `src/home/FinalSection.jsx` is a placeholder — update it to your real handle.

**Worth knowing:**
- On mobile (<769px) the 3D canvas isn't rendered at all and the pinned scroll-jacking is skipped — sections just stack normally with a gentle fade-in, same cards and copy.
- Same fallback (no pinning/scrubbing, gentler fade instead) kicks in for anyone with `prefers-reduced-motion` set, at any screen size.
- Four pinned/scroll-jacked regions on one page (hero + 3 category sections) is more than typical UX guidance recommends (usually 1–2) — flagged for awareness, not changed, since it's a repeat of the original brief.
- `SplitText` (used for the hero's character reveal) shipped as a paid GSAP plugin historically; it's included free with GSAP 3.13+ per current docs — worth a quick license check on your end before shipping.
- The `editPassword` is stored in plaintext in localStorage — it's a UX gate only, not real security, and there's no recovery if it's lost (matches what was discussed).
- Still haven't been able to run this in the sandbox (no network to `npm install`) — treat it as unrun code. The riskiest untested bit is the GSAP `SplitText` + React interaction in the hero (noted in the file) and the overall scroll timing/feel across the four pinned sections.

