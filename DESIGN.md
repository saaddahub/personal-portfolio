---
name: SA-01 Personal Monitor
description: A working vintage CRT that carries Saad Akhtar's personal signal.
colors:
  room: "#0b100d"
  screen: "#0e1210"
  phosphor: "#efe9d8"
  accent: "#6dff9c"
  secondary: "#ffb347"
  dim: "#b0b9aa"
  plastic-light: "#e5decb"
  plastic-mid: "#dbd3bd"
  plastic-dark: "#c7bda5"
  hardware-ink: "#373b2e"
  bezel-light: "#45483e"
  bezel-mid: "#20241d"
  bezel-dark: "#11170f"
  recess: "#090d0a"
  key-light: "#e7e0cc"
  key-dark: "#c1b89e"
  key-ink: "#4d5142"
  power-light: "#87916a"
  power-dark: "#5c684b"
  power-ink: "#d4dcc0"
  amber-phosphor: "#ffb000"
  amber-dim: "#d49c39"
  amber-screen: "#130f08"
  p1-phosphor: "#33ff66"
  p1-dim: "#6dc584"
  p1-screen: "#081109"
  white-phosphor: "#e8f0ff"
  white-dim: "#b3bed3"
  white-screen: "#0d1017"
  cga-phosphor: "#fff"
  cga-accent: "#55ffff"
  cga-secondary: "#ff55ff"
  cga-dim: "#b8d3d3"
  cga-screen: "#080a10"
typography:
  display:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "5cqw"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "2.55em"
    fontWeight: 600
    lineHeight: 1.13
    letterSpacing: "-0.04em"
  title:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "1em"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.035em"
  body:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.88em"
    lineHeight: 1.8
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.57em"
    letterSpacing: "0.07em"
  molding:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "clamp(14px, 1.8vw, 25px)"
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  osd:
    fontFamily: "Silkscreen, monospace"
    fontSize: "0.78em"
rounded:
  key: "7px"
  shell: "34px 34px 30px 30px"
  bezel: "26px 26px 29px 29px"
  tube: "7% / 9%"
  circle: "50%"
  field: "0"
  plain-screen: "14px"
components:
  hardware-key:
    textColor: "{colors.key-ink}"
    rounded: "{rounded.key}"
    width: "44px"
    height: "44px"
  power-button:
    textColor: "{colors.power-ink}"
    rounded: "{rounded.circle}"
    width: "46px"
    height: "46px"
  channel-menu:
    textColor: "{colors.accent}"
    padding: "3px 2px"
  channel-menu-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.screen}"
  story-invitation:
    textColor: "{colors.accent}"
    padding: "10px"
  terminal-field:
    textColor: "{colors.phosphor}"
    rounded: "{rounded.field}"
    padding: "10px"
  project-row-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.screen}"
  status-overlay:
    textColor: "{colors.accent}"
    typography: "{typography.osd}"
    padding: "4px 6px"
---

# Design System: SA-01 Personal Monitor

## Overview

**Creative North Star: "The Personal Signal"**

A warm, aged plastic CRT sits on a dark desk. The machine is the portfolio: its curved glass contains a working teletext and BBS interface, while the molded controls remain outside the picture. Hardware feels used and tactile; screen content feels numbered, deliberate and alive.

The user-supplied SA-01 brief fixes this world. CSS materials, ordinary React content and synthesized opt-in audio carry the experience. The same machine remains visible on phones, with a compact first Home frame and internally scrolling reading surfaces.

**Key Characteristics:**
- Aged plastic, recessed seams, a dark gasket and curved reflective glass.
- Phosphor typography, numbered channels and inverse selection bars.
- Physical controls and an always-visible sound grille.
- Optional sound, plain reading mode and reduced-motion support.

## Colors

Warm molding surrounds a dark, green-tinted room and a variable phosphor screen. Frontmatter values are extracted from `src/styles/tokens.css`, `monitor.css` and `screen.css`; the CSS remains the runtime source of truth.

### Primary
- **Phosphor green** (`accent`): links, channel controls, focus outlines, rules, progress and screen spill.
- **Warm phosphor** (`phosphor`): default reading text, bright enough to survive the glass treatment.

### Secondary
- **Signal amber** (`secondary`): field labels, small emphasis and story details.

### Neutral
- **Night room** (`room`) and **tube black** (`screen`): the scene and reading plane.
- **Quiet signal** (`dim`): supporting copy and secondary status.
- **Aged plastic** (`plastic-light`, `plastic-mid`, `plastic-dark`): the shell's diagonal material gradient.
- **Recessed gasket** (`bezel-light`, `bezel-mid`, `bezel-dark`, `recess`): the dark transition from molding into glass.
- **Molded keys** (`key-light`, `key-dark`, `key-ink`) and **olive power** (`power-light`, `power-dark`, `power-ink`): physical control surfaces and legends.

**The Chassis Rule.** Colour mode changes the picture and its emitted light; it does not recolor the plastic chassis.

The four alternate modes replace the five screen variables: amber uses its phosphor for foreground, accent and secondary; green P1 does the same; cool white does the same; CGA separates white foreground, cyan accent and magenta secondary. Each mode has its own dim text and screen background. Story tint can choose the chapter's mode through the same mechanism.

## Typography

