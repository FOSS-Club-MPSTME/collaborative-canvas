require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('../db');

/**
 * 8-12 Curated Master Palette
 * Bold, high-contrast swatches tuned for famous artwork pixel recreation
 */
const MASTER_PALETTE = [
  '#1a1b26', // Deep Obsidian / Dark Shadow
  '#1e3a8a', // Starry Night Navy Blue
  '#3b82f6', // Azure Blue / Great Wave Water
  '#06b6d4', // Cyan Highlight / Sky
  '#15803d', // Cypress Green / Nature
  '#ca8a04', // Gold / Klimt Yellow
  '#f59e0b', // Warm Amber / Sunset
  '#ef4444', // Crimson / Accent Red
  '#ec4899', // Rose Pink / Flowers
  '#8b5cf6', // Soft Violet / Twilight
  '#f3f4f6', // Canvas Cream / Foam White
  '#78350f'  // Terracotta / Earth Brown
];

/**
 * Generates a 32x48 pixel matrix for famous preset paintings
 * (32 rows x 48 columns = 6 frames of 16x16)
 */
function generatePresetPaintingMatrix(presetName) {
  const matrix = Array.from({ length: 32 }, () => Array(48).fill('#1a1b26'));

  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 48; c++) {
      const normY = r / 32;
      const normX = c / 48;

      if (presetName === 'Starry Night') {
        // Swirling sky, cypress tree, glowing stars
        if (normX < 0.25 && normY > 0.2) {
          matrix[r][c] = '#15803d'; // Cypress tree on left
        } else if (normY < 0.65) {
          // Swirling night sky & stars
          const dist1 = Math.hypot(normX - 0.7, normY - 0.3);
          const dist2 = Math.hypot(normX - 0.35, normY - 0.25);
          if (dist1 < 0.12 || dist2 < 0.08) {
            matrix[r][c] = '#f59e0b'; // Crescent moon / bright star
          } else if (Math.sin(normX * 12 + normY * 8) > 0.2) {
            matrix[r][c] = '#3b82f6'; // Azure swirls
          } else if (Math.cos(normX * 8 - normY * 10) > 0.4) {
            matrix[r][c] = '#8b5cf6'; // Twilight violet
          } else {
            matrix[r][c] = '#1e3a8a'; // Deep starry navy
          }
        } else {
          // Village & rolling hills
          matrix[r][c] = (c % 4 === 0 && r > 22) ? '#ca8a04' : '#1a1b26';
        }

      } else if (presetName === 'The Great Wave off Kanagawa') {
        // Towering wave with foam crests and Mt. Fuji in background
        const waveHeight = 0.8 - Math.pow(normX - 0.4, 2) * 2 - Math.sin(normX * 10) * 0.15;
        const fujiDist = Math.hypot(normX - 0.6, normY - 0.7);

        if (fujiDist < 0.12 && normY < 0.75) {
          matrix[r][c] = (normY < 0.68) ? '#f3f4f6' : '#78350f'; // Snow-capped Fuji
        } else if (normY < waveHeight - 0.08) {
          matrix[r][c] = '#06b6d4'; // Soft sky
        } else if (normY < waveHeight) {
          matrix[r][c] = '#f3f4f6'; // Foam crests
        } else {
          matrix[r][c] = (Math.sin(normX * 15 + normY * 10) > 0) ? '#1e3a8a' : '#3b82f6'; // Deep ocean wave
        }

      } else if (presetName === 'The Kiss (Gustav Klimt)') {
        // Gold robes, lovers, floral meadow
        if (normY > 0.8) {
          matrix[r][c] = (c % 2 === 0) ? '#ec4899' : '#15803d'; // Flower meadow
        } else if (normX > 0.3 && normX < 0.7 && normY > 0.15 && normY < 0.8) {
          // Gold pattern robes
          if ((r + c) % 3 === 0) {
            matrix[r][c] = '#ca8a04'; // Bright gold
          } else if ((r * c) % 5 === 0) {
            matrix[r][c] = '#f59e0b'; // Amber gold
          } else if (r % 4 === 0) {
            matrix[r][c] = '#ef4444'; // Crimson motif
          } else {
            matrix[r][c] = '#78350f'; // Warm bronze
          }
        } else {
          matrix[r][c] = '#8b5cf6'; // Golden aura background
        }

      } else if (presetName === 'Girl with a Pearl Earring') {
        // Dark background, blue/yellow turban, glowing earring
        const earDist = Math.hypot(normX - 0.45, normY - 0.55);
        if (earDist < 0.04) {
          matrix[r][c] = '#f3f4f6'; // Glowing pearl
        } else if (normY < 0.35 && normX > 0.25 && normX < 0.75) {
          matrix[r][c] = (normX < 0.5) ? '#1e3a8a' : '#f59e0b'; // Ultramarine & yellow turban
        } else if (normX > 0.3 && normX < 0.7 && normY >= 0.35 && normY < 0.8) {
          matrix[r][c] = '#78350f'; // Jacket & face silhouette
        } else {
          matrix[r][c] = '#1a1b26'; // Dark backdrop
        }

      } else if (presetName === 'Mona Lisa') {
        // Sfumato landscape backdrop & enigmatic portrait
        if (normX > 0.28 && normX < 0.72 && normY > 0.2) {
          matrix[r][c] = (normY < 0.45) ? '#78350f' : '#15803d'; // Figure silhouette
        } else if (normY < 0.5) {
          matrix[r][c] = '#06b6d4'; // Misty background landscape
        } else {
          matrix[r][c] = '#78350f'; // Earthy foreground
        }
      }
    }
  }

  return matrix;
}

