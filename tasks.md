# Task Checklist: Live Collaborative Pixel Canvas

A structured breakdown of development tasks based on [pixel-canvas-prd.md](file:///Users/sachin/Code_Playground/collaborative-canvas/pixel-canvas-prd.md) and [architecture.md](file:///Users/sachin/Code_Playground/collaborative-canvas/architecture.md).

---

## Phase 1: Project Setup & Core Infrastructure

- [x] **1.1 Repository & Environment Setup**
  - Initialize Node.js & Express backend project setup.
  - Setup React frontend (Vite single codebase with route-based views).
  - Configure build scripts for serving built static React files directly via Express for offline deployment.
  - Setup environment configuration (port, local IP binding, admin passcode).

- [x] **1.2 Database Infrastructure (SQLite)**
  - Integrate SQLite driver (`better-sqlite3`).
  - Create database migration/initialization scripts for tables defined in [architecture.md](file:///Users/sachin/Code_Playground/collaborative-canvas/architecture.md#23-sqlite-database):
    - `paintings` (`id`, `name`, `image_path`, `sequence_order`, `status`)
    - `frames` (`id`, `painting_id`, `frame_number`, `guide_data`, `pixel_grid`, `status`, `owner_name`, `owner_avatar`, `locked_at`)
    - `sessions` (`tablet_id`, `current_painting_id`, `current_frame_id`, `participant_name`, `participant_avatar`, `started_at`)

- [x] **1.3 Asset Preprocessing & Seeding Pipeline**
  - Implement a CLI/script to downsample and quantize source artwork into 6 frames of 16×16 pixel grids (256 pixels per frame, 1,536 total per painting).
  - Extract faint guide outlines for each frame.
  - Seed SQLite database with preprocessed paintings and initial sequence order.


---

## Phase 2: Backend REST API

- [x] **2.1 Core Painting & Frame API**
  - `GET /api/active-painting`: Return active painting metadata and current state of all 6 frames.
  - `POST /api/start-frame`: Handle session start for Tablet A/B, allocate next interleaved frame (A: 1, 3, 5 | B: 2, 4, 6), set frame state to `in_progress`, and record user name/avatar.
  - `POST /api/update-pixels-batch`: Handle batched in-progress pixel color sync updates.
  - `POST /api/submit-frame`: Lock frame state, record `locked_at`, clear active session, check if all 6 frames are locked (if complete, mark painting `completed` and auto-advance sequence).

- [x] **2.2 Display Feeds API**
  - `GET /api/painting-state`: Return full pixel grid data for all 6 frames for the Live Canvas Display.
  - `GET /api/active-drawers`: Return active drawer details (tablet ID, participant name, avatar, frame number) for the Current Drawers Display.

- [x] **2.3 Admin API**
  - Auth middleware / passcode verification for admin endpoints.
  - `POST /api/admin/reset-frame`: Reset specific frame to `unclaimed`.
  - `POST /api/admin/reset-painting`: Reset all frames of a painting to `unclaimed`.
  - `POST /api/admin/set-active-painting`: Manually override active painting.
  - `GET /api/admin/sequence` & `POST /api/admin/sequence`: Manage daily painting queue order.

---

## Phase 3: Frontend Shared Components & Routing

- [ ] **3.1 Routing & Layout**
  - Setup React Router with 5 dedicated routes ([architecture.md](file:///Users/sachin/Code_Playground/collaborative-canvas/architecture.md#22-react-frontend-single-codebase-multiple-routes)):
    - `/tablet/a` — Tablet A drawing view
    - `/tablet/b` — Tablet B drawing view
    - `/display/canvas` — Live Canvas Display 1
    - `/display/drawers` — Current Drawers Display 2
    - `/admin` — Admin control panel

- [ ] **3.2 Shared Visual Components**
  - **Pixel Grid Component**: Render 16×16 interactive grid with faint guide overlay support and 16×16px tile rendering.
  - **Color Palette Component**: Curated 8–12 color swatch selector.
  - **Notion-Style Avatar Component**: Avatar gallery selector & deterministic generator based on participant name.

---

## Phase 4: Tablet Interface (`/tablet/a` & `/tablet/b`)

- [ ] **4.1 Participant Onboarding Flow**
  - Name entry screen with touch keyboard support.
  - Notion-style avatar pick / auto-generation preview.
  - "Start Painting" action calling `POST /api/start-frame`.

- [ ] **4.2 Interactive Drawing Interface**
  - Touch-drag & mouse-drag painting interaction across grid tiles without page scroll/zoom interference.
  - Selected color highlighting.
  - Clear frame / Undo action.
  - Client-side batched periodic sync to `POST /api/update-pixels-batch`.

- [ ] **4.3 Submission & Transition**
  - "Submit Frame" lock confirmation action calling `POST /api/submit-frame`.
  - Seamless auto-reset to participant onboarding for the next user.

---

## Phase 5: Display Screens

- [ ] **5.1 Live Canvas Screen (`/display/canvas`)**
  - Assembles all 6 frames into a cohesive full painting view.
  - Polling loop (`/api/painting-state` every 2–3 seconds).
  - Progress bar / completion percentage counter.
  - Celebration banner / animation upon 100% completion before advancing.

- [ ] **5.2 Current Drawers Screen (`/display/drawers`)**
  - Dual card layout for Tablet A & Tablet B.
  - Polling loop (`/api/active-drawers` every 1–2 seconds).
  - Display active drawer's Notion-style avatar, name, and frame number.
  - "Available / Waiting for drawer" state when tablet is idle.

---

## Phase 6: Admin Panel (`/admin`)

- [ ] **6.1 Passcode Protection**
  - Lock screen requiring staff passcode before accessing admin functions.

- [ ] **6.2 Emergency Controls & Queue Management**
  - Single frame reset UI.
  - Entire painting reset UI.
  - Active painting manual override selector.
  - Drag-and-drop / sequence order manager for the day's paintings.

---

## Phase 7: Offline Testing, Polish & Event Readiness

- [ ] **7.1 Offline Local Network Testing**
  - Test multi-device concurrency over local wifi/hotspot without internet connection.
  - Verify touch drag performance on target tablet hardware (zero-lag finger tracking).
  - Verify display scaling for large screens / projectors.

- [ ] **7.2 Deployment & Setup Documentation**
  - Write runbook for booth staff (server startup, static IP assignment, tablet URL setup, admin recovery steps).
