# Story Mode: specification

A second way through saadsalam.dev. The visitor opens **Story** from the nav, presses **Begin**, and scrolls through Saad's life in seven chapters. An older British narrator tells the story. Each chapter shows a different scroll-driven animation built with **anime.js**, set on Apple-style glass over the night-blossom scene. The main page stays as it is. Story Mode is where the site shows off how much motion Saad can build.

Read `docs/BUILD_LOG.md` first for how the current site works.

## Decisions already made (and why)

| Decision | Reason |
|---|---|
| **anime.js 4 is the Story Mode engine**, loaded only when Story opens (`React.lazy` + dynamic import). | The main page stays at ~60 KB. anime.js excels at exactly this: timelines scrubbed by scroll, staggers, SVG drawing and morphing, text splitting, draggables with springs. Reinstall with `npm i animejs`. |
| **Every chapter shows off a different anime.js capability**, all in one motion grammar. | That proves range without the page feeling like a sampler. Ease is `outExpo`, the site's `cubic-bezier(0.16,1,0.3,1)`. Springs are used only after a flick or drag. |
| **Scroll drives the visuals; narration plays per chapter.** | Speech cannot be scrubbed. When a chapter becomes active its line plays; scrolling past cancels it and starts the next. |
| **Narration starts only after the visitor presses Begin.** | Browsers block audio and speech without a user gesture, and an unasked-for voice is hostile. |
| **Captions are always on screen.** | Many visitors browse muted. Narration is an enhancement on top of the words, never a replacement. |
| **The voice is a stock older British male voice, not an imitation of any real person.** | Cloning or mimicking a famous narrator is an impersonation risk. "Warm documentary register, older, British" is the brief. |
| **Every life detail comes from Saad.** | The chapters below use only facts already in his portfolio data. Everything else is a marked `[placeholder]`. |
| **Glass appears only in Story Mode.** | `DESIGN.md` currently has a One Glass Rule (only the nav pill). Story Mode is a new surface. Amend `DESIGN.md` to "Story Mode may set glass sheets over the scene; the main page keeps one glass surface" when this ships. |

## Entry, exit and structure

- **Entry:** add **Story** to the nav, after Contact. It links to `#story`. `App.jsx` listens for `hashchange` and renders `<StoryMode />` in place of `<main>`, lazily loaded. The blossom scene keeps running behind it as the backdrop.
- **First screen:** a glass sheet titled "The story so far", a one-line subtitle, and **Begin** (primary) with "Read instead" (text only, no voice).
- **Exit:** a persistent glass close control (Esc also works). It returns to `#top` and restores focus to the nav's Story link.
- **Layout:** each chapter is a section about 220vh tall with a sticky full-viewport stage. Scroll progress through the section drives that chapter's anime.js timeline.
- **Transport bar** (a glass pill at the bottom): play/pause, mute, previous/next chapter, a chapter progress indicator and a captions toggle. Keys: Space, ← / →, M, Esc.
- **Scene integration:** `startScene` in `src/blossom.js` gains a `mode: 'page' | 'story'` option. In story mode the tree is a dimmed fixed backdrop (opacity about 0.35, no scroll fade). Petals keep blowing, so glass sheets visibly blur and refract them, which is the effect that makes glass worth using.

## The chapters

Facts marked *(data)* come from Saad's previous portfolio content. Anything in `[brackets]` needs Saad's own words before shipping. The old CRT Story Mode left seven draft chapters on the `legacy` branch (`git show legacy:src/data/story.ts`). Mine their tone, but fill their placeholders the same way.

Narration is written for the voice: short sentences, unhurried, lightly wry.

### 0. Prologue: The story so far
- **Narration:** "This is a short story about a young man in Lahore, a great deal of curiosity, and the things he has built so far. Do scroll at your own pace. I shall keep up."
- **anime.js:** `createTimeline` on Begin. The glass sheet materialises (blur and scale together) and the night-blossom backdrop dims behind it.

### 1. Lahore
- **Facts:** born or raised in Lahore *(data)*; `[earliest memory of computers or making things]`, `[year]`.
- **Narration:** "Lahore. A city of gardens, of kites in spring, of trees that blush pink when the kachnar blooms. Here, in `[year]`, a boy named Saad first discovered that `[first thing he took apart or made]`."
- **Scroll choreography:** the chapter title "Lahore" arrives as scattered letters that drift in like petals and assemble as the visitor scrolls. They scatter again on exit.
- **anime.js:** `splitText` into chars, then `animate` with `x`, `y` and `rotate` from `stagger` values `from: 'random'`, synced with `onScroll({ sync: true })`.

