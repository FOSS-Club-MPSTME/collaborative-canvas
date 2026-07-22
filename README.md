<div align="center">

# 🎨 Live Collaborative Pixel Canvas
### *FOSS Induction Event Interactive Booth Installation*

[![Node.js](https://img.shields.io/badge/Node.js-v24+-22c55e?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-38bdf8?style=for-the-badge&logo=react)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-v4-94a3b8?style=for-the-badge&logo=express)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-a855f7?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Vite](https://img.shields.io/badge/Vite-v8-f59e0b?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/Status-Event_Ready-22c55e?style=for-the-badge)]()

*A live offline installation where booth visitors take turns on two tablets to color individual sections of famous paintings. As frames complete, the full master artwork assembles in real time on big-screen displays.*

---

</div>

## 🌟 The FOSS Collaboration Metaphor

This installation serves as a tangible, hands-on metaphor for **Open-Source Software Collaboration**:

> **"Individual contributions — each owned, created, and credited by name — combine together into one shared, meaningful master artifact."**

Six participants (three per tablet) each color one frame of a famous painting using a touch-drag grid with faint guide outlines. As all six frames lock in, the full artwork completes with a celebratory display moment, and the next painting in the daily sequence automatically activates!

---

## ✨ Features

- 📱 **Dual Tablet Interleaved Allocation**:
  - **Tablet A**: Frames 1, 3, 5
  - **Tablet B**: Frames 2, 4, 6
  - Image fills in a scattered, dynamic pattern rather than half-by-half.
- 🖌️ **24×24 Touch-Drag Drawing Engine**:
  - 576 pixels per frame (3,456 total pixels per 48×72 master painting).
  - Smooth touch and mouse drag gesture painting without page scroll interference.
  - 12 curated master color swatches with active selection glow.
  - Faint background guide overlays derived from original artwork.
- 👤 **Notion-Style Avatars**:
  - Participant name entry with deterministic avatar generation.
  - Preset Notion avatar gallery picker (*Artist, Coder, Hacker, Designer, Dreamer, Thinker, Creator, Explorer*).
- 🖥️ **Display 1 — Live Canvas Screen (`/display/canvas`)**:
  - Assembles all 6 frames in real time on projectors/TVs.
  - Progress bar with completion percentage counter.
  - Celebratory completion animation upon 100% frame locking before advancing sequence.
- 👥 **Display 2 — Current Drawers Screen (`/display/drawers`)**:
  - Live participant roster cards showing who is actively drawing right now.
  - Displays participant name, Notion avatar, assigned frame #, and tablet state.
- ⚙️ **Staff Admin Panel (`/admin`)**:
  - Passcode-gated (`1234` default) emergency booth controls.
  - Per-frame and whole-painting reset capabilities.
  - Manual active painting override and drag-and-drop daily queue sequence manager.
- 📷 **Sharp Preprocessing Pipeline**:
  - Reads real JPG/PNG images from `assets/source_paintings/`.
  - Automatically downsamples and quantizes source artwork into 48×72 color matrices.

---

## 🏗️ System Architecture

```text
                          ┌──────────────────────────┐
                          │       Local Server       │
                          │   (Laptop / Mini-PC)     │
                          │                          │
                          │  Express API + Static    │
                          │  React Build + SQLite    │
                          └────────────┬─────────────┘
                                       │
                        Local Network / Hotspot (LAN Only)
                                       │
        ┌───────────────┬──────────────┼──────────────┬────────────────┐
        │               │              │              │                │
   ┌─────────┐     ┌─────────┐   ┌────────────┐  ┌────────────────┐ ┌───────┐
   │ Tablet A │     │ Tablet B │   │ Live Canvas │  │ Current Drawers │ │ Admin │
   │ (Draw)  │     │ (Draw)  │   │   Screen   │  │     Screen     │ │ Panel │
   └─────────┘     └─────────┘   └────────────┘  └────────────────┘ └───────┘
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, SQLite (`better-sqlite3`), `sharp` image processing.
- **Frontend**: React 18, React Router, Vite, Vanilla CSS Design System.
- **Offline Network**: Served over local WiFi / Hotspot with zero cloud dependencies.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v24+`
- npm `v10+`

### 1. Installation
```bash
# Clone repository
git clone https://github.com/FOSS-Club-MPSTME/collaborative-canvas.git
cd collaborative-canvas

# Install backend & frontend dependencies
npm install
npm --prefix client install
```

### 2. Preprocess Artwork & Seed Database
```bash
# Preprocesses source paintings in assets/source_paintings/ and seeds SQLite
npm run preprocess
```

### 3. Run in Production / Offline Booth Mode
```bash
# Build React static bundle
npm run build

# Start local server
npm start
```
Access at **`http://localhost:3000`** or **`http://<YOUR-LOCAL-IP>:3000`** on connected devices.

---

## 💻 Development Mode

Run concurrent backend Node server with watch mode & Vite hot-reloading:

```bash
npm run dev
```

- **Vite Frontend**: `http://localhost:5173` (Configured with proxy to port 3000)
- **Express Backend API**: `http://localhost:3000`

---

## 🧪 Running Automated Test Suite

Run end-to-end integration tests covering session starts, interleaved allocation, pixel batch updates, 6-frame lock completion, auto-advancement, and admin endpoints:

```bash
npm test
```

---

## 🔗 Route Map

| Route | Target Device | Purpose |
|---|---|---|
| `/` | Index | Booth Installation Route Selector |
| `/tablet/a` | Tablet A | Onboarding & Drawing View for Tablet A (Frames 1, 3, 5) |
| `/tablet/b` | Tablet B | Onboarding & Drawing View for Tablet B (Frames 2, 4, 6) |
| `/display/canvas` | Display 1 (TV/Projector) | Live Assembling Painting & Progress Bar |
| `/display/drawers` | Display 2 (TV/Monitor) | Active Participant Roster & Notion Avatars |
| `/admin` | Staff Device | Passcode-gated (`1234`) Emergency Controls & Queue Manager |

---

## 📖 Adding Custom Artwork

To add your own high-resolution paintings for the event:

1. Drop your `.jpg` or `.png` images into `assets/source_paintings/`:
   - `starry_night.jpg`
   - `great_wave.jpg`
   - `the_kiss.jpg`
   - `pearl_earring.jpg`
   - `mona_lisa.jpg`
2. Run `npm run preprocess`.
3. `sharp` will downsample the images to 48×72 grids and quantize pixel colors automatically!

---

## 📄 License

Developed for the **FOSS Club Induction Event**. Released under the [ISC License](LICENSE).
