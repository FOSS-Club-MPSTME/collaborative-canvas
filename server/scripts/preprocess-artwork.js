require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../db');

/**
 * 12 Curated Master Palette Swatches
 */
const MASTER_PALETTE = [
  { hex: '#1a1b26', r: 26,  g: 27,  b: 38  }, // Deep Obsidian
  { hex: '#1e3a8a', r: 30,  g: 58,  b: 138 }, // Starry Navy
  { hex: '#3b82f6', r: 59,  g: 130, b: 246 }, // Azure Blue
  { hex: '#06b6d4', r: 6,   g: 182, b: 212 }, // Cyan Sky
  { hex: '#15803d', r: 21,  g: 128, b: 61  }, // Cypress Green
  { hex: '#ca8a04', r: 202, g: 138, b: 4   }, // Klimt Gold
  { hex: '#f59e0b', r: 245, g: 158, b: 11  }, // Warm Amber
  { hex: '#ef4444', r: 239, g: 68,  b: 68  }, // Crimson Red
  { hex: '#ec4899', r: 236, g: 72,  b: 153 }, // Rose Pink
  { hex: '#8b5cf6', r: 139, g: 92,  b: 246 }, // Twilight Violet
  { hex: '#f3f4f6', r: 243, g: 244, b: 246 }, // Foam White
  { hex: '#78350f', r: 120, g: 53,  b: 15  }  // Earth Bronze
];

/**
 * Maps an RGB color to the closest swatch in the curated master palette
 */
