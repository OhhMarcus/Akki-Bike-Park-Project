// Lists files in public/images and writes src/content/imageManifest.json
// ({ "hero": "hero.jpg", ... }) so components only use photos that exist.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { extname, basename } from "node:path";

const dir = new URL("../public/images/", import.meta.url);
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const manifest = {};
if (existsSync(dir)) {
  for (const f of readdirSync(dir).sort()) {
    const ext = extname(f).toLowerCase();
    if (exts.has(ext)) manifest[basename(f, extname(f)).toLowerCase()] = f;
  }
}
writeFileSync(new URL("../src/content/imageManifest.json", import.meta.url), JSON.stringify(manifest, null, 2) + "\n");
console.log(`[images] ${Object.keys(manifest).length} photo(s) found in public/images`);
