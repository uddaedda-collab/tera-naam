'use strict';

/**
 * Render PWA icons from the SVG sources into public/assets/.
 * Run once with: node scripts/gen-icons.js   (requires `sharp`)
 * The generated PNGs are committed, so end users never need sharp.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCRIPTS = __dirname;
const OUT = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const standard = fs.readFileSync(path.join(SCRIPTS, 'icon.svg'));
const maskable = fs.readFileSync(path.join(SCRIPTS, 'icon-maskable.svg'));

async function render(svg, size, name) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(OUT, name));
  console.log('  ✓', name, `(${size}x${size})`);
}

(async () => {
  console.log('Generating CineSync icons...');
  await render(standard, 192, 'icon-192.png');
  await render(standard, 512, 'icon-512.png');
  await render(standard, 180, 'apple-touch-icon.png'); // iOS home screen
  await render(standard, 32, 'favicon-32.png');
  await render(maskable, 512, 'icon-maskable-512.png');
  await render(maskable, 192, 'icon-maskable-192.png');
  console.log('Done. Icons in public/assets/');
})().catch((e) => { console.error(e); process.exit(1); });