### 2. A voice worth hearing (2019)
- **Facts:** first prize, school speech and documentation competition, 2019 *(data)*.
- **Narration:** "In 2019, he won first prize for a speech. An early lesson, and a lasting one: explaining an idea is part of making it work."
- **Scroll choreography:** a single SVG line draws itself into a podium microphone. A row of glass bars then rises and falls as a waveform while the narrator speaks.
- **anime.js:** `svg.createDrawable` with `draw: ['0 0', '0 1']` scrubbed by scroll, and the bars with `stagger` from `'center'`. In phase 2 (recorded audio), drive the bars from a Web Audio `AnalyserNode` so they follow the real voice.

### 3. From medicine to machines (2024)
- **Facts:** completed Intermediate in Medical Sciences, 2024 *(data)*; began BS Artificial Intelligence at UMT, 2024 *(data)*; `[why he switched from medicine to AI]`.
- **Narration:** "He studied medicine first, finishing his intermediate in 2024. And then, rather than a stethoscope, he reached for a keyboard. `[His reason, in his own words.]`"
- **Scroll choreography:** **the signature transition.** A glowing ECG heartbeat line runs across the stage, then morphs node by node into a neural-network graph whose connections light up in sequence.
- **anime.js:** `svg.morphTo` between two equal-point paths, with a `createTimeline` adding node `scale` pops and edge `draw` staggered along the morph.

### 4. University of Management and Technology (2024–2028)
- **Facts:** BS AI at UMT, Lahore, 2024–2028 *(data)*; studies data structures, OOP, databases and machine learning *(data)*; `[CGPA: include or not? 3.4 appears in old data]`.
- **Narration:** "At university, the foundations: data structures, object-oriented programming, databases, and machine learning. One experiment at a time."
- **Scroll choreography:** a grid of small glass tiles, one per subject plus empty ones, flips and settles outward from the centre into a tidy grid. On exit the tiles tilt away like a deck being put down.
- **anime.js:** `stagger(80, { grid: [6, 4], from: 'center' })` on `rotateY`, `z` and `opacity`, in a perspective container.

### 5. Teaching (2024–2025)
- **Facts:** private tutor in English, fluency and vocabulary *(data)*; Teacher Assistant certificates *(data)*.
- **Narration:** "He taught, too. English, fluency, vocabulary. Helping other people find a clearer voice turned out to sharpen his own."
- **Scroll choreography:** vocabulary words travel along a looping curve across the stage and settle into a finished sentence.
- **anime.js:** `svg.createMotionPath(path)` spread into each word's `animate`, staggered, then a final `createTimeline` step that snaps words into a line.

### 6. Building things (2025–now)
- **Facts:** independent and freelance full-stack developer *(data)*; 10+ projects including AI-powered tools *(data)*; Netflix Data Visualiser, AI Interviewer, Hospital Database, Hotel Management System, this site *(data)*.
- **Narration:** "And then, the building. A data visualiser that finds the story in a catalogue. A database that brings order to a hospital. An interviewer that makes practice feel like a conversation. More than ten projects so far, and each a little better made than the last."
- **Scroll choreography:** **the componential breakdown, the centrepiece.** Each project is a glass card. As the visitor scrolls it explodes into its layers in 3D: interface, data, logic and stack, each a thin glass plate labelled with the real technologies. Then it reassembles and slides aside for the next project. Netflix uses its real screenshot as the interface plate.
- **anime.js:** one `createTimeline` per card scrubbed by `onScroll`, with plates on `translateZ`/`translateY`/`rotateX` in a `perspective` parent, labels via `stagger`, and cards handed off with overlapping timeline offsets (`'-=400'`).

### 7. What comes next
- **Facts:** learning machine learning *(data)*; open to internships, research roles and collaborative projects *(data)*; `[one sentence about what he wants to build]`.
- **Narration:** "He doesn't have the whole map yet. Very few interesting people do. But if you are building something that matters, and you care how it is made, he would very much like to hear from you."
- **Scroll choreography:** the backdrop tree brightens to full and a gust carries petals across the screen. A glass postcard addressed to Saad can be dragged and flicked. Flicking it upward (or pressing "Send") opens the email link.
- **anime.js:** `createDraggable` with spring release (bounce only because a flick preceded it) and a timeline for the gust. Trigger `scene.gust(y)` from `blossom.js` in sync.

## Narrator

### Phase 1: browser voice (ships first, costs nothing)
- `src/story/narrator.js` wraps `speechSynthesis`.
- **Voice choice:** pick the first available voice whose `lang` starts with `en-GB` and whose name matches a male voice, in this priority:
  1. "Microsoft George"
  2. "Microsoft Ryan" (Edge neural)
  3. "Daniel" (macOS/iOS)
  4. "Arthur" (iOS)
  5. "Google UK English Male"

  If none is available, fall back to any `en-GB` voice, then any English voice.
- **Older register:** `rate: 0.9`, `pitch: 0.82`.
- **Events:** `start`, `end` and word `boundary` events drive a karaoke-style caption highlight. When boundary events are missing, fall back to plain captions.
- **Honest limit:** quality and accent vary by device, and some Android devices have no British male voice. Captions carry the story regardless.

