# Saad Akhtar — Creative Developer & Design Engineer Portfolio

<div align="center">

![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.185.1-000000?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.15.0-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<p align="center">
  <b>A modern, high-performance portfolio exploring the intersection of AI research, scalable engineering, and interactive design.</b>
</p>

</div>

---

## 🌟 Overview

This project is the personal creative development portfolio of **Saad Akhtar**, an AI Undergraduate and Full-Stack Developer based in Lahore, Pakistan.

Engineered from the ground up using **React 19**, **Three.js**, **GSAP (GreenSock)**, and **Lenis smooth scrolling**, the website features an editorial typographic design system, dark/light theme responsiveness, 3D interactive graphics, and embedded lo-fi music streaming.

---

## ✨ Key Features

- 🎭 **Hero Parallax & Cursor Spotlight**: Multi-layered mouse-reactive spotlight with floating monospace particle fields and editorial typography.
- 📜 **Narrative Scroll Transition**: GSAP `ScrollTrigger` pinned camera zoom transition that bridges AI research and engineering copy seamlessly.
- 🌐 **3D Skills Globe**: Interactive Three.js particle sphere with HTML/CSS labels rendered via `CSS2DRenderer`, dynamically responding to theme color variables (`data-theme`).
- 🎵 **Interactive Vinyl Music Player**: Slide-out music drawer with spinning vinyl animations, live audio scrubber, volume controls, and bundled lo-fi / late-night tracks.
- 📱 **Fully Responsive**: Mobile-first touch interactions and layouts tailored for phones, tablets, and ultra-wide desktop monitors.
- 🌓 **Dynamic Theme Engine**: Seamless dark and light modes powered by CSS custom properties with zero layout shift.
- 🧈 **Inertial Smooth Scrolling**: Powered by `lenis` for 60fps momentum scrolling across all devices.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | React 19, Vite |
| **Styling** | Vanilla CSS3 (Custom Design System, CSS Variables, Glassmorphism) |
| **Animation & Motion** | GSAP (ScrollTrigger, Timeline), Lenis Smooth Scroll |
| **3D & Canvas** | Three.js (WebGLRenderer, CSS2DRenderer, Particle Geometries) |
| **Icons & Assets** | Lucide React, Custom Vector Graphics, CC0 Lo-Fi Audio |
| **Linter & Tooling** | Oxlint, Vite Build Engine |

---

## 📁 Project Structure

```text
saad-portfolio/
├── public/
│   ├── audio/                  # Bundled CC0 royalty-free audio tracks
│   │   ├── 2-am-debug-loop.mp3
│   │   ├── electric-puddles.mp3
│   │   ├── fire.mp3
│   │   ├── midnight-window-glow.mp3
│   │   └── rain.mp3
│   ├── favicon.svg             # Vector site icon
│   └── icons.svg               # SVG sprite definitions
├── src/
│   ├── components/
│   │   ├── About.jsx & .css
│   │   ├── Contact.jsx & .css
│   │   ├── DottedText.jsx & .css
│   │   ├── Hero.jsx & .css     # Parallax Hero section
│   │   ├── MusicPlayer.jsx & .css # Vinyl player widget
│   │   ├── Nav.jsx & .css      # Header navigation & theme toggle
│   │   ├── Preloader.jsx & .css
│   │   ├── Projects.jsx & .css
│   │   ├── PunchlineTransition.jsx & .css # Pinned scroll section
│   │   └── SkillsGlobe.jsx & .css # 3D Three.js interactive sphere
│   ├── App.jsx                 # Application entry & Lenis setup
│   ├── index.css               # Global theme tokens, typography & reset
│   └── main.jsx                # React root mount
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saaddahub/personal-portfolio.git
   cd personal-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## 🔒 Privacy Policy & Data Collection

We respect privacy and adhere to modern ethical web standards:

1. **No Cookies**: This website does **not** use tracking cookies, advertising cookies, or third-party marketing beacons.
2. **No Data Tracking / Analytics**: No user tracking, Google Analytics, fingerprinting, or telemetry scripts are embedded.
3. **Client-Side Storage**: The website only stores UI preferences (such as dark/light theme mode) locally within the user's browser session.
4. **Third-Party Requests**: All fonts, styles, and audio assets are hosted locally on the same origin to prevent third-party logging of visitor IP addresses.

---

## 🎓 Educational & Demonstration Disclaimer

> [!NOTE]
> **This project and codebase are developed strictly for educational, academic, portfolio demonstration, and personal learning purposes.**
>
> All intellectual properties, experimental UI patterns, and audio assets are shared in good faith under open licenses (MIT / CC0 1.0 Public Domain). No commercial warranty is provided.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and learn from this codebase.

---

<div align="center">
  <sub>Crafted with ❤️ by Saad Akhtar.</sub>
</div>
