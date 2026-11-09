# Showcase: specification

A narrated, scroll-driven demo of what Saad can build, placed on the **main page** between the hero and the existing Selected work section. Soft music comes in first, then a mature male voice speaks, with captions always on screen. Each chapter is a pinned, full-screen scene whose animation is driven by scroll position. Scroll forward and it plays; scroll back and it rewinds.

The order of the page becomes:

```
Hero (existing)
  → 1. Intro: about me            "I work where interfaces, data, and systems meet."
  → 2. Interfaces: UI/UX          device frame sequence explodes into its components
  → 3. Dashboards: PNLF           real dashboards, stacked and scrubbed in 3D
  → 4. Backend                    how the backend drives the frontend
  → 5. Security                   how a request is checked layer by layer
Selected work, About, Contact (existing)
```

## Status (2026-11-09)

The first version is built: `src/Showcase.jsx`, `src/narrator.js`, the copy in `content.showcase` in `src/content.js`, and the styles under "Showcase" in `src/styles.css`. It replaces the old pinned statement section. Where it differs from the plan below:

| Planned | Built instead | Why |
|---|---|---|
| anime.js timelines | Plain scroll maths: one `requestAnimationFrame` loop reads each chapter's scroll progress, and each chapter's `render(p)` sets styles | No new dependency; the scenes only need eased interpolation. Add anime.js later if a scene needs SVG morphing. |
| Device frame sequence on canvas | Built, with Saad's first product: a yellow-switch keyboard from a Google Flow (Veo) video, 190 frames, assembled → exploded. `scripts/prepare-frames.py` splits the video with ffmpeg and lifts its pure black to the page's night colour, so no cut-out is needed. 1920×1080 WebP on wide screens, 960×540 on phones; frames load a few screens early, key frames first, and the drawn frame glides toward the scroll target every animation frame | New products should be rendered on pure black; see the Flow prompts Saad used. The labels and leader lines of the drawn version were dropped. |
| Licensed music file | A soft D–Bm–G–A pad synthesized in the browser with Web Audio | No file to download and no licence needed. Replace it if Saad picks a track. |
| Recorded voice | Placeholder WAVs from the Windows desktop voice, made by `scripts/narrate-placeholder.ps1` | Shows the full audio flow now. Replace with the real voice (MP3 recommended; update the extension in `narrator.js`). Rerun the script after editing any line. |
| Word timings from `.vtt` files | Captions light word by word from the clip's playback position, or from scroll position when sound is off | No timing files to keep in sync. |
| PNLF dashboards | The Netflix visualiser, plus two "PNLF dashboard: screenshot on the way" cards with drawn chart outlines | The screenshots haven't arrived. Add `image` to each board in `content.js`. |
| Backend options A and B | Option A only | It needs no assets. |
| Lazy-loaded chunk, skip link, keyboard shortcuts | Not built | The Showcase adds about 6 KB gzipped, and the nav's Work link already skips past it. |

**Still to do:** more products, PNLF screenshots, the real voice, Saad's approval of the draft lines and of the security layers, and a live check at full frame rate on a real phone.

Read `docs/BUILD_LOG.md` first for how the current site works. This spec borrows the motion grammar and glass recipe from `docs/STORY_MODE.md` but replaces its browser-voice narrator: **the browser never speaks here. Every word is a recorded audio file shipped with the site.**

## Decisions already made (and why)

