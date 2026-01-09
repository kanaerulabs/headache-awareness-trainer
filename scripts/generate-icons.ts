#!/usr/bin/env npx tsx
/**
 * Generate PWA icons from SVG
 *
 * Run: npx tsx scripts/generate-icons.ts
 *
 * Note: For production, replace with actual designed icons.
 * This creates placeholder icons for development/testing.
 */

import * as fs from 'fs';
import * as path from 'path';

const SIZES = [192, 512];
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Simple placeholder icon as a data URL (purple gradient circle with "HA" text)
function generatePlaceholderSVG(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333EA"/>
      <stop offset="100%" style="stop-color:#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white">
    HA
  </text>
</svg>`;
}

async function main() {
  console.log('Generating PWA icons...\n');

  for (const size of SIZES) {
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(PUBLIC_DIR, filename);

    const svg = generatePlaceholderSVG(size);
    fs.writeFileSync(filepath, svg);

    console.log(`Created ${filename}`);
  }

  console.log('\nNote: These are placeholder SVG icons.');
  console.log('For production, create proper PNG icons using a design tool.');
  console.log('\nTo use SVG icons in manifest.json, update the icon types to "image/svg+xml"');
  console.log('Or convert these SVGs to PNGs using a tool like:');
  console.log('  - https://convertio.co/svg-png/');
  console.log('  - ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png');
}

main();
