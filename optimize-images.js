const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'src/assets/images';
const files = [
  'hero_background.png',
  'guides_bg.png',
  'about_picture.png',
  'organization.png',
  'video_bg.png',
];

(async () => {
  for (const f of files) {
    const src = path.join(dir, f);
    const out = path.join(dir, f.replace(/\.png$/i, '.webp'));
    const img = sharp(src);
    const meta = await img.metadata();
    // Resize very large images down to a sane max width (1920) to cut bytes
    const maxW = 1920;
    const resize = meta.width > maxW ? img.resize({ width: maxW, withoutEnlargement: true }) : img;
    await resize.webp({ quality: 82 }).toFile(out);
    const before = fs.statSync(src).size;
    const after = fs.statSync(out).size;
    console.log(`${f}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB webp (${meta.width}x${meta.height})`);
  }
})();