| Decision | Reason |
|---|---|
| **Recorded audio, not `speechSynthesis`.** One voice file per chapter plus one music file, under `public/showcase/audio/`. | Saad asked for it. It also sounds the same on every device, which browser voices never do. |
| **The voice is a stock mature male TTS voice (or a hired voice actor), never a clone or imitation of a real person.** | Calm, low, unhurried, documentary register. Imitating a known narrator is an impersonation risk. |
| **Sound starts only after the visitor taps "Sound on".** | Every browser blocks audio until the visitor interacts with the page. That can't be bypassed, and a voice nobody asked for drives people away. The hero shows a glass "Sound on" pill. Pressing it starts the music, and the voice follows. |
| **Captions are always visible, sound or not.** | Most people browse muted. The captions are the story; the voice adds to them. |
| **Scroll drives the visuals; each chapter's voice plays once when that chapter becomes active.** | Speech can't be scrubbed like video. Scrolling into a chapter starts its line. Scrolling quickly past it fades that line out and starts the next one. |
| **Device breakdowns are image sequences drawn to `<canvas>`**, scrubbed frame by frame with scroll. | This is the technique Apple uses on its product pages. It gives the photo-real exploded-watch or laptop effect without shipping a 3D engine, and the frames can come from Blender, a render or After Effects. |
| **anime.js 4 runs the choreography** (text, SVG, layers, timelines), synced to scroll with `onScroll`. Lenis (already installed) keeps scrolling smooth. | Matches the Story Mode decision. One animation engine, loaded only when the Showcase approaches the viewport. Reinstall with `npm i animejs`. |
| **One motion grammar:** ease `outExpo` (`cubic-bezier(0.16,1,0.3,1)`), heavy pinned scenes, nothing bouncy unless the visitor flicked it. | "Strong" means big, confident, physical motion with exact timing, not many small effects competing for attention. |

## Shared mechanics

### Pinned chapters
- Each chapter is a `<section>` **300 to 500vh tall** with a sticky, full-viewport stage inside it.
- Scroll progress through the section, from 0 to 1, drives one anime.js timeline per chapter: `createTimeline({ autoplay: onScroll({ target: section, enter: 'top top', leave: 'bottom bottom', sync: 0.15 }) })`. The small `sync` value adds a short smoothing lag, which makes the motion feel heavy instead of twitchy.
- Below, timings are written as **progress ranges** (for example `0.20–0.45`), so they hold at any section height.

### Image-sequence player (`src/showcase/sequence.js`)
- Draws frame `round(progress × (count − 1))` to a canvas that is sized to the stage × `devicePixelRatio` and drawn with cover-fit.
- Loads frames from about one screen before the chapter. The first frame, last frame and every 10th frame load first, so a fast scroll never shows a blank canvas, and the gaps fill in afterwards.
- Picks the frame set by screen width: `desktop/` (1920×1080) or `mobile/` (1080×1350, portrait crop).
- Exposes `labelsAt(frame)` so text callouts can be pinned to the frame range where each component is visible.

### Audio engine (`src/showcase/audio.js`)
- One `AudioContext`. A **music bed** loops quietly the whole time. Each chapter's **voice clip** plays on top.
- **Ducking:** while the voice speaks, the music dips to about 30% over 0.4s, then comes back up over 1.2s when the voice ends.
- Sequence on "Sound on": the music fades in over 2.5s. If the visitor is already at the Intro, the intro voice starts 1.5s later; otherwise it starts when they scroll into the Intro.
- Leaving a chapter fades its voice out over 0.5s. Each chapter's voice plays once per visit, and replays only from the transport bar.
- Pauses when the tab is hidden (`document.hidden`) and resumes when it returns.
- **Transport pill** (glass, bottom centre, appears after "Sound on"): mute, replay this chapter's line, captions on/off. Keys: **M** mutes, **R** replays.

### Captions
- Bottom third of the stage: large and calm, on a soft dark scrim for legibility over any frame.
- Each chapter has a `.vtt` cue file with **word timings**. Many TTS providers return these. Otherwise, align them once with a forced-alignment tool. The word being spoken brightens, and the rest of the line stays dimmed (karaoke style).
- Without sound, the caption for the current chapter reveals word by word with scroll progress instead, so the story still reads.
- Captions are plain text in the DOM, not a live region, so screen readers read the page normally.

## The chapters

Copy marked `[draft]` is written for Saad to approve or rewrite. Only the Intro lines are his own words.

### 1. Intro: about me

