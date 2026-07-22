# Product Requirements Document

## Live Collaborative Pixel Canvas — FOSS Induction Event

**Status:** Draft
**Owner:** Sachin
**Last updated:** 22 July 2026

---

## 1. Overview

A booth installation for the FOSS induction event where visitors take turns on one of two tablets to color a section of a pixelated famous painting. Each painting is divided into 6 frames; six people (three per tablet) each color one frame using a tap-drag interaction and a fixed color palette. As all six frames lock in, the full painting completes on a shared big-screen display, and the next painting in a preset sequence automatically becomes available — allowing many small groups to complete paintings throughout the day. The exercise doubles as a live metaphor for open-source collaboration: individual contributions, each owned and credited, combining into one shared artifact.

This is a fully local, offline installation — no internet, no QR codes, no cloud hosting. Two tablets and a server (e.g. a laptop) connect over local wifi/hotspot only. In addition to the two tablets, the booth has **two dedicated display screens**: a **Live Canvas screen** showing the painting assembling in real time, and a **Current Drawers screen** showing who is actively painting right now, represented with Notion-style avatars.

---

## 2. Goals

- Draw a crowd to the booth with a visually striking, constantly-changing live display, reinforced by a second screen that puts a human face on who's contributing right now.
- Give each of the 6 participants per painting a satisfying, hands-on coloring session (~2-3 minutes).
- Reinforce the FOSS message: individual contributions, credited by name, combine into a shared final artifact.
- Keep the installation fully self-contained, offline, and simple to run and reset throughout the day.
- Cycle through many paintings across the event so a large number of people get to participate, not just six total.

---

## 3. Non-Goals

- Not a networked, multi-location, or internet-connected system — this is a single local installation.
- Not aiming for photo-realistic reproduction — the 6-frame, chunky mosaic aesthetic is intentional and embraced.
- No persistent user accounts — name entry is per-session, for credit purposes only.

---

## 4. User Flow

1. A person sits at one of the two tablets when it's free.
2. They enter their name, and a Notion-style avatar is generated or assigned for them (or they pick one from a small preset set).
3. The **Current Drawers screen** immediately updates to show them as an active drawer on their tablet, with their name and avatar.
4. The tablet displays their assigned frame (one of the 6 in the currently active painting) — a 16×16 grid of pixels (256 total), each 16×16px, with a faint outline/guide of the original artwork visible beneath.
5. They select a color from the fixed palette (8-12 curated swatches) and tap-drag across the frame to paint pixels, switching colors as needed.
6. When satisfied, they tap "Submit," which locks their frame permanently (locked frames cannot be recolored except via admin reset).
7. The tablet immediately loads the next unclaimed frame in the sequence for the next person to sit down and repeat; the Current Drawers screen updates to remove them and show the next person once they begin.
8. The **Live Canvas screen** shows the whole painting live, updating as each frame locks in, along with a completion percentage.
9. Once all 6 frames of the active painting are locked, the painting is marked complete (with a small celebratory moment on the Live Canvas screen), and the next painting in the preset sequence automatically becomes active for both tablets.

---

## 5. Functional Requirements

### 5.1 Painting Management

- Paintings are preprocessed ahead of the event: each source image is downsampled/quantized and split into exactly 6 frames, each frame further divided into a 16×16 grid of pixels (256 pixels per frame, 1,536 pixels total per painting).
- Source images should be bold, high-contrast, iconic famous paintings (e.g. *Starry Night*, *The Great Wave*, *The Kiss*) — chosen and processed carefully so their dominant shapes read clearly at this low resolution. Preprocessing should preserve or emphasize dominant shapes and color blocks rather than being a naive resize.
- A preset, ordered sequence of paintings is loaded ahead of time by staff for the day.
- Only one painting is "active" at a time; others are "upcoming" or "completed."
- When the active painting's last frame locks, it moves to "completed" and the next painting in sequence auto-activates.

### 5.2 Frame Allocation

- Each painting has exactly 6 frames, allocated across the 2 tablets in **interleaved order** so the image fills in a scattered rather than half-by-half pattern:
  - Tablet A: frames 1, 3, 5
  - Tablet B: frames 2, 4, 6
- When a tablet finishes a frame (submitted and locked), it automatically advances to its next frame in the sequence above.
- No allocation race conditions are expected given only 2 tablets are ever active at once, but frame state changes should still be handled safely (no double-submission of the same frame).

### 5.3 Coloring Interaction

- Each frame is rendered as a 16×16 grid of individually tappable pixels (256 total), each 16×16px on screen.
- A faint outline/guide derived from the original source image is visible beneath each pixel, so the shape stays recognizable even though color choice is free within the palette.
- Fixed palette of 8-12 curated colors, selectable at the side or bottom of the screen.
- **Tap-drag painting**: touching and dragging across the grid paints every pixel the finger passes over with the currently selected color — not limited to single-tap-per-pixel.
- A "clear my frame" / undo option should be available, since drag-painting makes accidental fills easy.
- A "Submit" action locks the frame: no further edits possible except via admin reset.

### 5.4 Name Entry & Avatars

