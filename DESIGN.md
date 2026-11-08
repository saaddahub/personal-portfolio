---
name: Night Blossom
description: Saad Akhtar's portfolio as a cherry tree at night, its petals carried through the page by a wind the visitor steers, settling in a pink dawn.
colors:
  night: "#0d0a10"
  night-raised: "#17111a"
  bark: "#4a2a36"
  mist: "#f4ede9"
  dusk: "#ab9ca5"
  line: "#f4ede91f"
  blossom: "#f5a9c2"
  blossom-deep: "#d9577e"
  blossom-pale: "#ffdbe6"
  dawn: "#f3c6d3"
  dawn-ink: "#2a1521"
  dawn-dim: "#6e3d50"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 10vw, 6rem)"
    fontWeight: 250
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  statement:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 4.4vw, 4rem)"
    fontWeight: 300
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.2vw, 3.75rem)"
    fontWeight: 250
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.75rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  lead:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.9vw, 1.6rem)"
    fontWeight: 300
    lineHeight: 1.42
    letterSpacing: "-0.01em"
  title-small:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 450
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"tnum\""
  label:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  focus: "6px"
  media: "14px"
  pill: "999px"
  circle: "50%"
spacing:
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
  section: "clamp(5rem, 13vh, 9rem)"
  column-gap: "clamp(2rem, 5vw, 5rem)"
  row: "1.6rem"
  container: "76rem"
components:
  nav-bar:
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 0"
    width: "min(100%, 76rem)"
  nav-bar-scrolled:
    backgroundColor: "#17111ad1"
    rounded: "{rounded.pill}"
    padding: "0.55rem 0.6rem 0.55rem 1.25rem"
    width: "min(100%, 31rem)"
  nav-bar-dawn:
    backgroundColor: "#f6d4deb8"
    textColor: "{colors.dawn-ink}"
  nav-link:
    textColor: "{colors.dusk}"
    typography: "{typography.body-small}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.8rem"
  nav-link-hover:
    backgroundColor: "#f4ede90f"
    textColor: "{colors.mist}"
  action-link:
    textColor: "{colors.mist}"
    padding: "0.3em 0"
  work-row-head:
    textColor: "{colors.mist}"
    typography: "{typography.title}"
    padding: "1.6rem 0"
  work-row-head-open:
    textColor: "{colors.blossom-pale}"
  work-image:
    rounded: "{rounded.media}"
  dawn-field:
    backgroundColor: "{colors.dawn}"
    textColor: "{colors.dawn-ink}"
  mail-copy:
    textColor: "{colors.dawn-ink}"
    rounded: "{rounded.circle}"
    size: "2.75rem"
---

# Design System: Night Blossom

## Overview

**Creative North Star: "The Night Orchard"**

One idea owns the page: a cherry tree at night, and a wind the visitor steers. The tree grows from its base on arrival and blooms as the growth front passes its clusters, then sways. Petals leave it and cross every section on a wind that follows the pointer and gusts with scroll speed, then land on the ground at the foot of the contact section, where the night has turned to a pink dawn. Everything else stays quiet so that this one moment can be loud.

The scene sits on fixed layers behind the content: the tree canvas (a fixed layer that drifts up at 0.45 of scroll speed and fades out over 1.4 viewports, so the canopy lingers over the statement), then the petal canvas, then text. The interface is spare: one thin variable grotesque, hairline rules, text actions instead of buttons, and one translucent pill nav. Density is low and type is large; hierarchy comes from size and weight, never from labels.

Motion follows one ease (exponential ease-out) and starts from a visible default: with scripts off or reduced motion on, everything renders in place. Petal density, settling and frame rate were reviewed from source only and have not been measured live. This file records how they are meant to behave and makes no performance claims.

**Key Characteristics:**
- Plum-black night, never pure black, giving way once to a drenched pink dawn.
- Pink belongs to the tree and petals; the interface borrows it only for focus, selection, the primary underline and an open row.
- One self-hosted variable face (Bricolage Grotesque) at every size, thin at display sizes.
- Depth comes from the scene's layers, not from shadows.
- Quiet entrances so the tree, the scrubbed statement and the dawn title keep the motion.

## Colors

A restrained night palette with one committed close: plum-black and mist carry the page, blossom pinks belong to the scene, and the contact section is drenched in dawn.

### Primary
- **Blossom Pink** (blossom): the petals' and canopy's middle tone. On the interface, only the focus ring, text selection, the primary action's underline and an open project's plus icon use it.
- **Deep Blossom** (blossom-deep): the darkest bloom and the dawn petals. It also tints the ground strip where petals settle.
- **Pale Blossom** (blossom-pale): the brightest bloom. A project title turns this colour on hover and while its row is open.

