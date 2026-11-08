# Build log: the Night Blossom portfolio

What was built for saadsalam.dev, which skills and agents did the work, and what is still open. Written on 2026-11-08 for whoever picks this up next, human or agent.

**Live:** https://saadsalam.dev (Vercel project `personal-portfolio`, auto-deploys from `main`).
**Commits:** `a3afa2f` (the rebuild), `1f0dc69` (fuller tree). `blossom` and `main` point at the same commit.
**Previous site:** the SA-01 CRT and Rowan desktops are preserved on the `legacy` branch (commit `5ad802e`).

## What the site is

A single page built around one moment. A cherry tree at night grows from the ground, blooms and sways. Its petals leave it and drift across the whole page on a wind that follows the visitor's pointer and gusts with their scroll speed. They settle on the ground at the very bottom, where the night has turned into a pink dawn.

| Part | What it does | Where |
|---|---|---|
| Tree and petal engine | Seeded procedural tree (seed `43`). Growth is drawn incrementally along branch distance. Wood: exact taper, rim light, shadow, cherry-bark lenticels. Crown in two depth layers, side shoots for full branching. Petals are particles in a wind field fed by pointer velocity and scroll speed, and settle on the dawn ground. | `src/blossom.js` |
| Page | Hero, scroll-scrubbed statement, typographic work index with expanding rows, About, and a dawn Contact field with copy-email and a live Lahore clock. | `src/App.jsx` |
| Look | Plum-black night, blossom pinks, a drenched dawn close. One self-hosted face (Bricolage Grotesque variable). One glass surface (the nav pill), which changes tone over the dawn. | `src/styles.css`, `DESIGN.md` |
| Words | Every piece of copy on the page. | `src/content.js` |
| Tests | Deterministic tree, rooted and blooming, phone fit, main limbs never cross, petal physics. | `tests/blossom.test.js` (`npm test`) |

Stack: Vite 8, React 18, plain CSS, Lenis (smooth scroll), lucide-react (icons). About 60 KB of gzipped JS. No backend, no environment variables.

## Who did what

### Skills (playbooks loaded into the main session)

- **impeccable:** the design process and quality bar. It set:
  - **Visitor mode:** Experience, where the artifact leads.
  - **Brief:** the user pinned the direction (blossom tree, wind, dark, minimalist, Apple-smooth), so no random concept roll.
  - **Build path:** code-led, because the canvas is the real design.
  - **Rules:** the craft floor applied throughout. No eyebrow labels, no decorative monospace, a real icon library, a 6rem display cap, themed selection, focus and scrollbar, one authored motion moment.
  - **Detector:** run on the build. It returned only advisories against the pre-build token ramp, and no slop patterns.
  - **Direction contract:** recorded in `.impeccable/surfaces/src-app-jsx.md`.
- **apple-design-motion:**
  - press feedback on pointer-down
  - interruptible transitions
  - the pointer handing its velocity to the petals, Apple's velocity-handoff principle applied to air
  - reduced motion as cross-fades rather than nothing
  - a translucent nav that becomes solid under `prefers-reduced-transparency`
  - size-specific tracking
- **built-in-browser:** studied the inspiration (the v0 "COMPUTE" template). Took its feeling: dark ground, glowing pink tree, drifting particles. Took none of its assets or layout.
- **Planned but never loaded:** `better-typography` and `better-accessibility`. Accessibility was covered by the craft floor and the reviewer instead (keyboard, focus rings, `aria-expanded` rows, a polite live region for copy, reduced motion and transparency).

### Agents

- **impeccable-finish-reviewer** ran three rounds against the direction contract and screenshots.
  1. **Fix, 8 items:**
     1. The two main limbs crossed in an X.
     2. The LinkedIn link was unconfirmed.
     3. The Netflix image carried a device-mockup bezel.
     4. No provenance on the raster.
     5. The tree only grounded the hero.
     6. The nav was a dark slab over the dawn.
     7. Repeated blur-rise entrances.
     8. The phone hint was missing and the hero copy didn't match the contract.
  2. **Fix:** seven resolved. The tree-past-hero fix was partial, because the hero clipped the canvas. That was fixed by making the tree a fixed layer that drifts and fades.
  3. **Ship:** after one regression was fixed (hero text over the lingering canopy). The verdict explicitly excludes live motion, which was never watched at full frame rate.
- **impeccable-documenter:** regenerated `DESIGN.md` and `.impeccable/design.json` from the shipped code. It recorded drift honestly: the glass ban became the One Glass Rule, and the motion plan became plain fades plus the dawn bloom.
- **web-fetch:** looked up the interfaces.dev skill source during setup.

### Tools

- **Vercel MCP:** found the project, watched the preview and production builds, and verified the deployments.
- **skillspector (NVIDIA):** scanned third-party skills before installing them during setup.

### anime.js

anime.js 4.5.0 was installed at the start of the session. It was then **removed as redundant**, because the build needed one canvas engine plus CSS and Lenis, and three animation libraries were already installed. **No anime.js code ships in the current site.** It is the planned engine for Story Mode, where scroll-driven, component-level choreography is exactly its strength. See `docs/STORY_MODE.md`. Reinstall with `npm i animejs` when that work starts.

## Decisions worth knowing

- **One shared seed:** `SEED` in `src/blossom.js` picks the tree everyone sees. Branches and blossoms use separate random streams, so tuning blossom density never reshapes the branches. Changing the seed changes the composition, so re-run `npm test` (the limb-crossing check) and look at desktop and phone.
- **The tree layer is fixed:** it drifts up at 0.45× the scroll speed and fades out by 1.4 viewports. A CSS mask sinks the trunk into the night. The hero text fades out first so it never sits on the canopy.
- **Petals sit behind text, never over it:** z-order is tree, then petals, then content.
- **Reduced motion:** the tree is drawn fully grown and still, no petals fly, there is no smooth scrolling, and every entrance is instant.
- **Removed on purpose:** the Supabase admin, three.js, gsap, framer-motion, animejs, freellm and react-github-calendar.

## Open items

1. **Live motion check:** nobody has watched it at full frame rate. Confirm the following on a real phone and laptop:
   - petals drift through Work and About;
   - petals settle on the dawn ground;
   - fast pointer movement over the canopy shakes petals loose;
   - scrolling feels smooth.
2. **LinkedIn:** left off until the URL is confirmed. Add it to `links` in `src/content.js`.
3. **Social preview image:** none exists, so shared links show text only. Add `og:image` in `index.html`.
4. **Project imagery:** only Netflix Data Visualiser has a screenshot.
5. **Story Mode:** specified in `docs/STORY_MODE.md`.
6. **Showcase:** first version built between the hero and Selected work (`src/Showcase.jsx`). Waiting on device frames, PNLF screenshots, the real voice and approval of the draft lines. See `docs/SHOWCASE.md`.
