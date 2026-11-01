# Rowan: two eras of a personal computer

Production design brief · Updated 1 November 2026 · Implementation in progress; release gates remain

This is the visual and interaction contract for the next version of Saad Akhtar's portfolio. Read it with [the engineering and release contract](docs/OS_ENGINEERING.md). [DESIGN.md](DESIGN.md) describes the monitor that exists today; this brief takes precedence for the new desktop experience. Requirements here are not claims about features already shipped.

## 1. The experience

Build a usable personal computer inside a convincingly rendered monitor. A visitor can explore Saad's work, manage local documents, type meaningful commands, play media, change settings, and return to their saved workspace.

There are two complete editions. On a normal website arrival, show both physical computer setups together, vintage on the left and modern on the right, following the user's sketch. A small OS-choice popup starts a cinematic move toward the selected monitor. After entry, that one monitor fills the viewport and becomes the live desktop. The two-computer opening scene is a selection view, not two simultaneously interactive desktops. This arrival direction supersedes the earlier idea of entering one full-screen monitor immediately.

| Edition | Hardware | Desktop identity | Feeling |
| --- | --- | --- | --- |
| **Rowan 98** | The current charcoal SA-01 CRT, upgraded to real 3D materials and lighting | Windows 98-inspired desktop, original branding and icons | Familiar, mechanical, dense, personal |
| **Rowan** | **SA-02**, a graphite thin-bezel monitor with softened edges | An original 2026 desktop with an app rail and joined work surfaces | Quiet, precise, spacious, unexpectedly tactile |

**Rowan is a working name**, chosen to sound like an ordinary, human product. It can be renamed centrally; naming is not a claim of trademark clearance. Use “Rowan 98” and “Rowan” in product UI, with “1998 / 2026” on the era selector. Avoid futuristic version strings and invented technical jargon in menus.

The mode is Experience at arrival and Operate inside applications. Beauty must survive actual use: an open menu, a long filename, an editor with unsaved changes, several windows, and an error message.

### Fixed commitments

- Preserve the charcoal CRT, curved dark sides, cool glass rim, physical controls, and full-viewport framing after entry. The opening scene is the intentional two-setup exception; do not bring back the beige casing or leave the selected working monitor small in a large empty background.
- Make the modern monitor a different physical object and the modern desktop a different interaction system. Changing the wallpaper and border radius is insufficient.
- Keep the original portfolio intact as an application in both editions: its content, project detail links, CMS data, typography, and internal navigation survive.
- Every advertised application and visible control must do its stated job. No fake installation buttons, arbitrary progress bars, decorative terminals, or random “CPU activity.”
- Use real-time CGI for the primary hardware presentation. CSS glow can be a fallback; it is not the finished lighting system.
- Keep keyboard operation, touch, readable text, audio consent, reduced motion, and a graphics-free reading route as release requirements.

### The signature moment

Open a pale document next to a blue image. Drag the image toward the right side of the screen. The nearby inner bevel picks up blue light; the opposite side remains mostly neutral. Close the image and the blue contribution disappears. Switch eras: the file is still there, while the surrounding hardware, window behavior, typography, and reflected light change together.

That causal relationship is the spectacle. A constant neon outline is not a substitute.

## 2. One computer, two presentations

Both editions share documents, utility applications, imported media, and the underlying command engine. Their six-game collections are intentionally different. Each remembers its own window arrangement, wallpaper, display settings, and active workspace. A note created in 1998 must open in 2026 with identical content.

The terminal is a real command interface to the browser workspace. File actions affect its actual local files. The experience does not imply access to the visitor's host operating system, native processes, or arbitrary shell execution. Application labels explain this simply: “Files are stored in this browser” and “External websites open in a new tab.”

Normal visits open the two-computer scene and OS chooser. A returning visitor's last edition can be highlighted, but must not be entered automatically. Selecting an edition restores its saved workspace after the camera approach. Explicit app/project/OS deep links may enter the correct focused desktop directly; they must not force a visitor through an unrelated chooser.

### Opening scene and cinematic entry

