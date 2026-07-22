# Architecture — Live Collaborative Pixel Canvas

Companion to `pixel-canvas-prd-v2.md`. Describes system components, data flow, and how the pieces fit together for local, offline operation.

---

## 1. High-Level Overview

One local server hosts everything. Four types of clients connect to it over local wifi:

- **2 Tablets** (drawing interface — Tablet A, Tablet B)
- **Live Canvas screen** (Display 1 — the assembling painting)
- **Current Drawers screen** (Display 2 — active participants + avatars)
- **Admin panel** (staff device — passcode protected)

```
                          ┌─────────────────────────┐
                          │      Local Server         │
                          │  (laptop / mini-PC)        │
                          │                            │
                          │  Express API + static      │
                          │  React build + SQLite       │
                          └─────────────┬──────────────┘
                                        │
                         Local wifi / hotspot (LAN only)
                                        │
        ┌───────────────┬──────────────┼──────────────┬────────────────┐
        │               │              │              │                │
   ┌─────────┐     ┌─────────┐   ┌────────────┐  ┌────────────────┐ ┌───────┐
   │ Tablet A │     │ Tablet B │   │ Live Canvas │  │ Current Drawers │ │ Admin │
   │  (draw)  │     │  (draw)  │   │   Screen    │  │     Screen      │ │ Panel │
   └─────────┘     └─────────┘   └────────────┘  └────────────────┘ └───────┘
```

No internet connection is used anywhere in this loop. All devices just need to be on the same local network as the server.

---

## 2. Components

### 2.1 Local Server

- **Node.js + Express** — single process, serves both the REST API and the built React static frontend.
- **SQLite** — file-based database on the same machine. No separate DB server, no network hop for data access.
- Runs on a laptop or mini-PC physically at the booth. Its local IP address is what all other devices connect to (e.g. `http://192.168.x.x:PORT`).

### 2.2 React Frontend (single codebase, multiple routes)

One React app, built once, serving different views depending on the route loaded:

| Route | Loaded by | Purpose |
|---|---|---|
| `/tablet/a` | Tablet A | Name entry + frame coloring UI for Tablet A's current session |
| `/tablet/b` | Tablet B | Name entry + frame coloring UI for Tablet B's current session |
| `/display/canvas` | Live Canvas screen | Read-only, assembles and renders the full painting |
| `/display/drawers` | Current Drawers screen | Read-only, shows active drawer name + avatar per tablet |
| `/admin` | Staff device | Passcode-gated controls (reset, sequence management, manual override) |

Keeping this as one codebase with route-based views (rather than separate apps) keeps the build simple and avoids duplicating shared logic like the palette, pixel grid rendering, and avatar rendering.

### 2.3 SQLite Database

Single file, structured per the PRD's data model:

- `paintings` — id, name, image_path, sequence_order, status
- `frames` — id, painting_id, frame_number, guide_data, pixel_grid (JSON blob or normalized pixel rows), status, owner_name, owner_avatar, locked_at
- `sessions` — tablet_id, current_painting_id, current_frame_id, participant_name, participant_avatar, started_at

SQLite is sufficient here — write volume is at most 2 concurrent sessions, and its transactional guarantees are more than enough to avoid state corruption on frame submit / lock.

---

## 3. Data Flow

### 3.1 Starting a turn (Tablet flow)

1. Tablet loads `/tablet/a` (or `/tablet/b`), calls `get-active-painting` to check current state.
2. Person enters name → avatar assigned/selected.
3. Tablet calls `start-frame` with `{ tablet_id, name, avatar }`.
4. Server: finds the next unclaimed frame for that tablet per the interleaved sequence (A: 1,3,5 / B: 2,4,6), marks it `in_progress`, records participant name/avatar and start time, and registers this as an active drawer.
5. Server returns the frame's pixel grid + guide data to the tablet.
6. Tablet renders the 16×16 grid with the faint guide.

### 3.2 During coloring

