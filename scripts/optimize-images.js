// Script chạy một lần (offline, không phải một phần runtime của site) để tối ưu ảnh địa danh:
// giữ bản gốc trong ./originals/, sinh bản WebP tối ưu (resize + nén) thay cho file gốc trong
// assets/images/destinations/. Chạy: node scripts/optimize-images.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'assets', 'images', 'destinations');
const ORIGINALS_DIR = path.join(DIR, 'originals');
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;

async function main() {
  if (!fs.existsSync(ORIGINALS_DIR)) fs.mkdirSync(ORIGINALS_DIR, { recursive: true });

  const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && fs.statSync(path.join(DIR, f)).isFile());
  const report = [];

  for (const file of files) {
    const basename = path.parse(file).name;
    const outPath = path.join(DIR, `${basename}.webp`);
    // Đã xử lý ở lần chạy trước (đã có bản gốc lưu lại ứng với basename này) — bỏ qua.
    const hasOriginal = ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => fs.existsSync(path.join(ORIGINALS_DIR, `${basename}${ext}`)));
    if (hasOriginal) { console.log(`Skip (đã xử lý): ${file}`); continue; }

    const srcPath = path.join(DIR, file);
    const originalDestPath = path.join(ORIGINALS_DIR, file);

    const beforeSize = fs.statSync(srcPath).size;

    // Giữ bản gốc trước khi ghi đè.
    fs.copyFileSync(srcPath, originalDestPath);

    const meta = await sharp(srcPath).metadata();
    const resizeOpts = meta.width && meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : null;
    let pipeline = sharp(srcPath);
    if (resizeOpts) pipeline = pipeline.resize(resizeOpts);
    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outPath + '.tmp');

    // Nếu file nguồn vốn đã là .webp, outPath trùng srcPath — ghi qua file tạm rồi thay thế.
    fs.renameSync(outPath + '.tmp', outPath);
    if (path.extname(file).toLowerCase() !== '.webp') fs.unlinkSync(srcPath);

    const afterSize = fs.statSync(outPath).size;
    report.push({ file, webp: `${basename}.webp`, beforeKB: Math.round(beforeSize / 1024), afterKB: Math.round(afterSize / 1024) });
  }

  console.log(JSON.stringify(report, null, 2));
  const totalBefore = report.reduce((s, r) => s + r.beforeKB, 0);
  const totalAfter = report.reduce((s, r) => s + r.afterKB, 0);
  console.log(`Total: ${totalBefore}KB -> ${totalAfter}KB (${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