The latest user direction removes the desks and tables from the earlier sketch. Present the charcoal CRT on the left and thin graphite SA-02 on the right, suspended together in one dark studio. No desks, stands, keyboards, or mouse props. Preserve both approved monitor identities and the mixed upright sans/italic serif typography. Normal entry still offers an explicit era choice; selection then moves automatically to that monitor.

Greet the visitor with **Well, hello.** in large mixed typography. The letters roll into view through a mask as the greeting settles upward, then both monitor silhouettes swing gently into alignment. This is a finite opening sequence, not perpetual floating. Keep secondary copy quiet and readable.

The lower-center choice popup unfolds from a narrow central slit into a dimensional dialog, followed by staggered era buttons. Use **Where shall we begin?**, **1998 · The familiar one.**, and **2026 · The next chapter.** The visitor's choice is acknowledged before the popup folds away and the real camera moves. Both keyboard and touch work, Skip intro motion is persistent, and Read portfolio remains reachable. There is no forced choice or timed auto-entry before the user selects an era.

| Time from selection | Visible behavior |
| --- | --- |
| 0–420ms | Confirm the selected era, fold away the popup, and acknowledge the destination |
| 420–2220ms | Dolly toward the selected monitor over 1.8 seconds, with continuous quintic acceleration and deceleration; turn the chosen face squarely toward the viewer |
| Final third of approach | Fade the preview apps to a matching teal/classic or mineral/modern display surface |
| Next 420ms | Reveal the restored live desktop through the aligned aperture; leave its physical monitor visible |

The greeting and chooser take about two seconds to settle on first arrival. Choices stay actionable throughout; Skip intro motion and reduced motion remove this choreography. Return motion takes 900ms. Use one shared renderer; stop drawing the settled hardware until its lighting, brightness, geometry, or presentation changes.

Use a continuous position/orientation path with no velocity jump at the internal stage boundaries. The sensation is a carefully edited dolly-in, not scaling a screenshot, bouncing toward an icon, or suddenly widening the lens. Keep the horizon stable. The final blend must have matching screen bounds, color, and typography; no white flash, double text, visible rectangular page overlay, or last-frame camera snap.

The camera lands with the selected monitor framing the usable OS. The surrounding studio leaves view; the hardware, glass, and content-driven bezel lighting remain. “Blend into the screen” means a seamless transition from its rendered presentation to the real interactive desktop, not abandoning the monitor treatment for a plain webpage.

**60fps is the target for this camera sequence.** Prepare assets before it begins and reduce decorative rendering cost before sacrificing camera continuity. This is a measured delivery requirement on named reference devices, not a guarantee based on the easing curve. The engineering brief defines the frame-budget and handoff tests.

Reduced motion and Skip animation enter the selected focused view through a short 100–150ms fade, without spatial travel. Keyboard and touch choices use the same destination, saved state, and completion behavior. Graphics-unavailable mode retains an accessible two-choice presentation and direct desktop entry.

### Era selector

- Keep a labeled **1998 / 2026** selector reachable in every state, including power-off, boot, an open app, and a recoverable graphics failure.
- It belongs to the host presentation, outside the OS application tree. Place its compact visible tab at the lower-right viewport edge with a 44px hit area and a reserved exclusion area so it never covers application controls.
- Selecting an era saves drafts and the outgoing layout, prepares the destination, and restores that edition's workspace. It does not reload the page or clear files.
- From a focused desktop, switching eras saves the outgoing workspace, returns to the two-computer selection view, and then uses the same approach into the new choice. Use a faster 600–900ms pull-back for the return, without losing spatial continuity; keep a direct short-fade switch for Skip animation/reduced motion. Never dissolve two readable desktops over one another.
- Reduced motion switches directly with a short fade. A loading or failed destination retains the working outgoing edition and offers Retry.
- One live edition runs and plays media at a time. Both hardware models and lightweight screen previews are visible in the opening scene, within one shared renderer. Rapid repeated selections resolve safely without mounting two live desktops.

## 3. Hardware: two believable objects

In the selection scene both monitors are visible together. In the focused state the selected monitor occupies the complete viewport. Hardware dimensions adapt to the available aperture; do not render a fixed desktop at a tiny scale to fit a phone. Browser fullscreen is an optional user action, not a prerequisite.

