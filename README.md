# Saad Akhtar — Creative Developer & Design Engineer Portfolio

<div align="center">

![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.185.1-000000?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.15.0-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<p align="center">
  <b>A modern, high-performance personal portfolio exploring the intersection of AI research, scalable software engineering, and interactive digital design.</b>
</p>

[✨ Live Demo](https://github.com/saaddahub/personal-portfolio) • [🎬 Netflix Visualizer Live](https://netflix-analysis-pandas.streamlit.app) • [📫 Get in Touch](#-contact--connect)

</div>

---

## 🌟 Overview

Welcome to the open-source repository for the personal portfolio of **Saad Akhtar**, an AI Undergraduate and Full-Stack Developer based in Lahore, Pakistan. 

This website is engineered from scratch without bulky CSS frameworks, utilizing a tailored **Vanilla CSS Design System**, **React 19**, **Three.js** 3D WebGL rendering, **GSAP 3** timeline scrub animations, and **Lenis** 60fps momentum scrolling. It also features a fully interactive side-docked vinyl music player bundled with royalty-free lo-fi beats.

---

## ✨ Key Features & Architectural Highlights

### 1. 🎭 Parallax Hero with Cursor Spotlight
- **Interactive Lighting:** Custom smooth Lerp cursor spotlight with blend-mode lighting over deep dark space backgrounds.
- **Monospace Code Particles:** Floating CSS tokens, code symbols, and subtle background drift animations.
- **Editorial Typography:** High-contrast pairing of modern sans-serif typography with italic serif accents.

### 2. 📜 Narrative GSAP Scroll Pinning Transition
- **Smooth Pinned Sequence:** Uses GSAP `ScrollTrigger` to pin the narrative punchline section, dynamically zooming out and dissolving introductory copy while sliding in core capability statements without layout jumps.

### 3. 🌐 3D Interactive Skills Globe (Three.js)
- **Hybrid 3D Rendering:** Renders a 3D particle sphere using `THREE.Points` combined with HTML label tags positioned via `THREE.CSS2DRenderer`.
- **Dynamic Theme Synchronization:** Employs a `MutationObserver` on `document.documentElement` to reactively recolor the particle shell when switching between Dark and Light modes.

### 4. 💿 Uiverse Vinyl Lo-Fi Music Player
- **Interactive Vinyl Drawer:** Slide-out drawer with a spinning nebula vinyl record that responds to hover and audio playback states.
- **Audio Engine:** Complete HTML5 Audio API controls including play/pause, next/previous track, live scrubber with time stamps, volume control, mute toggle, and shuffle mode.
- **Self-Hosted Lo-Fi Tracks:** Bundled local audio files with zero buffering and no third-party CORS issues.

### 5. 💼 Curated Work & Project Showcase
- **Netflix Data Visualizer:** Features a live interactive exploratory data analytics app analyzing global Netflix content trends ([netflix-analysis-pandas.streamlit.app](https://netflix-analysis-pandas.streamlit.app)).
- **System & AI Projects:** Highlights OOP-driven C++ hotel management systems, MySQL relational database architectures, and generative AI interview simulations.

### 6. 📱 Mobile-First Touch Optimization
- Responsive layouts with adaptive touch targets, drawer positioning, and auto-expanding controls on touchscreens.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.2.8** | Modern component-driven UI architecture |
| **Build Tooling** | **Vite 8.2.0** | Next-generation lightning-fast HMR and bundling |
| **Styling & Design System** | **Vanilla CSS3** | Custom tokens, CSS variables, glassmorphism, zero Tailwind dependency |
| **Motion & Scroll** | **GSAP 3.15.0** + **Lenis 1.3.26** | Smooth inertial momentum scrolling & timeline scroll triggers |
| **3D Graphics** | **Three.js 0.185.1** | WebGL canvas, particle geometries, CSS2DRenderer |
| **Icons & Media** | **Lucide React** + **Custom SVG** | Vector graphics, icons, and bundled CC0 audio |
| **Code Quality** | **Oxlint** | High-performance Rust-based JavaScript linter |

---

## 🎵 Bundled Soundtrack ("Rizz Playlist")

The built-in vinyl player features curated, royalty-free lo-fi and ambient tracks stored in `public/audio/`:

| Track # | Title | Vibe / Style | Source License |
| :---: | :--- | :--- | :--- |
| **01** | *Unspoken Rizz* | Smooth R&B / Chillhop | CC0 1.0 Public Domain |
| **02** | *W Rizz (After Hours)* | Neo Soul / Slow Jam | CC0 1.0 Public Domain |
| **03** | *Eye Contact at 2 AM* | Silk & Velvet / Bedroom Lo-Fi | CC0 1.0 Public Domain |
| **04** | *Flirting with Clean Code* | Design Engineer / Smooth Beats | CC0 1.0 Public Domain |
| **05** | *Late Night Chemistry* | Cozy Fireplace / Ambient Chill | CC0 1.0 Public Domain |
| **06** | *Rainy Window Romance* | Rain on Glass / Romantic Lo-Fi | CC0 1.0 Public Domain |

---

## 📁 Repository Directory Structure

```text
saad-portfolio/
├── public/
│   ├── _redirects              # Netlify SPA routing rules
│   ├── audio/                  # Bundled CC0 royalty-free audio tracks
│   │   ├── 2-am-debug-loop.mp3
│   │   ├── electric-puddles.mp3
│   │   ├── fire.mp3
│   │   ├── midnight-window-glow.mp3
│   │   ├── rain.mp3
│   │   └── rooftop-static-dreams.mp3
│   ├── images/                 # Project screenshots & showcases
│   │   └── netflix-visualiser.png
│   ├── favicon.svg             # Vector site favicon
│   └── icons.svg               # SVG icons sprite
├── src/
│   ├── assets/                 # Static graphical assets
│   ├── components/
│   │   ├── About.jsx & .css
│   │   ├── Contact.jsx & .css
│   │   ├── DottedText.jsx & .css
│   │   ├── Hero.jsx & .css     # Parallax spotlight & hero copy
│   │   ├── MusicPlayer.jsx & .css # Vinyl player drawer & audio engine
│   │   ├── Nav.jsx & .css      # Dynamic header & theme switch
│   │   ├── Preloader.jsx & .css
│   │   ├── Projects.jsx & .css # Horizontal work rail & preview cards
│   │   ├── PunchlineTransition.jsx & .css # GSAP pinned scroll transition
│   │   └── SkillsGlobe.jsx & .css # Three.js 3D skills sphere
│   ├── App.jsx                 # Main layout & Lenis momentum scroll
│   ├── index.css               # Global theme tokens, typography, CSS reset
│   └── main.jsx                # React DOM entry point
├── vercel.json                 # Vercel deployment & rewrite configuration
├── package.json
├── vite.config.js
├── LICENSE                     # MIT License
└── README.md
```

---

## 🚀 Local Development & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saaddahub/personal-portfolio.git
   cd personal-portfolio
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   *Your portfolio will be running at [http://localhost:5173](http://localhost:5173)*

4. **Build for production:**
   ```bash
   npm run build
   ```
   *Generates minified, optimized production bundle inside `/dist`.*

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## 🌐 1-Click Deployment Guide

This project is pre-configured for instant zero-configuration deployment on all major static hosting platforms.

### 🔺 Deploying to Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Import the `personal-portfolio` repository.
4. Leave settings as default (Framework Preset: **Vite**, Root: `./`, Output: `dist`).
5. Click **"Deploy"**. *(Pre-configured `vercel.json` ensures zero 404 routing errors).*

### 🌐 Deploying to Netlify
1. Go to [netlify.com](https://www.netlify.com) and sign in.
2. Click **"Add new site"** → **"Import an existing project"** and select GitHub.
3. Choose `personal-portfolio` and click **"Deploy"**. *(Pre-configured `public/_redirects` ensures SPA routing).*

---

## 🔒 Privacy Policy & Data Collection

We are committed to modern ethical web standards and visitor privacy:

1. **🍪 Zero Cookies**: This website does **not** set or use tracking cookies, marketing cookies, or third-party advertising identifiers.
2. **🚫 Zero Analytics & Telemetry**: No user tracking, Google Analytics, telemetry scripts, or device fingerprinting are installed.
3. **💾 Client-Side Storage**: The user's visual theme choice (dark mode / light mode) is managed purely via client-side state without external data transmission.
4. **🔒 Self-Hosted Assets**: All web fonts, styles, scripts, and audio assets are hosted directly from the same origin to protect visitor IP privacy.

---

## 🎓 Educational & Demonstration Disclaimer

> [!NOTE]
> **This project and codebase are created strictly for educational, academic demonstration, and personal portfolio showcase purposes.**
>
> All project case studies, exploratory datasets (such as the Netflix exploratory data visualization project), UI experiments, and media files are shared in good faith under open licenses (MIT / CC0 1.0 Universal Public Domain). No commercial warranty is expressed or implied.

---

## 📬 Contact & Connect

- **Developer:** Saad Akhtar
- **Location:** Lahore, Pakistan
- **GitHub:** [@saaddahub](https://github.com/saaddahub)
- **Netflix Visualizer Live App:** [netflix-analysis-pandas.streamlit.app](https://netflix-analysis-pandas.streamlit.app)

---

## 📄 License

This repository is licensed under the open-source [MIT License](LICENSE). You are free to explore, learn from, and adapt the code for your own educational projects.

<div align="center">
  <sub>Designed & Developed with ❤️ by <b>Saad Akhtar</b>.</sub>
</div>