The original portfolio retains General Sans, italic Newsreader and its existing type scale inside `.portfolio-surface`. IBM Plex Mono and Silkscreen serve the monitor boot, OSD and optional terminal/story views. Archivo Black supplies the molded chassis lettering. The original palette and theme toggle remain intact; alternate CRT colour modes tint the entire picture.

## Layout

The chassis fills the complete browser viewport (`100dvh`, 100% width). Its column layout reserves space for physical controls and gives the remaining height to the tube. The desk, stand and external room labels are hidden; Story Mode keeps the chassis at this size.

The original continuous portfolio renders directly in React inside `.portfolio-viewport`, with no iframe. Its navigation, project gallery, globe, music player and content provider are retained. Lenis and ScrollTrigger use this internal scroll container. Viewport units in original styles map to the tube's container dimensions. Scoped CSS prevents the portfolio and monitor styles from affecting each other. Project detail routes also render inside the tube.

At narrow widths the original portfolio's mobile navigation and layouts apply, while the physical controls wrap into a full-width row. The grille remains visible. The shell has 16px corners and safe-area-aware padding.

## Elevation & Depth

Depth is structural. The shell combines a long desk shadow, a short contact shadow, bright upper inset edges and dark lower inset edges. The bezel and tube recess invert that shading to put the picture behind the molding. Physical keys have lifted lower shadows that compress when pressed; the olive power button and ridged brightness knob share this tactile treatment.

Glass adds scanlines, an RGB mask, low-opacity noise, bloom, a vignette and reflected room light. The tube content can use SVG displacement. Pointer position shifts the reflections and, on large desktop layouts, tilts the shell slightly. The exact shell, key and tube shadow values are recorded in the sidecar rather than flattened into a generic elevation scale.

**The Readable Signal Rule.** Effects must yield to plain reading mode and reduced-motion preferences.

Plain mode removes the effect stack, glass, distortion, text glow and animated power/static treatments while retaining the machine. Reduced motion removes travel, flicker, jitter, moving noise and tracking, stops idle motion, and lowers scanline opacity. Text-only story mode omits scenes, stops typing, hides tracking and suppresses random jitter, noise generation and static bursts. It retains the surrounding CRT presentation; plain mode is the full effects-off option. Rendering also drops displacement, bloom blur and then noise as frame time degrades.

## Shapes

The viewport-filling shell has 16px rounded corners; the bezel repeats the molded shape at a smaller inset. The tube uses elliptical percentage radii. Vents, seams, crosshead screws, grille slits and small indicator lights establish physical scale without image assets. The stand is hidden in this layout.

Channel text controls, project rows and terminal fields stay square. Physical channel keys are gently rounded, while colour, power and brightness controls are circular. Phone molding rounds down to 22px, with a 19px bezel and a taller tube silhouette. Plain mode gives the screen a simple 14px radius.

## Components

### Hardware controls

Tactile molded controls live beneath the glass. Channel keys are 44px square; power is 46px square. Circular colour and brightness controls reach 44px on phones. The sound grille remains visible and acts as a labeled mute button, with a 44px minimum interaction height. Hardware focus uses a dark green outline against the plastic. The brightness knob is an ARIA slider with keyboard, wheel, pointer and reset interactions; it exposes its percentage value.

### Channel navigation and project rows

Numbered text buttons use the screen accent without a filled resting surface. Hover inverts foreground and background; focus keeps a visible two-pixel outline. Home is a two-column grid with compact 28px minimum row heights. Selected project rows use the same inverse treatment and `aria-selected`. Phone project rows have 44px minimum height. Preserve the current compact menu dimensions when editing copy; the Home rows are intentionally smaller than the physical controls.

### Transmission launcher and story transport

The launcher is a square-cornered accent-tinted border with a play label. It sits beside desktop navigation and becomes a single 44px minimum-height call to action below phone navigation. The seven-part story uses a timecode, chapter text, optional code-drawn scenes, play/pause/skip controls and a segmented tape progress bar. Text-only mode leaves chapter text and transport available. Reduced motion selects text-only storytelling automatically.

### Terminal fields

Visible labels use the secondary screen color. Fields have a faint accent-tinted background, one bottom rule, square corners and accent carets; placeholders use the dim color. On phones they retain a 44px minimum height. Native required/email validation and explicit error/status messages accompany submission. Sending visibly disables the transmit control.

### OSD and remote guide

Transient Silkscreen feedback sits toward the upper-right glass on a translucent dark backing and announces changes through a polite live region. The remote guide is an inset, scrollable terminal dialog with a thin accent border. It moves focus inside, traps keyboard tabbing and restores focus on close. A focus-revealed skip control enables plain mode. Decorative effect layers do not intercept input.

## Do's and Don'ts

### Do:
- **Do** keep physical controls beneath the glass and the sound grille visible at every breakpoint.
- **Do** keep Home navigation in two columns and the transmission launcher reachable in its first compact frame.
- **Do** use inverse phosphor selection for interactive screen states and preserve visible keyboard focus.
- **Do** preserve plain mode, reduced motion, text-only storytelling and muted-by-default sound.
- **Do** draw hardware and story materials in code and keep prose selectable, semantic and scrollable.

### Don't:
- **Don't** recolor the molded chassis when changing screen colour modes.
- **Don't** let decorative CRT layers intercept clicks or obscure reading controls.
- **Don't** reintroduce story scenes, random jitter or static bursts into text-only storytelling.
- **Don't** treat the compact Home menu as a generic spacious card grid.