### SA-01 charcoal CRT

Keep its current silhouette and hardware arrangement. Upgrade its material behavior rather than redesigning the object.

| Part | Treatment |
| --- | --- |
| Shell | Charcoal molded polymer, current `#343936 → #292e2b → #191e1b` reference tones, broad matte highlights |
| Inner bezel | Darker recessed lip with real depth, softened manufacturing edges, stronger light near the glass |
| Tube | Convex glass, a perceptible gap to the image plane, dark bowed sides, grazing reflections |
| Controls | Graphite channel keys, knurled brightness dial, olive power key, pale molded legends |
| Grille and seams | Recessed geometry or authored normal detail, localized contact shading, no flat black stickers |
| Fasteners | Small metal highlights, restrained differences in orientation, no exaggerated damage |

The CRT is a color display by default. Classic teal, gray controls, and navy title bars remain recognizable. Existing phosphor modes remain optional display settings; do not force the whole desktop green to communicate “old.” Save the user's explicit preference.

Scanlines, edge refraction, low-level phosphor bloom, and a brief power transition belong to the glass. Keep the central reading area stable. Do not inject recurrent glitches, camera shake, or flicker into normal editing. No permanent burn-in, dirty fingerprints across text, or artificial lag in menus.

The existing channel buttons become previous/next open application while the desktop is active. In Transmission they control chapters. The brightness dial controls display emission and its surrounding light, not the room's key light. The grille controls sound. Hardware labels/help must describe the active behavior.

### SA-02 modern monitor

The SA-02 is a flat, edge-lit silhouette in graphite anodized aluminum, with gently rolled corners and a thin anti-reflective glass face. It should feel engineered, not like a browser card with a shadow.

- At a 1440px-wide reference viewport, begin with a 7–10px visible frame and a 12–16px lower lip. These are optical proportions, not a reason to shrink touch targets.
- Outer corners start around 14px; the screen follows a related, slightly smaller contour. Avoid oversized phone-like corners.
- Glass is nearly flush. Include a tiny adhesive/gasket recess, a narrow metallic chamfer, and a restrained power indicator.
- Use fine directional roughness on the metal, a tight chamfer highlight, and a broad, faint room reflection on the glass. The screen image stays flat and crisp: no CRT mask, distortion, or scanlines.
- The room's softbox appears in the glass at the corresponding position and changes with viewing angle. A stationary highlight painted over every surface fails the material brief.
- Put display brightness and sound in the OS status menu. Keep a reachable physical power action; its invisible hit area may extend inward into a reserved screen margin without enlarging the frame.
- Crop the object to the viewport. A stand and a cinematic room are unnecessary for the focused experience; do not sacrifice screen area to display a desk.

The same screen content produces different responses on matte plastic, rubber, glass, and metal. Material albedo stays fixed; illumination changes its apparent color.

## 4. Rowan 98: familiarity with original character

Honor the grammar of late-90s desktop computing. Use a teal desktop, gray application chrome, crisp inset/outset bevels, navy active captions, square menus, and a bottom taskbar. The branding, wallpapers, sounds, and icon artwork are original; this is not a collection of copied Microsoft assets.

### First desktop viewport after entry

Five well-spaced desktop shortcuts sit in the left column: **Computer, Documents, Portfolio, Console, Recycle Bin**. A modest Welcome window introduces Saad using existing verified biography and offers **View work**, **Open Console**, and **Explore files**. The taskbar shows Start, open applications, the sound control, and the actual local time. Closing Welcome reveals a complete desktop; it does not remove the only navigation.

```text
┌─────────────────────────────────────────────────────────────────┐
│ Computer     ┌─ Welcome to Rowan 98 ──────────────── [_][□][×] ┐ │
│ Documents    │ Saad Akhtar                                    │ │
│ Portfolio    │ Existing biography and real portfolio links.   │ │
│ Console      │ [View work] [Open Console] [Explore files]     │ │
│ Recycle Bin  └───────────────────────────────────────────────┘ │
│                                                                 │
├──────────┬──────────────────────────┬────────────────────────────┤
│ Start    │ Welcome                  │ Sound             16:19   │
└──────────┴──────────────────────────┴────────────────────────────┘
```