- **Voice:** "I work where interfaces, data, and systems meet. I like software that feels considered."
- **On screen:** the same two lines, set very large, plus Saad's name and role in small type.
- **Replaces** the current pinned `statement` section (`App.jsx`, the "How I work" section). The copy already lives in `content.statement` in `src/content.js`. Update its wording to match the voice line exactly, including the Oxford comma.
- **Choreography (400vh):**
  - `0.00–0.15`: the blossom tree behind dims to about 25% and slowly pushes in (scale 1 → 1.15), as if a camera is leaning forward. The hero name slides up and out with a vertical blur.
  - `0.10–0.45`: **"I work where"** rises letter by letter from behind a mask. Then **"interfaces,"**, **"data,"** and **"systems"** each come in on their own beat, each showing a quick hint of the chapter it introduces:
    - *interfaces* draws a thin outline of a UI wireframe around itself;
    - *data* leaves a trail of tiny bar-chart ticks;
    - *systems* makes a small node graph connect around the word.
  - `0.45–0.60`: **"meet."** lands, and the three hints fly together into a single point of light.
  - `0.60–0.85`: **"I like software that feels considered."** is written in with a soft, warm highlight sweeping across it.
  - `0.85–1.00`: the type zooms toward the camera and passes through it. The point of light becomes the screen of the device in chapter 2, a seamless handoff.
- **anime.js:** `splitText` into chars and words; masked `translateY` + `filter: blur()` with `stagger`; `svg.createDrawable` for the three word accents; one parent timeline per scroll.

### 2. Interfaces: UI/UX (the centrepiece)

- **Voice `[draft]`:** "Good interfaces look simple because the hard parts were taken seriously. Every layer has a reason to be there."
- **Frames from Saad:** a device sequence, a laptop, a watch or similar, that starts whole, **explodes into its components**, holds, and then reassembles. 150 to 240 frames.
- **Choreography (500vh):**
  - `0.00–0.10`: the device is whole and turns slowly; the glow from chapter 1 settles onto its screen.
  - `0.10–0.55`: **the explosion.** The frame sequence scrubs apart. As each component separates, a hairline leader line draws out to a label, mapping hardware to how Saad works:
    - glass → *Visual design*
    - display → *Interface*
    - logic board → *State & logic*
    - battery → *Performance*
    - chassis → *Accessibility*

    Labels come in with a small chars stagger and leave when their part moves out of view.
  - `0.55–0.70`: hold, fully exploded. The labels line up into a neat column, like a spec sheet.
  - `0.70–0.90`: reassembly. The screen lights up showing a real interface Saad built (a PNLF screen). That leads into chapter 3.
  - `0.90–1.00`: the camera moves into the screen until it fills the viewport.
- **Technique:** `sequence.js` on canvas, with an SVG overlay for leader lines (`svg.createDrawable`) and labels positioned by `labelsAt(frame)`. That needs one small JSON file of component positions per frame range, supplied with the frames or measured once.

### 3. Dashboards: PNLF

- **Voice `[draft]`:** "Data should answer a question before you have to ask it. These are dashboards I built for PNLF."
- **Assets from Saad:** PNLF dashboard screenshots (PNG or WebP, 2× resolution) and, where possible, the real chart values so charts can redraw live instead of being flat images.
- **Choreography (450vh):**
  - `0.00–0.15`: coming out of the device screen, the first dashboard fills the view and then pulls back into a glass card tilted in 3D.
  - `0.15–0.75`: **the stack.** The dashboards fan out like cards in deep perspective (`rotateX`, `translateZ`, staggered). As the visitor scrolls, each one comes forward in turn, straightens, and its key chart redraws: lines draw on, bars grow from zero, numbers count up. One caption chip per dashboard says what problem it solves `[Saad to supply]`.
  - `0.75–1.00`: the cards fold flat into a single thin line. That line becomes the "wire" that starts chapter 4.
- **anime.js:** a timeline per card with overlapping offsets (`'-=400'`), `svg.createDrawable` for chart lines, `stagger` for bars, and `utils` number tweening for the counters.

### 4. Backend: how I manage the frontend

- **Voice `[draft]`:** "Behind every screen is a system that keeps it honest. I build the backend too, so changing the site is a decision, not a deployment."
- **Option A (no assets needed): a live split-screen demo drawn in SVG and HTML.**
  - Left: an admin panel. Right: the public site.
  - `0.00–0.20`: the screen splits, and the panel and site slide in from opposite sides.
  - `0.20–0.45`: a cursor in the admin panel edits a field (for example, a project title) and presses Save.
  - `0.45–0.75`: **the request travels.** A glowing packet runs along a drawn path through labelled stages: *Admin UI → API → Validation → Database → Cache → Site*. Each stage lights up and shows one line of what it does. The database stage shows a row actually changing.
  - `0.75–0.90`: the change lands on the right; the public site's title morphs to the new text.
  - `0.90–1.00`: the pipeline dissolves into a grid of server racks that close like doors, the transition into Security.