- Each person enters their name before starting their frame.
- Each person is given a **Notion-style avatar** — either auto-generated (e.g. a deterministic geometric/emoji-style avatar derived from their name, similar to Notion's default avatar look) or chosen by the participant from a small preset gallery of Notion-style avatar options.
- Names and avatars are stored against their completed frame and painting, so historical contributor data persists even after they finish.

### 5.5 Locking & Admin Controls

- Locked frames cannot be recolored by participants.
- An admin view (local access, simple passcode) allows staff to:
  - Reset an individual frame back to unclaimed (e.g. to fix a mistake or handle abuse).
  - Reset an entire painting.
  - Manually override which painting is currently active, if needed.
  - View/manage the preset painting sequence for the day.

### 5.6 Live Canvas Screen (Display 1)

- A dedicated, read-only display (projector or TV) renders the full current painting at large scale by assembling all 6 frames, reflecting locked colors and faint guides for unlocked/in-progress frames.
- Auto-refreshes periodically (polling is sufficient at this scale) to reflect newly locked frames and in-progress pixel changes.
- Displays a completion percentage for the active painting.
- Optional: a small celebratory animation/banner when a painting reaches 100% completion, before transitioning to the next painting.
- This screen is purely about the artwork — no names or avatars here, keeping it visually clean.

### 5.7 Current Drawers Screen (Display 2)

- A second dedicated display showing **who is actively drawing right now**, one card/tile per tablet currently in use.
- Each active drawer's tile shows their **name** and their **Notion-style avatar**, plus which frame number they're working on.
- Updates in real time (or near-real-time via polling) as people start and submit frames — a tile appears when someone starts a frame on a tablet, and is replaced by the next person once the previous one submits.
- When a tablet is idle (between participants), its tile can show an "available" or "waiting for next drawer" state.
- This screen puts a human, social face on the installation — good for the recruiting/community angle, since passersby see real people actively contributing, not just an abstract progress bar.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Tap-drag painting must feel responsive and smooth on tablet hardware, with no noticeable lag between finger movement and pixel fill. |
| Concurrency | Must correctly handle the two tablets operating simultaneously and independently without state conflicts, even though true race conditions are unlikely at this scale. |
| Offline reliability | Must run fully offline on local wifi/hotspot with no dependency on internet connectivity. |
| Simplicity of ops | Staff must be able to reset frames/paintings and manage the day's painting sequence without specialist technical support. |
| Device support | Tablet UI must support touch drag gestures smoothly; both display screens should scale cleanly to large display/projector/TV resolutions. |
| Cost | Zero ongoing hosting cost — entirely local hardware (existing tablets + a laptop/mini-PC as local server). |

---

## 7. System Design

### 7.1 Data Model (conceptual)

- **Painting**: id, name, image_path, sequence_order, status (upcoming / active / completed).
- **Frame**: id, painting_id, frame_number (1-6), guide/outline reference data, pixel_grid (16×16 array of color values, null until painted), status (unclaimed / in_progress / locked), owner_name, owner_avatar, locked_at.
- **Session** (lightweight, per tablet): tablet_id (A or B), current_painting_id, current_frame_id, participant_name, participant_avatar, started_at.
- **ActiveDrawers** (derived/live state, not necessarily its own table): for each tablet currently in an active session, the participant name, avatar, and frame number — this is what the Current Drawers screen polls/reads.

### 7.2 Core Interactions / Endpoints (conceptual)

- `get-active-painting` — returns which painting is currently active, including all 6 frames' current state (for both tablets and the Live Canvas screen).
- `start-frame` — records a participant's name and avatar, marks their assigned frame as in_progress, and registers them as an active drawer.
- `update-pixel` / `update-pixels-batch` — records pixel color changes as the user tap-drags (can be batched for performance rather than one call per pixel).
- `submit-frame` — locks the frame, finalizes pixel data and owner name/avatar, and clears that tablet from the active drawers list.
- `get-painting-state` — full current grid/frame state for the Live Canvas screen.
- `get-active-drawers` — returns the current name, avatar, and frame number for each tablet with an active session, for the Current Drawers screen.
- `admin-reset-frame` / `admin-reset-painting` — staff-only, resets state.
- `admin-set-active-painting` — staff-only, manual override of active painting.
- `admin-get-sequence` / `admin-update-sequence` — manage the day's preset painting order.

---

## 8. Hosting & Infrastructure (Local Stack)

Given the shift to a fully offline, tablet-based installation, no cloud hosting or QR-based access is needed.

- **Stack**: Express (Node.js) backend + React frontend, no MongoDB — a lightweight local datastore is sufficient given the very small scale (2 tablets, no concurrent-write pressure at any real volume).
- **Data storage**: SQLite (file-based), providing simple structured storage and safe transactional writes for frame/pixel updates without the overhead of a full database server.
- **Server**: runs locally (e.g. on a laptop or mini-PC at the booth), serving both the API and the built React app as static files.
- **Tablets**: connect to the local server over the same wifi network/hotspot — each tablet loads its respective coloring interface (Tablet A / Tablet B) from the server's local IP address.
- **Two display screens**: separate browser windows (on connected laptops/TVs/projectors) — one pointed at the Live Canvas route, the other at the Current Drawers route — both served from the same local server.
- **No internet dependency, no cloud costs, no external services required.**

---

## 9. Open Questions / Inputs Needed

- Final list and order of paintings to preprocess for the day's sequence.
- Final curated palette colors (ideally tuned per painting for visual cohesion).
- Confirm hardware for the local server (laptop vs. mini-PC) and expected wifi/hotspot setup at the venue.
- Any branding elements to include on the tablet UI or either display screen.
- Should avatars be auto-generated deterministically from the participant's name, or chosen by the participant from a preset gallery of Notion-style avatar options?

---

## 10. Success Metrics

- Number of paintings fully completed over the course of the event.
- Total number of unique participants across both tablets.
- Qualitative: crowd gathering around the Live Canvas screen; people pointing out friends/names on the Current Drawers screen; visible excitement as paintings near completion; conversations sparked about the FOSS "many small contributions" theme.