/**
 * Splits a 32x48 master matrix into 6 frames of 16x16
 * Frame 1: (row 0-15, col 0-15)
 * Frame 2: (row 0-15, col 16-31)
 * Frame 3: (row 0-15, col 32-47)
 * Frame 4: (row 16-31, col 0-15)
 * Frame 5: (row 16-31, col 16-31)
 * Frame 6: (row 16-31, col 32-47)
 */
function extractFramesFromMatrix(masterMatrix) {
  const frames = [];

  const frameCoords = [
    { num: 1, rowStart: 0, colStart: 0 },
    { num: 2, rowStart: 0, colStart: 16 },
    { num: 3, rowStart: 0, colStart: 32 },
    { num: 4, rowStart: 16, colStart: 0 },
    { num: 5, rowStart: 16, colStart: 16 },
    { num: 6, rowStart: 16, colStart: 32 },
  ];

  for (const fc of frameCoords) {
    const grid = [];
    for (let r = 0; r < 16; r++) {
      const row = [];
      for (let c = 0; c < 16; c++) {
        row.push(masterMatrix[fc.rowStart + r][fc.colStart + c]);
      }
      grid.push(row);
    }
    frames.push({
      frame_number: fc.num,
      guide_data: JSON.stringify(grid)
    });
  }

  return frames;
}

function preprocessAndSeed() {
  console.log('Starting artwork preprocessing and database seeding...');

  const presetPaintings = [
    { name: 'Starry Night', artist: 'Vincent van Gogh', sequence_order: 1 },
    { name: 'The Great Wave off Kanagawa', artist: 'Hokusai', sequence_order: 2 },
    { name: 'The Kiss (Gustav Klimt)', artist: 'Gustav Klimt', sequence_order: 3 },
    { name: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', sequence_order: 4 },
    { name: 'Mona Lisa', artist: 'Leonardo da Vinci', sequence_order: 5 }
  ];

  const clearExisting = db.transaction(() => {
    db.prepare('DELETE FROM sessions').run();
    db.prepare('DELETE FROM frames').run();
    db.prepare('DELETE FROM paintings').run();
  });
  clearExisting();

  const insertPaintingStmt = db.prepare(`
    INSERT INTO paintings (name, artist, image_path, sequence_order, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertFrameStmt = db.prepare(`
    INSERT INTO frames (painting_id, frame_number, guide_data, pixel_grid, status)
    VALUES (?, ?, ?, ?, 'unclaimed')
  `);

  for (const item of presetPaintings) {
    const status = item.sequence_order === 1 ? 'active' : 'upcoming';
    const result = insertPaintingStmt.run(item.name, item.artist, `preset://${item.name}`, item.sequence_order, status);
    const paintingId = result.lastInsertRowid;

    const masterMatrix = generatePresetPaintingMatrix(item.name);
    const frames = extractFramesFromMatrix(masterMatrix);

    for (const frame of frames) {
      insertFrameStmt.run(paintingId, frame.frame_number, frame.guide_data, null);
    }

    console.log(`✓ Seeded painting #${item.sequence_order}: "${item.name}" (Status: ${status}, 6 frames created)`);
  }

  console.log('Artwork preprocessing and database seeding completed successfully!');
}

if (require.main === module) {
  preprocessAndSeed();
}

module.exports = {
  MASTER_PALETTE,
  preprocessAndSeed
};