- **Option B:** Saad sends a frame sequence (for example, a server or rack breaking apart), played with the same `sequence.js` player as chapter 2, with the pipeline labels laid over it.
- **anime.js:** `svg.createMotionPath` for the packet, `svg.createDrawable` for the path, `svg.morphTo` for the title morph, and `splitText` for the typed edit.
- **Saad decides:** Option A, B or both, and which real stack to name (for example, the tools he actually uses).

### 5. Security: how I secure my products

- **Voice `[draft]`:** "Security isn't a feature you add at the end. It's every layer saying no to the wrong thing, quietly, every time."
- **Choreography (450vh), the most intense chapter:**
  - `0.00–0.15`: dark stage. Concentric rings, like a vault door or shield, assemble from the centre, each ring a security layer: *HTTPS · Authentication · Authorisation · Input validation · Rate limiting · Row-level security · Monitoring*. Each ring draws itself and locks into place with a short click of rotation.
  - `0.15–0.70`: **the attack.** Request particles stream in from the edges.
    - Green ones pass through every ring to the core.
    - Red ones (shown as "SQL injection", "stolen token", "too many requests" and so on) are each stopped at the ring built to catch them. Each hit sends a brief shockwave around that ring, and the label of the threat it stopped flashes.
    - Scrolling further adds more pressure, with more particles and faster streams, and the rings hold.
  - `0.70–0.90`: the vault rings rotate shut, one after another, each slightly offset, like a combination lock completing.
  - `0.90–1.00`: the rings collapse into a small lock icon, which slides into the Selected work heading as the handoff back to the existing page.
- **Technique:** particles on canvas (a small hand-written loop, not a library) for performance, with rings and labels in SVG driven by anime.js. Particle count and speed are read from scroll progress, so scrolling back calms the stream.
- **Honesty rule:** only show layers Saad actually uses. Every ring label must be true for his projects.

## Assets Saad will send

| Asset | Format | Notes |
|---|---|---|
| Device frame sequence (chapter 2) | WebP, numbered `0001.webp`…, 150–240 frames, 1920×1080, plus a 1080×1350 portrait set if possible | Plain dark background that matches `--night`, consistent lighting, and no motion blur. One clean exploded hold of about 20 frames in the middle. |
| Component positions (chapter 2) | small JSON: `{ "label": "Interface", "frames": [40, 120], "x": 0.62, "y": 0.31 }` | Can be measured afterwards from the frames. |
| PNLF dashboards (chapter 3) | PNG or WebP at 2×, plus chart values if he can share them | Blur or replace any client-sensitive data before sending. |
| Backend sequence (chapter 4, optional) | same as the device frames | Only for Option B. |
| Music bed | MP3/OGG, 2–3 minutes, loops seamlessly | Soft piano or ambient pads, no drums, licensed for web use. Quiet: about −24 LUFS. |
| Voice clips | one MP3/OGG per chapter, plus a `.vtt` with word timings | Generated offline from a TTS provider or recorded by a voice actor. API keys never reach the browser. |

Folder layout:

```
public/showcase/
  frames/device/desktop/0001.webp …
  frames/device/mobile/0001.webp …
  frames/device/labels.json
  dashboards/pnlf-01.webp …
  audio/music.mp3
  audio/01-intro.mp3   audio/01-intro.vtt
  audio/02-interfaces.mp3 …
```

## Performance budget

- **JS:** the Showcase chunk (anime.js modules in use plus Showcase code) ≤ 50 KB gzipped, loaded with a dynamic import when the Intro is about one screen away. The hero must not get slower.
- **Frames:** WebP at about 50–70 KB per desktop frame and 25–35 KB per mobile frame. A 200-frame sequence is about 6–7 MB on desktop and about 3–4 MB on mobile. It loads only when its chapter approaches and is never part of the first page load.
- **Audio:** voice at 96 kbps mono and music at 128 kbps stereo. Fetched only after "Sound on".
- **Frame rate:** 60 fps on a mid-range phone. Animate only `transform`, `opacity` and canvas drawing; avoid animating `filter: blur()` on large layers on mobile. Fall back to opacity there.
- Save-Data or slow connections (`navigator.connection.saveData`, `effectiveType` of `2g`/`3g`): load every 3rd frame and say nothing about it.

