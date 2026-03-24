#!/usr/bin/env node
/**
 * embed-descriptions.js
 * Reads descriptions from gallery.json and writes them as the EXIF
 * ImageDescription tag (0x010E) directly into each JPEG file.
 *
 * No external dependencies — uses only Node.js built-ins.
 *
 * Usage (from project root):
 *   node scripts/embed-descriptions.js
 *
 * After running, descriptions live in the image files themselves.
 * Re-run any time you update descriptions in gallery.json.
 */

const fs   = require('fs');
const path = require('path');

const GALLERY_DIR   = path.join(__dirname, '..', 'resources', 'Gallery');
const MANIFEST_PATH = path.join(GALLERY_DIR, 'gallery.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Build an APP1 EXIF segment containing only ImageDescription.
// If the image already has EXIF the caller will replace it; otherwise it inserts it.
function buildExifApp1(description) {
  const desc     = Buffer.from(description + '\0', 'ascii');
  const descLen  = desc.length;
  const ifdStart = 8;               // TIFF header is 8 bytes
  const ifdSize  = 2 + 1 * 12 + 4; // entry count + 1 entry + next-IFD pointer
  const valOff   = ifdStart + ifdSize; // offset within TIFF block

  const tiff = Buffer.alloc(valOff + descLen, 0);
  // TIFF header (little-endian)
  tiff.writeUInt16LE(0x4949, 0); // 'II'
  tiff.writeUInt16LE(42, 2);     // TIFF magic
  tiff.writeUInt32LE(ifdStart, 4);
  // IFD0
  tiff.writeUInt16LE(1, 8);       // 1 entry
  tiff.writeUInt16LE(0x010E, 10); // tag: ImageDescription
  tiff.writeUInt16LE(2, 12);      // type: ASCII
  tiff.writeUInt32LE(descLen, 14);
  tiff.writeUInt32LE(valOff, 18);
  tiff.writeUInt32LE(0, 22);      // next IFD = none
  desc.copy(tiff, valOff);

  // APP1 segment: FF E1 | length (2B, includes itself) | "Exif\0\0" | TIFF
  const segLen = 2 + 6 + tiff.length;
  const app1   = Buffer.alloc(2 + 2 + 6 + tiff.length);
  app1.writeUInt16BE(0xFFE1, 0);
  app1.writeUInt16BE(segLen, 2);
  Buffer.from('Exif\0\0').copy(app1, 4);
  tiff.copy(app1, 10);
  return app1;
}

function embedDescription(jpegPath, description) {
  const buf = fs.readFileSync(jpegPath);
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) {
    console.warn('  Skipping (not JPEG):', jpegPath);
    return false;
  }

  // Walk segments to find an existing EXIF APP1
  let exifStart = -1, exifEnd = -1;
  let i = 2;
  while (i < buf.length - 3) {
    const marker = (buf[i] << 8) | buf[i + 1];
    if ((marker & 0xFF00) !== 0xFF00) break;
    if (marker === 0xFFDA) break; // SOS — stop

    const segLen = (buf[i + 2] << 8) | buf[i + 3]; // includes length bytes
    if (marker === 0xFFE1 && segLen >= 8) {
      const id = buf.slice(i + 4, i + 10).toString('ascii');
      if (id === 'Exif\0\0') { exifStart = i; exifEnd = i + 2 + segLen; }
    }
    i += 2 + segLen;
  }

  const newApp1 = buildExifApp1(description);
  let result;
  if (exifStart !== -1) {
    result = Buffer.concat([buf.slice(0, exifStart), newApp1, buf.slice(exifEnd)]);
  } else {
    result = Buffer.concat([buf.slice(0, 2), newApp1, buf.slice(2)]);
  }

  fs.writeFileSync(jpegPath, result);
  return true;
}

let count = 0;
for (const [folder, images] of Object.entries(manifest)) {
  for (const img of images) {
    if (!img.description) continue;
    const imgPath = path.join(GALLERY_DIR, folder, img.filename);
    if (!fs.existsSync(imgPath)) { console.warn('  Missing:', imgPath); continue; }
    if (embedDescription(imgPath, img.description)) {
      console.log(`  [${folder}] ${img.filename}`);
      count++;
    }
  }
}
console.log(`\nWrote ImageDescription EXIF to ${count} image(s).`);
