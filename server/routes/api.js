const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Helper: Parse frame JSON fields for API output
 */
function formatFrame(frame) {
  if (!frame) return null;
  return {
    ...frame,
    guide_data: frame.guide_data ? JSON.parse(frame.guide_data) : null,
    pixel_grid: frame.pixel_grid ? JSON.parse(frame.pixel_grid) : null
  };
}

/**
 * Helper: Ensure an active painting exists
 */
function getOrActivatePainting() {
  let active = db.prepare("SELECT * FROM paintings WHERE status = 'active' ORDER BY sequence_order ASC LIMIT 1").get();
  if (!active) {
    const upcoming = db.prepare("SELECT * FROM paintings WHERE status = 'upcoming' ORDER BY sequence_order ASC LIMIT 1").get();
    if (upcoming) {
      db.prepare("UPDATE paintings SET status = 'active' WHERE id = ?").run(upcoming.id);
      active = db.prepare("SELECT * FROM paintings WHERE id = ?").get(upcoming.id);
    }
  }
  return active;
}

/**
 * GET /api/active-painting
 * Current active painting + all 6 frame states
 */
router.get('/active-painting', (req, res) => {
  try {
    const painting = getOrActivatePainting();
    if (!painting) {
      return res.status(404).json({ error: 'No active or upcoming paintings found.' });
    }

    const rawFrames = db.prepare('SELECT * FROM frames WHERE painting_id = ? ORDER BY frame_number ASC').all(painting.id);
    const frames = rawFrames.map(formatFrame);
    const lockedCount = frames.filter(f => f.status === 'locked').length;
    const completionPercentage = Math.round((lockedCount / 6) * 100);

    res.json({
      painting,
      frames,
      lockedCount,
      completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/start-frame
 * Begin a drawing session for Tablet A or B
 */
router.get('/start-frame', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed. Use POST for /api/start-frame' });
});

router.post('/start-frame', (req, res) => {
  try {
    const { tablet_id, participant_name, participant_avatar, name, avatar } = req.body;
    const tablet = (tablet_id || '').toUpperCase();
    const userName = (participant_name || name || '').trim();
    const userAvatar = participant_avatar || avatar || 'default';

    if (!['A', 'B'].includes(tablet)) {
      return res.status(400).json({ error: "tablet_id must be 'A' or 'B'" });
    }
    if (!userName) {
      return res.status(400).json({ error: 'participant_name is required' });
    }

    const painting = getOrActivatePainting();
    if (!painting) {
      return res.status(404).json({ error: 'No active painting available' });
    }

    // Target frame numbers per PRD interleaved rules
    // Tablet A: [1, 3, 5] | Tablet B: [2, 4, 6]
    const targetFrames = tablet === 'A' ? [1, 3, 5] : [2, 4, 6];

    // Check if this tablet already has an in_progress frame for this active painting
    const existingFrame = db.prepare(`
      SELECT * FROM frames 
      WHERE painting_id = ? AND frame_number IN (${targetFrames.join(',')}) AND status = 'in_progress' AND owner_name = ?
    `).get(painting.id, userName);

    let assignedFrame = existingFrame;

    if (!assignedFrame) {
      // Find the next unclaimed frame for this tablet
      const unclaimedFrame = db.prepare(`
        SELECT * FROM frames 
        WHERE painting_id = ? AND frame_number IN (${targetFrames.join(',')}) AND status = 'unclaimed'
        ORDER BY frame_number ASC LIMIT 1
      `).get(painting.id);

      if (!unclaimedFrame) {
        return res.status(409).json({ 
          error: `All frames for Tablet ${tablet} in active painting "${painting.name}" are already claimed or completed.`
        });
      }

      // Claim & mark in_progress
      db.prepare(`
        UPDATE frames 
        SET status = 'in_progress', owner_name = ?, owner_avatar = ?
        WHERE id = ?
      `).run(userName, userAvatar, unclaimedFrame.id);

      assignedFrame = db.prepare('SELECT * FROM frames WHERE id = ?').get(unclaimedFrame.id);
    }

    // Upsert session
    db.prepare(`
      INSERT INTO sessions (tablet_id, current_painting_id, current_frame_id, participant_name, participant_avatar, started_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(tablet_id) DO UPDATE SET
        current_painting_id = excluded.current_painting_id,
        current_frame_id = excluded.current_frame_id,
        participant_name = excluded.participant_name,
        participant_avatar = excluded.participant_avatar,
        started_at = excluded.started_at
    `).run(tablet, painting.id, assignedFrame.id, userName, userAvatar);

    res.json({
      success: true,
      tablet_id: tablet,
      painting: {
        id: painting.id,
        name: painting.name,
        sequence_order: painting.sequence_order
      },
      frame: formatFrame(assignedFrame)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/update-pixels-batch
 * Sync in-progress pixel changes
 */
router.post('/update-pixels-batch', (req, res) => {
  try {
    const { frame_id, pixel_updates, pixel_grid } = req.body;
    if (!frame_id) {
      return res.status(400).json({ error: 'frame_id is required' });
    }

    const frame = db.prepare('SELECT * FROM frames WHERE id = ?').get(frame_id);
    if (!frame) {
      return res.status(404).json({ error: 'Frame not found' });
    }
    if (frame.status === 'locked') {
      return res.status(403).json({ error: 'Cannot update a locked frame' });
    }

    let updatedGrid;
    if (Array.isArray(pixel_grid)) {
      updatedGrid = pixel_grid;
    } else if (Array.isArray(pixel_updates)) {
      const currentGrid = frame.pixel_grid 
        ? JSON.parse(frame.pixel_grid) 
        : Array.from({ length: 16 }, () => Array(16).fill(null));

      for (const update of pixel_updates) {
        const { row, col, color } = update;
        if (row >= 0 && row < 16 && col >= 0 && col < 16) {
          currentGrid[row][col] = color;
        }
      }
      updatedGrid = currentGrid;
    } else {
      return res.status(400).json({ error: 'Either pixel_grid matrix or pixel_updates array is required' });
    }

    db.prepare('UPDATE frames SET pixel_grid = ? WHERE id = ?').run(JSON.stringify(updatedGrid), frame_id);

    res.json({
      success: true,
      frame_id,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/submit-frame
 * Lock frame, finalize pixel data, and check painting completion
 */
router.post('/submit-frame', (req, res) => {
  try {
    const { tablet_id, frame_id, pixel_grid } = req.body;
    if (!frame_id) {
      return res.status(400).json({ error: 'frame_id is required' });
    }

    const frame = db.prepare('SELECT * FROM frames WHERE id = ?').get(frame_id);
    if (!frame) {
      return res.status(404).json({ error: 'Frame not found' });
    }
    if (frame.status === 'locked') {
      return res.status(400).json({ error: 'Frame is already locked' });
    }

    let finalGrid = frame.pixel_grid ? JSON.parse(frame.pixel_grid) : null;
    if (Array.isArray(pixel_grid)) {
      finalGrid = pixel_grid;
    }

    // Lock frame
    db.prepare(`
      UPDATE frames 
      SET status = 'locked', pixel_grid = ?, locked_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(JSON.stringify(finalGrid), frame_id);

    // Clear active session for tablet if specified
    if (tablet_id) {
      db.prepare(`
        UPDATE sessions 
        SET current_frame_id = NULL, participant_name = NULL, participant_avatar = NULL 
        WHERE tablet_id = ?
      `).run(tablet_id.toUpperCase());
    }

    // Check if all 6 frames of this painting are now locked
    const lockedCountResult = db.prepare(`
      SELECT COUNT(*) as count FROM frames WHERE painting_id = ? AND status = 'locked'
    `).get(frame.painting_id);

    const isPaintingComplete = lockedCountResult.count === 6;
    let nextPainting = null;

    if (isPaintingComplete) {
      // Mark painting completed
      db.prepare("UPDATE paintings SET status = 'completed' WHERE id = ?").run(frame.painting_id);

      // Auto-activate next painting in sequence
      const upcoming = db.prepare(`
        SELECT * FROM paintings WHERE status = 'upcoming' ORDER BY sequence_order ASC LIMIT 1
      `).get();

      if (upcoming) {
        db.prepare("UPDATE paintings SET status = 'active' WHERE id = ?").run(upcoming.id);
        nextPainting = db.prepare("SELECT * FROM paintings WHERE id = ?").get(upcoming.id);
      }
    }

    res.json({
      success: true,
      frame_locked: true,
      painting_id: frame.painting_id,
      painting_completed: isPaintingComplete,
      next_painting: nextPainting
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/painting-state
 * Polled by Live Canvas Display (Display 1)
 */
router.get('/painting-state', (req, res) => {
  try {
    const painting = getOrActivatePainting();
    if (!painting) {
      return res.status(404).json({ error: 'No active painting' });
    }

    const rawFrames = db.prepare('SELECT * FROM frames WHERE painting_id = ? ORDER BY frame_number ASC').all(painting.id);
    const frames = rawFrames.map(formatFrame);
    const lockedCount = frames.filter(f => f.status === 'locked').length;
    const completionPercentage = Math.round((lockedCount / 6) * 100);

    res.json({
      painting,
      frames,
      lockedCount,
      completionPercentage,
      isCompleted: painting.status === 'completed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/active-drawers
 * Polled by Current Drawers Display (Display 2)
 */
router.get('/active-drawers', (req, res) => {
  try {
    const getDrawerForTablet = (tabletId) => {
      const session = db.prepare(`
        SELECT s.*, f.frame_number, f.status as frame_status, p.name as painting_name
        FROM sessions s
        LEFT JOIN frames f ON s.current_frame_id = f.id
        LEFT JOIN paintings p ON s.current_painting_id = p.id
        WHERE s.tablet_id = ?
      `).get(tabletId);

      if (!session || !session.participant_name || session.frame_status !== 'in_progress') {
        return {
          tablet_id: tabletId,
          active: false,
          participant_name: null,
          participant_avatar: null,
          frame_number: null,
          painting_name: null
        };
      }

      return {
        tablet_id: tabletId,
        active: true,
        participant_name: session.participant_name,
        participant_avatar: session.participant_avatar,
        frame_number: session.frame_number,
        painting_name: session.painting_name,
        started_at: session.started_at
      };
    };

    res.json({
      tabletA: getDrawerForTablet('A'),
      tabletB: getDrawerForTablet('B'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
