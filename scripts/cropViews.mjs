/**
 * cropViews.mjs
 * Crops the 4-panel house render (2x2 grid) into 4 separate view images.
 * Each panel corresponds to: 0° (front), 90° (right), 180° (back), 270° (left)
 * 
 * Layout:
 *   [0° Front]     [90° Right]
 *   [180° Back]    [270° Left]
 * 
 * Run: node scripts/cropViews.mjs
 */

import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCE_IMAGE = "C:\\Users\\olimp\\.gemini\\antigravity\\brain\\52dd7a15-f957-44b3-87a0-d99bae34c328\\media__1772389918550.jpg";
const OUTPUT_DIR = join(__dirname, '..', 'public');

const VIEWS = [
    { name: 'house_000', angle: 0, col: 0, row: 0 }, // Front (0°)
    { name: 'house_090', angle: 90, col: 1, row: 0 }, // Right (90°)
    { name: 'house_180', angle: 180, col: 0, row: 1 }, // Back (180°)
    { name: 'house_270', angle: 270, col: 1, row: 1 }, // Left (270°)
];

async function cropViews() {
    const img = await loadImage(SOURCE_IMAGE);
    const totalW = img.width;
    const totalH = img.height;

    // Each panel is half the total width/height
    const panelW = Math.floor(totalW / 2);
    const panelH = Math.floor(totalH / 2);

    console.log(`Source image: ${totalW}x${totalH}`);
    console.log(`Each panel: ${panelW}x${panelH}`);

    for (const view of VIEWS) {
        const canvas = createCanvas(panelW, panelH);
        const ctx = canvas.getContext('2d');

        const srcX = view.col * panelW;
        const srcY = view.row * panelH;

        ctx.drawImage(img, srcX, srcY, panelW, panelH, 0, 0, panelW, panelH);

        const outputPath = join(OUTPUT_DIR, `${view.name}.png`);
        const buffer = canvas.toBuffer('image/png');
        writeFileSync(outputPath, buffer);
        console.log(`✅  Saved: ${view.name}.png (${view.angle}°) → ${outputPath}`);
    }

    console.log('\n🎉 All 4 view images cropped and saved!');
}

cropViews().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