The illustrated time is a layout example; runtime time is real and localized.

### Anatomy and behavior

- Window captions have an app icon, a title, and separate minimize, maximize/restore, and close buttons. The focused caption is navy; inactive captions are gray. A small document dirty marker has the same meaning everywhere.
- Put normal application actions in a menu bar: File, Edit, View, Help as appropriate. Underlines and keyboard menu navigation work. Disabled actions explain why when requested.
- Use actual depressed states for pressed keys and selected task buttons. A single active window owns focus and the top z-order.
- Start contains Programs, Documents, Settings, Help, Run, and Shut Down. Run launches registered apps or opens supported workspace paths. It does not pretend to run native executables.
- Right-click opens relevant desktop, file, or window menus; Menu/Shift+F10 provides a keyboard path. Double-click launches desktop icons on a mouse; Enter and a single touch tap provide equivalent actions.
- Resizing grips, scrollbars, tree views, file details, and status bars are part of the system. Recycle Bin contents can be restored.
- Wallpaper and sound are customizable, with original subdued defaults. Window animation is short and functional; familiarity must not become deliberately slow performance.

### Classic visual tokens

| Role | Starting value |
| --- | --- |
| Desktop | `#008080` |
| Chrome / raised face | `#C0C0C0` |
| Content / highlight | `#FFFFFF` |
| Primary text | `#181818` |
| Active caption / selection | `#000080` with white text |
| Inactive caption | `#5C6464` with white text |
| Bevel shadow / deep edge | `#808080` / `#303030` |
| Focus | Dotted dark outline on light surfaces; white outline on navy |

Use Tahoma/Verdana-style proportions for classic UI, starting at 13–14px with a comfortable line height. IBM Plex Mono serves Console. Original icons are authored on 16px and 32px grids with deliberate pixel edges. Do not apply pixelated rendering to paragraphs or the original portfolio. Classic controls can look compact while retaining adequate interactive padding; touch mode uses 44px targets.

## 5. Rowan: the 2026 desktop

The modern edition draws from precisely assembled architectural surfaces: a quiet vertical service edge, a broad workplane, and thin joints between objects. It has its own composition and behavior. It does not inherit a macOS dock, traffic-light controls, Windows 11 centered taskbar, or a grid of translucent dashboard cards.

### The desktop structure

1. A **64px left app rail** provides Apps at the top, active and pinned applications down the middle, and workspace switching at the bottom. Each icon has an accessible name and a visible label on expansion. The current app has one unmistakable active marker.
2. A **36px status line** names the active app and provides its menu. Time, sound, notifications, and display settings sit at the opposite end. This is useful chrome, not a system-monitor ticker.
3. The remaining area is a **workplane** for movable windows. The default ground is pale mineral with an original still wallpaper: a close crop of a satin-painted folded surface, with one deep graphite plane and soft directional light. No animated gradient blobs or arbitrary grid texture.
4. Two named workspaces, **Desk** and **Studio**, separate browsing from making. They are functional arrangements of the same apps and files, not separate accounts.

```text
┌───────┬─────────────────────────────────────────────────────────┐
│ Apps  │ Files                                   Sound  16:19   │
│       ├─────────────────────────────────────────────────────────┤
│ Files │ ┌─ Documents ───────────────────┐                       │
│ Notes │ │ Recent / folders / files     │   Quiet wallpaper      │
│ Work  │ │                              │                       │
│ >_    │ └──────────────────────────────┘                       │
│       │                                                         │
│ Desk  │                                                         │
│ Studio│                                                         │
└───────┴─────────────────────────────────────────────────────────┘
```

On first entry into this desktop, open a single restrained Welcome window with the same real introduction and actions as the classic edition. Files, Terminal, Portfolio, and Settings are immediately discoverable through the rail/Apps control. Later entries restore the visitor's arrangement instead of repeatedly opening Welcome. Do not fill the desktop with fake widgets to make a screenshot look busy.

### The distinguishing interaction: joined windows

