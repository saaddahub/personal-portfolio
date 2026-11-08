# Saad Akhtar — portfolio

A single-page portfolio built around one moment: a cherry tree at night grows and blooms, and its petals drift across the page on a wind that follows your pointer and gusts with your scroll, until they settle on the ground in the dawn-coloured contact section.

Vite, React 18, plain CSS, Lenis smooth scrolling and a small canvas engine. No backend.

## Run

    npm install
    npm run dev      # http://localhost:5173
    npm run build    # static site in dist/
    npm test         # tree and petal engine checks

## Edit

- **Words, projects, links:** `src/content.js` holds every piece of copy on the page.
- **The tree and wind:** `src/blossom.js`. `SEED` picks the one tree everyone sees. Change it for a different tree, then run `npm test`: a test checks that the two main limbs never cross.
- **Look and motion:** `src/styles.css` (colour tokens at the top) and `DESIGN.md`.

Motion respects `prefers-reduced-motion`: the tree renders still, no petals fly, and smooth scrolling is off.

## Deploy

`vercel.json` serves `dist/` as a single page. No environment variables are needed.

Previous portfolio (the SA-01 CRT and Rowan desktops) lives on the `legacy` branch.