### Phase 2: recorded narration (consistent everywhere, optional)
- Generate one MP3 per chapter **offline** from a TTS provider's stock older British male voice. Commit the files under `public/story/`. The API key never reaches the browser.
- The script lives in `src/story/chapters.js`, the single source for captions and audio, so the two stay in sync.
- Use `<audio>` per chapter, which also enables the real waveform in chapter 2.
- **Saad decides:** provider, cost, and whether phase 1 is good enough.

## Glass (Apple-style, for Story Mode only)

Recipe, as a starting point:

```css
.glass {
  background: color-mix(in oklab, var(--night-raised) 40%, transparent);
  backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid #ffffff14;
  border-radius: 28px;
  box-shadow:
    inset 0 1px 0 #ffffff2e,      /* light catching the top edge */
    inset 0 -1px 0 #00000040,
    0 24px 48px -24px #000000a0;  /* lift off the scene */
}
.glass::before {                    /* specular highlight that follows the pointer */
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(40% 60% at var(--gx, 30%) var(--gy, 0%), #ffffff1f, transparent 70%);
}
```

- **Refraction (progressive):** in Chromium, add an SVG `feTurbulence` + `feDisplacementMap` filter via `backdrop-filter: url(#liquid) blur(22px)`. Feature-detect it, and give every other browser the plain blur.
- **Materialise, don't fade:** animate blur radius and scale together on enter and exit (`createTimeline`, about 0.6s, `outExpo`).
- **Hierarchy:** heavier, darker glass for the transport bar and close control; lighter glass for content cards. **Never stack glass on glass.**
- **Fallbacks:** under `prefers-reduced-transparency`, use solid `--night-raised` with a hairline border. Under `prefers-contrast: more`, use solid with a visible border.

## Reduced motion and accessibility

- **Reduced motion:** chapters render as composed still frames with short cross-fades. No scroll scrubbing, no parallax, no 3D. Narration still works.
- **"Read instead":** a plain, accessible transcript of the whole story, with chapter headings.
- **Focus:** opening Story moves focus to its heading. Exiting returns it to the nav. The transport bar is fully keyboard operable.
- **Screen readers:** captions are normal text, not a live region, so screen readers don't fight the speech voice. Narration stays off for anyone who chooses "Read instead".
- **Hidden tabs:** respect `document.hidden` by pausing narration and animation in a background tab.

## Files

```
src/story/StoryMode.jsx   stage, sections, transport, lazy-loaded
src/story/chapters.js     titles, captions, narration script, facts (the only place copy lives)
src/story/narrator.js     voice selection, speak/cancel, boundary events
src/story/chapters/*.js   one anime.js choreography per chapter: build(stageEl) → { timeline, destroy }
src/story/glass.css       the glass recipe and fallbacks
```

**Budget:** the Story chunk should be ≤ 45 KB gzipped, including anime.js. Import only the anime.js modules in use. The main page bundle must not grow.

**Verify before coding:** anime.js 4.5's exact signatures for `onScroll` (`sync` values), `splitText`, `svg.*`, `createDraggable` and springs. Check `node_modules/animejs/types` and the v4 docs, because names shifted between 4.0 and 4.5.

## Build order

1. **Shell:** nav link, `#story` route, lazy chunk, exit, focus handling, captions only, reduced-motion path. It should be shippable on its own as a text story.
2. **Narrator phase 1** and the transport bar.
3. **Glass system** and the sticky stage layout.
4. **Chapter choreography,** in order of impact: 6 (componential breakdown), 3 (ECG → neural morph), 1 (assembling title), 4, 2, 5, 7, 0.
5. **Finish:**
   - impeccable surface brief for `src/story/StoryMode.jsx` (Experience mode);
   - finish review on desktop and phone captures;
   - the `DESIGN.md` glass amendment;
   - a **live check at real frame rate on a phone.**
6. **Optional:** phase 2 recorded narration.

## Done means

- [ ] Story opens from the nav and from `/#story`, and exits with the control or Esc, with focus restored.
- [ ] All seven chapters scrub smoothly with scroll and reverse cleanly when scrolling back.
- [ ] Narration starts only after Begin, follows the active chapter, and pause, mute and skip work.
- [ ] Captions are always visible, and "Read instead" gives the full transcript.
- [ ] No life detail ships that Saad hasn't written or approved. No `[placeholder]` remains.
- [ ] Reduced motion and reduced transparency are honoured.
- [ ] The Story chunk is ≤ 45 KB gzipped, and the main bundle is unchanged.
- [ ] Watched live on a mid-range phone: smooth scrolling, glass over moving petals, no jank.

## Questions for Saad before building

1. Childhood details for chapter 1: first device, first thing made or taken apart, year.
2. Why you moved from medical sciences to AI, in one or two sentences, in your words.
3. Should the CGPA appear?
4. One sentence on what you want to build next.
5. Is the browser voice acceptable, or should we budget for recorded narration (phase 2)?
6. Anything in your story you'd rather keep private?