Dragging one window close to the side of another previews a shared seam. On release they become an aligned pair. Dragging the seam redistributes their widths; maximizing either app temporarily fills the workplane, and Restore recovers the pair. Pulling a caption away separates them. Escape cancels the preview. A menu action, **Arrange side by side**, performs the same operation without dragging.

The joint is a crisp structural line. The active member gets a short warm-ink focus segment at its caption, echoed by the corresponding app marker on the rail. Do not animate a decorative line across the whole desktop. Window joining is a workspace capability, not a renamed card layout.

On touch, use a window menu to pair apps rather than requiring precise edge dragging. On narrow screens the pair becomes two switchable full-area app views while retaining its relationship for a later desktop resize.

### Window and component language

- App windows use solid surfaces, 10px outer corners, 6px field corners, and a single restrained contact shadow. The active window has stronger separation; inactive windows remain legible.
- A 36–40px caption uses the app name, document title, and clearly drawn minimize/maximize/close actions at the right. Do not copy traffic-light controls. Keep hit areas distinct.
- Menus are compact solid lists with text labels, shortcut hints, and clear selection. Context determines their contents; do not introduce a command palette as a substitute for menus.
- Apps opens a searchable application list. Search can find apps, local filenames, settings, and published projects, grouped by actual type. Keyboard navigation and empty results are designed states.
- Search results, file rows, and settings rows are aligned lists. Large cards are reserved for genuinely visual media previews.
- Notifications appear briefly near the status line, then remain in a small history panel. A failed save stays visible until resolved; routine saves do not create toast spam.
- Settings uses labeled controls and immediate previews with Reset. Appearance, Display & lighting, Sound, Files & storage, Keyboard, Accessibility, and About are the initial sections.
- A normal button is 32–36px tall on a pointer device, with a 44px touch variant. Text input starts at 15px/22px; titles use 18–22px. Use a 4px spacing base, normally 8/12/16/24/32px gaps.

### Modern visual tokens

| Role | Light appearance | Night appearance |
| --- | --- | --- |
| Desktop ground | `#E9E7DF` | `#101813` |
| Window surface | `#F7F6F0` | `#1A241D` |
| Menu / raised surface | `#FFFFFF` | `#233027` |
| Primary ink | `#202722` | `#E8EEE3` |
| Secondary ink | `#5D685F` | `#AFBEAA` |
| Nonessential separator | `#CCD1C6` | `#405044` |
| Selection | `#E1E9DE` with primary ink | `#304B3A` with primary ink |
| Signature warm ink | `#9D3D2B` | `#EFA48C` |
| Focus | `#274F3D` | `#B9D6A9` |

These are design starting values, not a substitute for computed contrast checks in the finished render. Essential control boundaries and focus marks must meet contrast requirements; faint separators never carry state alone.

Use Apple's SF Pro-style system sans for the modern UI, mixed with a Claude-style editorial italic serif within prominent document/welcome headings: “Saad” in upright Apple-style sans and “Akhtar” in italic serif; “A personal” in sans and “workspace.” in italic serif. Do not set the entire heading in only one face. This is the user's revised typography direction, visualized in [the revised concept](docs/concepts/rowan-2026-mixed-type-v3.png). Keep labels, captions, and body text sans-serif; reserve the italic serif for deliberate editorial emphasis. Use the native Apple system stack where available and an appropriately licensed matching fallback elsewhere. Terminal stays monospaced with SF Mono-style proportions; IBM Plex Mono remains the available project fallback. The original portfolio retains its General Sans/Newsreader typography. Self-host distributable font files with their license records for release; never assume a third-party font request succeeds.

Use the installed Lucide system for ordinary modern controls, with original vector artwork for the Rowan mark and signature application icons. One stroke grammar, restrained fill, no emoji as system icons.

### Motion

Use a single coherent motion scale: 100–140ms for small state changes and 160–220ms for windows and menus. The opening camera move is the deliberate 1.8-second exception, after the 420ms choice acknowledgment; the return to the chooser takes 900ms. A window opens from its launch location with a slight translation and fast settling; it does not fly through the room. Dragging follows the pointer immediately. Interrupted animations continue from their current position. Reduced motion removes spatial travel and any ambient motion.

