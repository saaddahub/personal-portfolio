
# SA-01 Personal Monitor

An interactive CRT portfolio for Saad Akhtar. Vite + React 18 + strict TypeScript, Framer Motion, plain CSS and synthesized Web Audio. Screen content is ordinary React; no iframe or second server is used. Existing admin and /work/:id archive routes are retained.

## Run

    npm install
    npm run dev

Preview: http://127.0.0.1:5173 (strict port). `npm run build` checks TypeScript and produces `dist/`. `npm test` runs the monitor logic and existing archive/persistence checks. `npm run typecheck` checks types alone.

## Edit content

The original portfolio is rendered inside the CRT by `src/PortfolioMain.jsx` and `src/components/PortfolioScreen.tsx`. Its existing hero, project gallery, globe, navigation, music player and themes remain in use. Edit published content through the existing `/admin` studio, or update `DEFAULT_PORTFOLIO_DATA` in `src/context/PortfolioContext.jsx`. The original CSS is scoped to `.portfolio-surface` so it cannot restyle the chassis.

`src/data/content.ts` supplies monitor labels, boot copy and the optional terminal channel data; it does not replace the original portfolio's content source.

`src/data/story.ts` contains all seven chapters. Replace bracketed personal facts. Each typed chapter has `id`, `title`, `timecode`, `lines`, `scene`, `mood` (a colour index), and `durationHint` in seconds. To add a chapter, add its data and a scene in `components/story/scenes/index.tsx`, then update the chapter bounds in `store/useMonitor.ts` and the launcher resume bound. The tape UI is data driven.

## Controls

Left/right: channels (chapters during playback); 0–6: direct channel; P: power; C: colour; M: sound; up/down or brackets: brightness; S: story; Escape: exit; ?: help. Space completes story typing, then toggles pause. Use the physical channel keys, colour key, rotary knob, power button or clickable speaker grille. Hold channel keys to scan. Drag the knob, use its wheel or keyboard arrows, or double-click to reset to 65. Four screws reveal a five-second service test card. Clicking the plastic knocks the chassis. Idle for 60 seconds starts a screensaver.

Colour and brightness variables live in `styles/tokens.css` and `styles/screen.css`. Five colour modes, brightness and mute persist locally. Story moods are temporary. Long boot and tape progress persist only in the current tab session. Audio begins muted and requires a user gesture. Device tilt is optional, enabled by the visible TILT action with browser permission handling. Reduced motion and the help menu's plain mode improve readability. The focus-visible skip control enters plain mode directly.

## Contact delivery

The restored portfolio retains its existing contact links and calls to action, configured through the original content provider. The optional terminal contact component supports `VITE_CONTACT_ENDPOINT` JSON POST delivery or a mail-app fallback when used.

## Deploy

Run `npm run build`, then deploy `dist/` to Vercel or Netlify. Vercel's existing `vercel.json` preserves SPA fallback; Netlify uses `public/_redirects`. Hash URLs need no server rewrites. Retained /admin and /work routes use SPA fallback. Configure the existing Supabase environment separately if you use the archive admin (see `SUPABASE_SETUP.md`). The original portfolio remains connected to its existing content provider and admin; monitor labels and Story Mode use the TypeScript data files.

The OG image is `public/og-image.png`, a screenshot of the local monitor, and the favicon is `public/sa01-favicon.svg`. Update the canonical and social image URLs in `index.html` if the domain changes.