### Secondary
- **Dawn Field** (dawn): the full-bleed ground of the contact section, reached through a 30rem gradient that climbs from night through wine and rose stops.
- **Dawn Ink** (dawn-ink): text, focus rings and selection on the dawn field. Translucent dawn-ink also draws the hairlines and hover washes there.
- **Dawn Dim** (dawn-dim): secondary text on dawn (availability line, footer, the nav's links when it takes the dawn tone).

### Neutral
- **Night** (night): the page and scrollbar track; also the theme-color.
- **Night Raised** (night-raised): the scrolled nav pill (at about 82% alpha), and its solid ground under reduced transparency.
- **Bark** (bark): the scrollbar thumb. Lit bark tones in the canvas engine draw the trunk.
- **Mist** (mist): primary text on night.
- **Dusk** (dusk): secondary text, meta, timeline years, list terms and the hero hint.
- **Hairline** (line): mist at 12% alpha for the row and section rules.

### Named Rules
**The Night-to-Dawn Rule.** The page changes colour exactly once, from night to dawn in the contact section. No other section gets its own background.

**The Blossom Owns Pink Rule.** Pink is the tree's colour. Interface elements use it only for focus, selection, the primary underline and the open or hovered project state, never for fills or blocks.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif), self-hosted as one variable woff2 (weight 200 to 800, width 75 to 100%), preloaded.
**Body Font:** the same family.

**Character:** One family with optical sizing on, so it is calm at reading sizes and full of character at display sizes. Display sizes are thin (250 to 300) and tightly tracked. Reading text sits at 400 with neutral tracking.

### Hierarchy
- **Display** (250, clamp(3.25rem, 10vw, 6rem), 0.92): the hero name, set line by line, and the dawn title "Say hello." (line-height 0.95 there).
- **Statement** (300, clamp(1.9rem, 4.4vw, 4rem), 1.08): the pinned sentence, balanced wrap, its words lighting from 16% opacity in reading order.
- **Headline** (250, clamp(2.25rem, 4.2vw, 3.75rem), 1): section titles, sticky at 7rem from 900px up.
- **Title** (300, clamp(1.6rem, 3vw, 2.75rem), 1.05): project titles in the work index. The email link on dawn uses a near sibling (300, clamp(1.4rem, 3.6vw, 2.75rem)).
- **Lead** (300, clamp(1.25rem, 1.9vw, 1.6rem), 1.42): About paragraphs, max 36ch.
- **Title Small** (450, 1.25rem, 1.3): timeline entry titles.
- **Body** (400, 1.0625rem, 1.6): reading text. Project descriptions max 52ch, timeline text max 56ch. The hero role and dawn text step up through small clamps (to 1.125rem and 1.25rem).
- **Body Small** (400, 0.9375rem): nav links, timeline years and places, project facts.
- **Meta** (400, 0.875rem, tabular): project year and status, footer.
- **Label** (400, 0.8125rem): definition-list terms ("Role", "Built with", the "currently" notes) and the hero hint, always in dusk.

### Named Rules
**The One Face Rule.** Bricolage Grotesque at every size. No monospace and no second family, because nothing on the page is code.

**The Thin Display Rule.** Anything larger than 1.6rem is set at weight 250 or 300 with negative tracking (-0.03em to -0.04em). Weight 450 to 500 is kept for small emphasis: actions, the wordmark, timeline titles.

**The Tabular Numbers Rule.** Years, dates and the Lahore clock use tabular figures.

## Layout

Content sits in a single wrapper, min(100% minus two gutters, 76rem), with a fluid gutter (1.25rem to 2.5rem). The hero is 100svh (min 34rem) with the copy anchored bottom-left, clear of the tree, and the wind hint at the lower right (static under the actions below 640px). The statement is a 260vh track with a sticky 100svh pin. Work and About share a frame: stacked below 900px, then a 1 : 2.25 grid with a sticky section title on the left. Their vertical padding is clamp(5rem, 13vh, 9rem).

The work index is a list of full-width rows separated by hairlines, 1.6rem tall padding. Below 900px a row's meta drops under its title. An open row with an image splits 1 : 1.15. The "currently" notes run three across, then one column below 900px. Timeline entries run as a 9rem year column beside the text, then stack.

The dawn section opens with 31rem of gradient (27rem below 640px) before its content, then a 7rem gap above the footer and a 4.5rem ground strip at the bottom.

## Elevation & Depth

The system has no shadows. Depth comes from the scene's stacking: the tree canvas (z 0, fixed, masked to fade its trunk into the night at 72%), the petal canvas (z 1, fixed, pointer-transparent), then content (z 2). Petals pass behind text, never over it. The only material surface is the nav pill: night-raised at 82% alpha with an 18px blur, 140% saturation and a hairline edge, or a translucent dawn tone once the sunrise is behind it.

### Named Rules
**The Scene Is the Depth Rule.** Layers come from the tree, the petals and the dawn. Do not add box shadows or lifted cards.

**The One Glass Rule.** The nav pill is the only translucent, blurred surface. Under reduced transparency it turns solid (night-raised, or dawn).

## Shapes

The page has almost no containers, so it has little form language. Rows and sections are divided by 1px hairlines rather than boxed. Round shapes are kept for things you touch: the pill nav and its link hovers (999px), the circular copy button (50%). Project screenshots get gently rounded corners (14px) with a hairline border. Focus rings are 2px, offset 4px, softly rounded (6px).

## Components

### Navigation
The nav is quiet at the top and becomes a compact pill after the first scroll.
- **Rest:** a transparent, full-width bar (76rem max) with the wordmark (weight 500) and three links: Work, About, Contact.
- **Scrolled (past 40px):** it narrows to 31rem and takes the translucent night pill. Width, padding, fill and blur animate together (0.7s and 0.45s, house ease).
- **Dawn tone:** once the sunrise is 14rem past the nav, the pill turns translucent dawn (#f6d4deb8) with dawn-ink text, dawn-dim links and dawn-ink focus.
- **Links:** dusk, 0.9375rem, pill padding. On hover they turn mist over a 6% mist wash (dawn-ink wash in the dawn tone); press scales them to 0.97.
- **Mobile:** below 640px the wordmark shortens to "Saad".
- **Entrance:** fades in at 1.8s, after the name.

### Action links
Actions are text, not buttons.
- **Shape:** inline text with a lucide line icon and a 1px underline drawn from the left.
- **Default:** the underline rests at 30% width and 45% opacity. On the primary action it is a full-width blossom line.
- **Hover:** the underline draws to full width (0.5s). Arrow-down icons nudge down 2px; external links nudge up-right.
- **Press:** scale 0.97 over 100ms.

### Project row (signature)
A typographic index row that expands in place.
- **Head:** a full-width button with the title, then meta (year, status), then a plus icon. It carries `aria-expanded` and `aria-controls`; closed panels are `inert`.
- **Hover:** the title shifts 0.6rem right and turns pale blossom. Hovering with a mouse sends a sideways gust through the petals at that row's height.
- **Open:** the plus rotates 45 degrees to blossom, the panel grows via grid rows (0.65s, reversible mid-flight), and its contents fade in after 0.12s.
- **Panel:** a description, a facts list (Role, Built with) and an optional live link. Where a screenshot exists it sits beside the text.

### Copy email
A 2.75rem circular icon button beside the email link, with a translucent dawn-ink hairline. It swaps Copy for Check and announces "Email address copied" through a polite status region. If the clipboard fails it falls back to mailto.

### Dawn field (signature)
The contact section: a 30rem gradient from night to dawn, a display-size invitation, the availability line, the email, external links, a footer with a live Lahore clock, and the ground strip (a blossom-deep wash) where petals settle and stay. Selection and focus switch to dawn-ink here.

### Scene engine (signature)
`src/blossom.js` draws on two canvases. The tree is generated from a fixed seed and grows along its branch distance over 1.9s (cubic ease-out, after 0.25s), with blooms appearing as the front passes. Limbs bend one way along their length and outer limbs arch under their own weight. Besides the forks at their ends, mid-level limbs throw side shoots along their length, which fill the crown with fine branching. The wood tapers exactly with round joints, carries a pink rim light from the blossoms over a shadowed underside, and thick limbs show dark fissures and the pale horizontal lenticels of cherry bark. About a third of the blossom clusters sit deeper in the crown, smaller, darker and dimmer, so the canopy reads as a volume. Branches and blossoms draw from separate random streams, so blossom tuning never reshapes the tree. It then sways around its trunk base. Petals are particles in a wind field. Near the pointer, petals take on its velocity. Scroll speed raises gusts and releases more petals, and fast pointer movement in the canopy shakes petals loose near the pointer. Petals are tinted night pinks above the dawn line and dawn pinks below it. Particle counts are capped lower on coarse pointers and narrow screens. Under reduced motion the tree renders fully grown and still, and no petals fly.

### Motion grammar
- **Ease:** cubic-bezier(0.16, 1, 0.3, 1) everywhere except linear word-lighting and 100ms ease-out press feedback.
- **Hero entrance:** name lines rise from 108% (1.3s, from 1.1s, 90ms apart), then the role, actions and hint arrive with a 0.75rem lift and a 6px blur clearing. Hero copy fades out over the first 35% of a viewport of scroll.
- **Reveals:** a plain opacity fade (0.9s, 60ms stagger by index) for section titles, rows, About blocks and the dawn copy. The dawn title alone blooms from 0.94 scale and 8px blur.
- **Smooth scroll:** Lenis (lerp 0.085), off under reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep one moment loud: the tree and its wind. Entrances elsewhere stay a plain fade.
- **Do** start every animated element from a visible state, gating entrances on the `motion` class so scripts-off and reduced-motion visitors see everything in place.
- **Do** theme selection, focus rings and the scrollbar from the palette, and switch them to dawn-ink inside the dawn field.
- **Do** use the house ease (cubic-bezier(0.16, 1, 0.3, 1)) and press feedback (scale 0.97, 100ms) on interactive elements.
- **Do** divide content with 1px hairlines (line on night, translucent dawn-ink on dawn) instead of boxing it.

### Don't:
- **Don't** add eyebrow labels, section numbers or stat counters above headings.
- **Don't** put petals over text, or let motion hide content when JavaScript fails.
- **Don't** add box shadows, cards or a second translucent surface. The nav pill is the only glass.
- **Don't** use pink as an interface fill. Light and glow belong to the blossoms.
- **Don't** introduce monospace or a second typeface.