## Reduced motion and accessibility

- **`prefers-reduced-motion`:** no pinning or scrubbing. Each chapter shows one composed still (the exploded frame, the dashboard stack, the pipeline diagram, the full vault) with its caption, and the page scrolls normally. Sound still works if the visitor chooses it.
- **Keyboard:** "Sound on" and the transport pill are real buttons with visible focus. Nothing depends on hover.
- **Every chapter has an accessible text equivalent:** a heading plus the caption text, and labels as real text, not baked into images. Frame canvases get `role="img"` with a short description.
- **Mute is always one tap away** and remembered for the visit (`sessionStorage`, wrapped in try/catch).
- Contrast: captions meet WCAG AA over the darkest and brightest frames, using the scrim.

## Files

```
src/showcase/Showcase.jsx     sections, sticky stages, captions, transport pill (lazy-loaded)
src/showcase/chapters.js      voice lines, caption cues, labels, timings: the only place copy lives
src/showcase/audio.js         AudioContext, music bed, ducking, per-chapter voice
src/showcase/sequence.js      frame loading and canvas scrub player
src/showcase/particles.js     security-chapter particle field
src/showcase/scenes/*.js      one choreography per chapter: build(stageEl, ctx) → { timeline, destroy }
src/showcase/showcase.css     stage, captions, glass pill, reduced-motion stills
```

`App.jsx` renders `<Showcase />` between the hero and `#work`, and removes the old `statement` section it replaces. Add `#showcase` to the nav if Saad wants a direct link.

**Verify before coding:** anime.js 4.5's exact signatures for `onScroll` (`sync`, `enter`, `leave`), `splitText`, `svg.createDrawable`, `svg.createMotionPath` and `svg.morphTo`. Check `node_modules/animejs/types`, because names shifted between 4.0 and 4.5.

## Build order

1. **Shell:** sections, sticky stages, the chapter timeline wiring, captions without sound, and the reduced-motion stills. Shippable as a silent, scroll-animated story.
2. **Chapter 1 (Intro)**, fully choreographed, because it sets the bar for the rest.
3. **Audio engine:** "Sound on", music bed, ducking, intro voice, word-timed captions.
4. **Chapter 2** as soon as the device frames arrive. Until then, build it against placeholder frames rendered from any free device model.
5. **Chapter 5 (Security)**, which needs no assets, then **chapter 4**, then **chapter 3** when the PNLF screenshots arrive.
6. **Finish:** handoffs between chapters, a performance pass on a real phone, an impeccable finish review, and a `DESIGN.md` note for the Showcase surface.

## Done means

- [ ] All five chapters scrub smoothly forward and backward, with no jumps between chapters.
- [ ] Music starts only after "Sound on", the voice follows, the music dips under the voice, and mute and replay work.
- [ ] Captions are visible on every chapter with sound off, and highlight word by word with sound on.
- [ ] Every voice line and every security or backend claim is approved by Saad. No `[draft]` or `[placeholder]` remains.
- [ ] Reduced motion shows composed stills; keyboard users can reach every control.
- [ ] Showcase JS ≤ 50 KB gzipped; frames and audio never load before they are needed; the hero is no slower.
- [ ] Watched live on a mid-range phone and a laptop at full frame rate.

## Questions for Saad

1. **Device:** laptop, watch or something else for chapter 2? Will you render the frames, or should we source a model and render them in Blender?
2. **Voice:** a TTS provider (which one, and the budget) or a hired voice actor? Any accent preference for the mature male voice?
3. **Music:** do you have a track in mind, or should we pick a royalty-free one for you to approve?
4. **PNLF:** which dashboards, what problem each one solves, and is any data confidential?
5. **Backend:** Option A (drawn demo), B (your frames) or both? Which stack should be named?
6. **Security:** which of the listed layers do your projects actually use? Add any that are missing.
7. Should the `[draft]` voice lines for chapters 2–5 stay, or will you write your own?
8. Does this replace Story Mode (`docs/STORY_MODE.md`), or should Story Mode still be built later as a separate experience?
