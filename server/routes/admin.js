const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Admin Passcode Authentication Middleware
 */
const verifyAdminPasscode = (req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] || req.body.passcode || req.query.passcode;
  const expectedPasscode = process.env.ADMIN_PASSCODE || '1234';

  if (!passcode || String(passcode).trim() !== String(expectedPasscode).trim()) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin passcode' });
  }
  next();
};

router.use(verifyAdminPasscode);

/**
 * POST /api/admin/verify
 * Validate passcode
 */
router.post('/verify', (req, res) => {
  res.json({ success: true, message: 'Admin passcode verified' });
});

/**
 * POST /api/admin/reset-frame
 * Reset an individual frame back to unclaimed
 */
router.post('/reset-frame', (req, res) => {
  try {
    const { frame_id } = req.body;
    if (!frame_id) {
      return res.status(400).json({ error: 'frame_id is required' });
    }

    const frame = db.prepare('SELECT * FROM frames WHERE id = ?').get(frame_id);
    if (!frame) {
      return res.status(404).json({ error: 'Frame not found' });
    }

    db.prepare(`
      UPDATE frames 
      SET status = 'unclaimed', pixel_grid = NULL, owner_name = NULL, owner_avatar = NULL, locked_at = NULL 
      WHERE id = ?
    `).run(frame_id);

    // Also clear session references if any session points to this frame
    db.prepare(`
      UPDATE sessions 
      SET current_frame_id = NULL, participant_name = NULL, participant_avatar = NULL 
      WHERE current_frame_id = ?
    `).run(frame_id);

    res.json({ success: true, message: `Frame ${frame.frame_number} reset to unclaimed` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/reset-painting
 * Reset an entire painting and all its 6 frames
 */
router.post('/reset-painting', (req, res) => {
  try {
    const { painting_id } = req.body;
    if (!painting_id) {
      return res.status(400).json({ error: 'painting_id is required' });
    }

    const painting = db.prepare('SELECT * FROM paintings WHERE id = ?').get(painting_id);
    if (!painting) {
      return res.status(404).json({ error: 'Painting not found' });
    }

    const resetTx = db.transaction(() => {
      db.prepare(`
        UPDATE frames 
        SET status = 'unclaimed', pixel_grid = NULL, owner_name = NULL, owner_avatar = NULL, locked_at = NULL 
        WHERE painting_id = ?
      `).run(painting_id);

      db.prepare("UPDATE paintings SET status = 'upcoming' WHERE id = ?").run(painting_id);

      db.prepare(`
        UPDATE sessions 
        SET current_frame_id = NULL, participant_name = NULL, participant_avatar = NULL 
        WHERE current_painting_id = ?
      `).run(painting_id);
    });

    resetTx();

    res.json({ success: true, message: `Painting "${painting.name}" and all frames reset successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/set-active-painting
 * Manually override which painting is active
 */
router.post('/set-active-painting', (req, res) => {
  try {
    const { painting_id } = req.body;
    if (!painting_id) {
      return res.status(400).json({ error: 'painting_id is required' });
    }

    const target = db.prepare('SELECT * FROM paintings WHERE id = ?').get(painting_id);
    if (!target) {
      return res.status(404).json({ error: 'Painting not found' });
    }

    const overrideTx = db.transaction(() => {
      // Set all current active paintings to upcoming if they were active
      db.prepare("UPDATE paintings SET status = 'upcoming' WHERE status = 'active'").run();
      // Set target to active
      db.prepare("UPDATE paintings SET status = 'active' WHERE id = ?").run(painting_id);
      // Clear sessions
      db.prepare("UPDATE sessions SET current_frame_id = NULL, participant_name = NULL, participant_avatar = NULL").run();
    });

    overrideTx();

    res.json({ success: true, message: `Active painting set to "${target.name}"` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/sequence
 * Get preset queue sequence of all paintings
 */
router.get('/sequence', (req, res) => {
  try {
    const paintings = db.prepare('SELECT * FROM paintings ORDER BY sequence_order ASC').all();
    res.json({ sequence: paintings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/sequence
 * Reorder preset painting sequence
 */
router.post('/sequence', (req, res) => {
  try {
    const { sequence } = req.body;
    if (!Array.isArray(sequence)) {
      return res.status(400).json({ error: 'sequence array is required' });
    }

    const updateTx = db.transaction(() => {
      // Use negative temporary sequence orders to avoid UNIQUE constraint collisions during swap
      for (const item of sequence) {
        db.prepare('UPDATE paintings SET sequence_order = ? WHERE id = ?').run(-item.sequence_order, item.id);
      }
      for (const item of sequence) {
        db.prepare('UPDATE paintings SET sequence_order = ? WHERE id = ?').run(item.sequence_order, item.id);
      }
    });

    updateTx();

    const updated = db.prepare('SELECT * FROM paintings ORDER BY sequence_order ASC').all();
    res.json({ success: true, sequence: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