## 6. The application contract

“Included” means the workflow below works in both editions, with appropriate era-specific presentation. A disabled placeholder does not count. Bundle small accessories together where practical; this list does not require a separate framework or service for each app.

| Classic / modern name | Required working behavior |
| --- | --- |
| Computer / Files | Browse the local workspace; create folders; rename, copy, move, import, export, search, and sort; show file type/size; open associated apps; handle duplicate names and unsupported formats |
| Notepad / Notes | Create and edit plain text; Save, Save As, undo/redo, find, dirty-state protection, draft recovery; reopening reads the saved file |
| MS-DOS-style Console / Terminal | Parse documented commands, keep history, complete paths, report errors, and manipulate the same files as Files; stop/cancel long operations |
| Portfolio / Portfolio | Run the original portfolio directly in React, including Work, About, Services, Contact, project details, existing themes, and CMS-backed content |
| Paint / Sketch | Pencil, eraser, line/rectangle, color selection, undo/redo, clear with recovery, save a drawing, reopen it, and export PNG |
| Media Player / Media | Play supported bundled or imported audio/video; queue, seek, volume, mute, repeat; handle decoding failure; stop outgoing-era playback |
| Image Viewer / Preview | Open an image, zoom, fit, pan, rotate, inspect dimensions, and export when supported; preserve aspect ratio |
| Calculator / Calculator | Keyboard and button arithmetic, decimals, clear/backspace, bounded expression handling, divide-by-zero feedback; never evaluate arbitrary JavaScript |
| Date & Time / Clock | Actual local date/time, calendar navigation, timezone display, and timers with pause/reset; explain notification behavior if the tab is inactive |
| Control Panel / Settings | Functional appearance, screen brightness, scene lighting presets, sound, accessibility, keyboard help, storage/export, and reset settings |
| Task Manager / Activity | Actual app instances and measured application/render timings; close a hung app with draft recovery; unsupported host metrics say unavailable |
| Recycle Bin / Trash | Soft-delete, inspect, restore, handle a restore conflict, and explicitly empty; deletion from here has a clear confirmation |
| Help / Help | Searchable local help, keyboard guide, app capabilities, storage explanation, credits, and a one-action graphics-free portfolio route |

Transmission remains available from the portfolio/Media application, using the existing story content. Imported files are local to the visitor. Editing a note or drawing never publishes it to Saad's CMS.

### Games: two distinct collections

The classic desktop exposes **Games** as a shortcut and Start-menu application. The modern app rail exposes **Play**. Both launch an immediately playable library, not external embeds or installation screens. The terminal command `open games` opens the current edition's collection.

| Rowan 98 | Core interaction | Rowan 2026 | Core interaction |
| --- | --- | --- | --- |
| Minesweeper | Safe first reveal, numbered flood-fill, ten mines, flags, win/loss | Orbit | Time a tap/Space press as a moving point enters a shrinking arc |
| Snake | Grid movement, growth, apples, wall/body collisions, pause | Merge | 4×4 tile merging toward 2048, arrows/swipe/buttons, one-step undo |
| Breakout | Paddle, 32 destructible bricks, three lives, serve/pause | Lights | Solvable 5×5 neighboring-light puzzle |
| Pong | Player versus computer, first to seven, serve/pause | Sequence | Watch and repeat a growing nine-pad sequence |
| Memory | Twelve shuffled cards, six pairs, turn count | Constellation | Trace all nine connections in one trail; no repeated edges; undo |
| Fifteen | Solvable sliding-number puzzle and move count | Chromatic | Find the lighter tile as the grid and difficulty grow; three chances |

Give every game instructions, keyboard or native-button operation, touch controls, an observable outcome, All games, and New game. Realtime games and playback pause when their window is inactive, minimized, powered off, or the tab is hidden. Opening another app must not let a hidden Snake run into a wall. Game rounds are session state and restart when closed or when changing editions; files and saved window layouts remain intact. There is no scoreboard backend or autoplay sound.