function quantizeRGBToPalette(r, g, b) {
  let closestHex = MASTER_PALETTE[0].hex;
  let minDistance = Infinity;

  for (const item of MASTER_PALETTE) {
    // Perceptual weighted Euclidean distance
    const dist = Math.sqrt(
      0.30 * Math.pow(r - item.r, 2) +
      0.59 * Math.pow(g - item.g, 2) +
      0.11 * Math.pow(b - item.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestHex = item.hex;
    }
  }

  return closestHex;
}

/**
 * Downsamples & quantizes a real image file using Sharp into a 32x48 pixel grid
 */
async function processImageFileToMatrix(imagePath, targetRows = 32, targetCols = 48) {
  const { data, info } = await sharp(imagePath)
    .resize(targetCols, targetRows, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const matrix = [];
  for (let r = 0; r < targetRows; r++) {
    const row = [];
    for (let c = 0; c < targetCols; c++) {
      const idx = (r * targetCols + c) * info.channels;
      const red = data[idx];
      const green = data[idx + 1];
      const blue = data[idx + 2];
      row.push(quantizeRGBToPalette(red, green, blue));
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Procedural High-Fidelity Fallback Generator
 */
function generatePresetPaintingMatrix(presetName) {
  const matrix = Array.from({ length: 32 }, () => Array(48).fill('#1a1b26'));

  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 48; c++) {
      const normY = r / 32;
      const normX = c / 48;

      if (presetName === 'Starry Night') {
        if (normX < 0.22 && normY > 0.15) {
          matrix[r][c] = (r % 2 === 0) ? '#15803d' : '#78350f'; // Cypress tree
        } else if (normY < 0.65) {
          const distMoon = Math.hypot(normX - 0.78, normY - 0.22);
          const distStar1 = Math.hypot(normX - 0.42, normY - 0.35);
          const distStar2 = Math.hypot(normX - 0.28, normY - 0.18);
          if (distMoon < 0.10 || distStar1 < 0.07 || distStar2 < 0.06) {
            matrix[r][c] = '#f59e0b'; // Moon & stars
          } else if (Math.sin(normX * 14 + normY * 10) > 0.15) {
            matrix[r][c] = '#3b82f6'; // Azure swirls
          } else if (Math.cos(normX * 9 - normY * 12) > 0.35) {
            matrix[r][c] = '#8b5cf6'; // Twilight violet
          } else {
            matrix[r][c] = '#1e3a8a'; // Deep starry navy
          }
        } else {
          matrix[r][c] = (c % 3 === 0 && r > 23) ? '#ca8a04' : '#1a1b26'; // Village
        }

      } else if (presetName === 'The Great Wave off Kanagawa') {
        const waveHeight = 0.82 - Math.pow(normX - 0.38, 2) * 2.2 - Math.sin(normX * 12) * 0.12;
        const fujiDist = Math.hypot(normX - 0.58, normY - 0.72);

        if (fujiDist < 0.11 && normY < 0.76) {
          matrix[r][c] = (normY < 0.68) ? '#f3f4f6' : '#78350f'; // Fuji
        } else if (normY < waveHeight - 0.09) {
          matrix[r][c] = '#06b6d4'; // Cyan sky
        } else if (normY < waveHeight) {
          matrix[r][c] = '#f3f4f6'; // Foam crests
        } else {
          matrix[r][c] = (Math.sin(normX * 16 + normY * 12) > 0) ? '#1e3a8a' : '#3b82f6'; // Ocean wave
        }

      } else if (presetName === 'The Kiss (Gustav Klimt)') {
        if (normY > 0.82) {
          matrix[r][c] = (c % 2 === 0) ? '#ec4899' : '#15803d'; // Flower meadow
        } else if (normX > 0.28 && normX < 0.72 && normY > 0.12 && normY < 0.82) {
          if ((r + c) % 3 === 0) matrix[r][c] = '#ca8a04';
          else if ((r * c) % 5 === 0) matrix[r][c] = '#f59e0b';
          else if (r % 4 === 0) matrix[r][c] = '#ef4444';
          else matrix[r][c] = '#78350f';
        } else {
          matrix[r][c] = '#8b5cf6'; // Golden background
        }

      } else if (presetName === 'Girl with a Pearl Earring') {
        const earDist = Math.hypot(normX - 0.44, normY - 0.54);
        if (earDist < 0.045) {
          matrix[r][c] = '#f3f4f6'; // Pearl
        } else if (normY < 0.36 && normX > 0.25 && normX < 0.75) {
          matrix[r][c] = (normX < 0.5) ? '#1e3a8a' : '#f59e0b'; // Turban
        } else if (normX > 0.32 && normX < 0.68 && normY >= 0.36 && normY < 0.82) {
          matrix[r][c] = '#78350f'; // Silhouette
        } else {
          matrix[r][c] = '#1a1b26'; // Dark background
        }

      } else if (presetName === 'Mona Lisa') {
        if (normX > 0.28 && normX < 0.72 && normY > 0.18) {
          matrix[r][c] = (normY < 0.42) ? '#78350f' : '#15803d';
        } else if (normY < 0.48) {
          matrix[r][c] = '#06b6d4';
        } else {
          matrix[r][c] = '#78350f';
        }
      }
    }
  }

  return matrix;
}

/**
 * Splits master matrix into 6 frames of 16x16
 */
function extractFramesFromMatrix(masterMatrix) {
  const frames = [];
  const frameCoords = [
    { num: 1, rowStart: 0, colStart: 0 },
    { num: 2, rowStart: 0, colStart: 16 },
    { num: 3, rowStart: 0, colStart: 32 },
    { num: 4, rowStart: 16, colStart: 0 },
    { num: 5, rowStart: 16, colStart: 16 },
    { num: 6, rowStart: 16, colStart: 32 }
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

async function preprocessAndSeed() {
  console.log('Starting artwork preprocessing and database seeding...');

  const assetsDir = path.join(__dirname, '../../assets/source_paintings');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const presetPaintings = [
    { name: 'Starry Night', artist: 'Vincent van Gogh', filename: 'starry_night.jpg', sequence_order: 1 },
    { name: 'The Great Wave off Kanagawa', artist: 'Hokusai', filename: 'great_wave.jpg', sequence_order: 2 },
    { name: 'The Kiss (Gustav Klimt)', artist: 'Gustav Klimt', filename: 'the_kiss.jpg', sequence_order: 3 },
    { name: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', filename: 'pearl_earring.jpg', sequence_order: 4 },
    { name: 'Mona Lisa', artist: 'Leonardo da Vinci', filename: 'mona_lisa.jpg', sequence_order: 5 }
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
    const imageFilePath = path.join(assetsDir, item.filename);
    let masterMatrix;

    if (fs.existsSync(imageFilePath)) {
      console.log(`📷 Found local source image for "${item.name}" at assets/source_paintings/${item.filename}`);
      masterMatrix = await processImageFileToMatrix(imageFilePath, 32, 48);
    } else {
      masterMatrix = generatePresetPaintingMatrix(item.name);
    }

    const status = item.sequence_order === 1 ? 'active' : 'upcoming';
    const result = insertPaintingStmt.run(item.name, item.artist, item.filename, item.sequence_order, status);
    const paintingId = result.lastInsertRowid;

    const frames = extractFramesFromMatrix(masterMatrix);
    for (const frame of frames) {
      insertFrameStmt.run(paintingId, frame.frame_number, frame.guide_data, null);
    }

    console.log(`✓ Seeded painting #${item.sequence_order}: "${item.name}" (Status: ${status}, 6 frames created)`);
  }

  console.log('\n====================================================');
  console.log(' Artwork Preprocessing & Database Seeding Complete!');
  console.log('====================================================\n');
}

if (require.main === module) {
  preprocessAndSeed().catch(console.error);
}

module.exports = {
  MASTER_PALETTE,
  preprocessAndSeed
};