1. User selects a palette color, drags across the grid.
2. Tablet batches pixel changes locally (to avoid one network call per pixel) and periodically calls `update-pixels-batch` with the changed cells.
3. Server updates the frame's `pixel_grid` in SQLite.
4. (Optional, nice-to-have) Live Canvas screen polling picks up in-progress pixel changes too, so the painting appears to fill in even before a frame locks — otherwise it only updates on submit.

### 3.3 Submitting a frame

1. User taps "Submit."
2. Tablet calls `submit-frame` with the final pixel grid.
3. Server: sets frame status to `locked`, finalizes `locked_at`, clears this tablet's entry from the active drawers list.
4. Server checks: are all 6 frames of the active painting now `locked`?
   - If yes → mark painting `completed`, activate the next painting in `sequence_order`, reset that tablet's next assignment to the new painting's first interleaved frame.
   - If no → assign the tablet its next frame in the interleaved sequence for the same painting.
5. Tablet transitions to the name-entry screen for the next person.

### 3.4 Display screens (polling loop)

- **Live Canvas screen** (`/display/canvas`): polls `get-painting-state` every 2-3 seconds, re-renders the assembled 6-frame grid from returned pixel data, updates completion percentage. Shows a completion animation when painting status flips to `completed`, then transitions to the new active painting on the next poll.
- **Current Drawers screen** (`/display/drawers`): polls `get-active-drawers` every 1-2 seconds, renders a tile per tablet currently in a session (name, avatar, frame number), and an "available" placeholder tile for any idle tablet.

### 3.5 Admin flow

- Staff loads `/admin`, enters passcode.
- Can call `admin-reset-frame`, `admin-reset-painting`, `admin-set-active-painting`, or view/edit the day's `admin-get-sequence` / `admin-update-sequence`.
- These are direct, immediate writes — no special conflict handling needed given it's staff-only and infrequent.

---

## 4. API Surface

| Endpoint | Method | Used by | Purpose |
|---|---|---|---|
| `/api/active-painting` | GET | Tablets, Live Canvas | Current active painting + all frame states |
| `/api/start-frame` | POST | Tablets | Begin a session: assign next frame, record name/avatar |
| `/api/update-pixels-batch` | POST | Tablets | Push batched in-progress pixel changes |
| `/api/submit-frame` | POST | Tablets | Lock frame, finalize, trigger painting-completion check |
| `/api/painting-state` | GET | Live Canvas | Full pixel data for rendering |
| `/api/active-drawers` | GET | Current Drawers screen | Name/avatar/frame per active tablet session |
| `/api/admin/reset-frame` | POST | Admin | Reset one frame to unclaimed |
| `/api/admin/reset-painting` | POST | Admin | Reset a whole painting |
| `/api/admin/set-active-painting` | POST | Admin | Manually override active painting |
| `/api/admin/sequence` | GET/POST | Admin | View/update the day's painting order |

---

## 5. Why This Shape

- **Single server process, single codebase** — minimizes moving parts for a one-day, staff-operated installation with no dedicated ops support during the event.
- **SQLite over anything networked** — no separate DB service to configure or fail; the whole app is one file (server) + one file (database) plus a static frontend bundle.
- **Polling over websockets** — at 2 tablets and 2 displays, a 1-3 second poll interval is visually indistinguishable from push-based realtime, and is far simpler to implement, debug, and keep resilient if a device briefly drops off wifi and reconnects.
- **One React app, route-based views** — avoids duplicating the palette/grid-rendering/avatar logic across separate frontend projects; each route is just a different "mode" of the same shared components.
- **No internet, no cloud** — removes an entire category of failure modes (connectivity drops, latency, hosting cost, security surface) that don't need to exist for a local booth installation.

---

## 6. Setup Notes for the Day

- Preprocess and load all paintings (image → 6 frames → guide data) into SQLite ahead of time via a setup script, in the desired `sequence_order`.
- Confirm all devices (2 tablets, 2 display screens, admin device) are on the same local wifi/hotspot as the server before the event starts.
- Know the server's local IP address ahead of time (or use a fixed/static IP) so each device can be pointed at the right routes without fumbling during setup.
- Have the admin passcode and reset flow tested beforehand — this is the main safety net if something goes wrong mid-event.