Classic games use square controls, beveled boards, pixel art, Tahoma and restrained arcade colors. Modern games use mineral paper, moss, clay and quiet indigo with geometric artwork and mixed typography. Do not simply reskin the same six games.

### Command line behavior

Show `C:\HOME>` in Rowan 98 and `visitor@rowan:~$` in Rowan. Both map to one canonical workspace; path presentation is not a second filesystem. Commands return useful text, deterministic exit status, and real changes visible in Files.

| Purpose | Classic command | Modern command |
| --- | --- | --- |
| Help / version | `help`, `ver` | `help`, `about` |
| List / change directory | `dir`, `cd` | `ls`, `cd`, `pwd` |
| Read / write text | `type`, `echo` | `cat`, `echo` |
| Create directory | `mkdir` | `mkdir` |
| Copy / move / rename | `copy`, `move`, `ren` | `cp`, `mv` |
| Move file to Trash | `del` | `rm` |
| Clear / history | `cls`, `history` | `clear`, `history` |
| Open an app or file | `open` | `open` |
| Date / clock | `date`, `time` | `date`, `time` |
| Display / era | `brightness`, `era` | `brightness`, `era` |

Support quoted filenames and documented `echo text > file.txt` writes, with overwrite handling. An unknown command produces an actual error and a help hint. Do not silently add an unsupported full POSIX shell. Browser and platform limits are explained in Help rather than disguised as successful commands.

## 7. A real desktop's small behaviors

Window movement, edge resizing, minimize/restore, maximize, snap, z-order, app switching, context menus, file drag/drop, selection, and keyboard focus are core behavior. Keep at least one caption/control area reachable after resizing the viewport. Taskbar/rail actions must restore minimized windows.

- Display an unsaved marker only when a document actually differs from its saved revision. Failed saves do not clear it.
- Close on an unsaved document offers Save, Discard, Cancel. Cancel restores exactly the same editor and selection.
- Reopen session state after a refresh without duplicating windows. Save document data independently of window placement.
- Browser Back/Forward follows navigational locations, not every drag or focus change. Deep links open the correct app and object.
- Opening a context menu near a corner flips its placement into view. Submenus and tooltips stay inside the usable aperture.
- Text remains selectable; copy/paste uses the browser's permitted clipboard path and has a fallback. Dragging does not accidentally select the whole desktop.
- Clock format and dates follow locale. Long names, empty folders, multiline errors, and 200% zoom are supported content, not bugs to hide with clipping.
- Power-off stops screen emission and media but leaves room reflections on the unlit glass. Restart reboots the edition without deleting documents. A lock screen is a presentation/privacy curtain unless actual authentication is implemented; never advertise it as host security.
- Idle may start an era-appropriate screensaver after a configurable delay. Pause it for editing, media, dialogs, or assistive interaction; any normal input dismisses it without triggering an unwanted app action.

## 8. Lighting, reflection, and realism

The screen is a spatial light source. The room is a separate illumination system. Glass reflection, metal reflection, diffuse color spill, ambient occlusion, and bloom are different effects and need different implementations. The engineering contract defines the pipeline and its approximations.

### Lighting art direction

- Default environment: a dim neutral studio, soft warm key above-left, weaker cool fill, and readable dark material. Show enough illumination to recognize an unpowered monitor.
- Keep exposure stable while dragging windows. Bright content should change local screen spill, not make the whole scene repeatedly auto-expose.
- Provide **Studio**, **Evening**, and **Screen only** presets in Display & lighting, plus screen brightness. Screen only removes intentional studio key/fill; a black powered-off display can be nearly invisible there, so host controls remain accessible.
- A bright window near the top contributes more to the top inner rim than the lower rim. A small bright window should not light the whole chassis as much as a full white screen.
- The CRT's broad plastic lip shows soft colored falloff; the SA-02 chamfer shows a narrower highlight. Glass reflections strengthen at grazing angles while central text remains readable.
- Shadows and contact darkness follow recess geometry. Screen light does not pass straight through the casing or illuminate the back face.
- Screen brightness changes both the visible picture and emission contribution through the same calibrated transfer. Turning the screen off zeros its contribution, not the entire material lighting.

### Material starting ranges

