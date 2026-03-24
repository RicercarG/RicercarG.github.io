#!/usr/bin/env node
/**
 * generate-gallery.js
 * Scans resources/Gallery/ for subfolders and image files, reads the
 * EXIF ImageDescription from each image, and writes resources/Gallery/gallery.json.
 *
 * Usage (from project root):
 *   node scripts/generate-gallery.js
 *
 * To update a description: edit the image's EXIF with embed-descriptions.js,
 * then re-run this script to sync the change into gallery.json.
 */

const fs   = require('fs');
const path = require('path');

const GALLERY_DIR   = path.join(__dirname, '..', 'resources', 'Gallery');
const MANIFEST_PATH = path.join(GALLERY_DIR, 'gallery.json');
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const VIDEO_EXTS    = new Set(['.mp4', '.webm', '.mov']);

// Read the EXIF ImageDescription tag from a JPEG file (no external dependencies).
function readExifDescription(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return '';

  let i = 2;
  while (i < buf.length - 3) {
    const marker = (buf[i] << 8) | buf[i + 1];
    if ((marker & 0xFF00) !== 0xFF00) break;
    if (marker === 0xFFDA) break; // Start of Scan — stop

    const segLen = (buf[i + 2] << 8) | buf[i + 3]; // includes length bytes

    if (marker === 0xFFE1 && segLen >= 8) {
      const id = buf.subarray(i + 4, i + 10).toString('ascii');
      if (id === 'Exif\0\0') {
        const tiff = buf.subarray(i + 10);
        const le   = tiff[0] === 0x49; // 'II' = little-endian
        const r16  = o => le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o);
        const r32  = o => le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o);

        const ifd0     = r32(4);
        const numTags  = r16(ifd0);
        for (let e = 0; e < numTags; e++) {
          const base = ifd0 + 2 + e * 12;
          if (r16(base) === 0x010E) { // ImageDescription tag
            const count  = r32(base + 4);
            const valOff = r32(base + 8);
            return tiff.subarray(valOff, valOff + count - 1).toString('utf8').trim();
          }
        }
      }
    }

    i += 2 + segLen;
  }
  return '';
}

// Scan subfolders
const folders = fs.readdirSync(GALLERY_DIR)
  .filter(name => fs.statSync(path.join(GALLERY_DIR, name)).isDirectory())
  .sort();

const result = {};

for (const folder of folders) {
  const folderPath = path.join(GALLERY_DIR, folder);
  const files = fs.readdirSync(folderPath)
    .filter(f => { const e = path.extname(f).toLowerCase(); return IMAGE_EXTS.has(e) || VIDEO_EXTS.has(e); })
    .sort();

  result[folder] = files.map(filename => {
    const ext = path.extname(filename).toLowerCase();
    const description = IMAGE_EXTS.has(ext) ? readExifDescription(path.join(folderPath, filename)) : '';
    return { filename, description };
  });
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(result, null, 2) + '\n');

console.log('Gallery manifest updated:', MANIFEST_PATH);
for (const [folder, images] of Object.entries(result)) {
  const missing = images.filter(i => !i.description).length;
  console.log(`  ${folder}: ${images.length} image(s)${missing ? ` — ${missing} with no description` : ''}`);
}