All values below are initial physically based rendering parameters, to be calibrated against reference captures rather than treated as universal measurements.

| Material | Roughness | Metalness | Detail |
| --- | --- | --- | --- |
| Charcoal molded shell | 0.60–0.78 | 0 | Fine authored normal/roughness variation |
| Rubber inner gasket | 0.80–0.95 | 0 | Deep contact shading |
| CRT glass | 0.07–0.16 | 0 | IOR around 1.5; thicker curved optical profile |
| Modern coated glass | 0.10–0.22 | 0 | Lower reflection strength; flat optical profile |
| Exposed metal chamfer | 0.22–0.38 | 0.9–1.0 | Narrow grazing highlight |
| Coated graphite metal body | 0.35–0.55 | Calibrate coating/substrate | Directional finish; not mirror chrome |

Add restrained manufacturing details: a tiny etched model identifier, believable seam depth, a soft LED light well, a clean glass edge, and a brief disk indicator tied to actual file operations. Dust and wear must be localized authored material detail, never a full-screen procedural dirt layer over the work.

Do not call a preset color gradient “screen reflection.” The release evidence must show the response changing with content, location, brightness, and power.

## 9. Responsive and accessible behavior

| Available CSS viewport | Desktop behavior |
| --- | --- |
| Wide, at least 1100px | Overlapping windows, modern joined pairs, full rail/taskbar, full hardware treatment |
| 700–1099px | Fewer exposed windows, collapsible rail labels, menus that fit, snap only when app minimum sizes fit |
| Below 700px | One active app fills the aperture; a reachable app switcher restores others; no microscopic scaled desktop |
| Short landscape | Compact captions/status, prioritize application content, hide nonessential hardware legends before controls |

The monitor keeps its identity on phones, but neither OS requires mouse-only gestures. Touch equivalents exist for right-click, pair/arrange, rename, and window controls. Pinch/browser zoom is not disabled. At 200% zoom, switch layout if necessary instead of letting the workplane escape the glass.

The opening scene must fit both setup silhouettes and the chooser in a phone viewport. Simplify desk detail and adjust framing rather than presenting tiny interactive desktop text as the choice UI. Keep vintage/modern ordering and readable 44px choice targets. Recalculate the camera endpoint from the actual aperture after resize/orientation change; never replay a desktop-sized camera path on a phone.

Semantic DOM owns text, forms, menus, and focus. Decorative graphics are aria-hidden and pointer-transparent. Modal dialogs alone trap focus; nonmodal app windows do not all announce themselves as modal. The app switcher provides a keyboard route to every window. Screen-reader notifications announce real errors and results, not animation frames or constant clock ticks.

Maintain WCAG AA contrast for text and meaningful controls after optical effects. Normal text targets 4.5:1 and meaningful controls/focus 3:1. Use labels and shape as well as color. Plain mode removes optical interference; reduced motion removes travel, flicker, random tracking, and ambient camera motion. Forced colors retains functional controls.

## 10. Production completeness

This is a production release target. Implementation stages are dependency order, not permission to ship unfinished apps. The final release must pass [the release gates](docs/OS_ENGINEERING.md#release-gates).

Completion requires:

1. Two deliberately different desktops and physical monitor treatments, the sketched two-computer opening scene and OS-choice popup, and the seamless camera approach into one full-screen live desktop.
2. All application workflows in section 6 working, including persistence, recovery, errors, and keyboard access.
3. Causal lighting on the actual 3D hardware, with documented fallbacks and the content/location/power tests passing.
4. A preserved, reachable original portfolio and working project/admin routes.
5. Responsive behavior, graphics failure recovery, tested local storage failure handling, and measured performance on named devices.
6. Original/appropriately licensed icons, fonts, models, textures, audio, and wallpapers with provenance records.
7. Recorded desktop/mobile captures, representative task recordings, and visual review against this brief using the functional loaded states, not only an empty desktop.

The design's ambition is carried by the quality of the objects, the joined-window interaction, the contrast between eras, and accurate feedback. Do not pad it with fake futuristic telemetry, mandatory AI chat, subscription flows, an app store, or extra visual modes.
