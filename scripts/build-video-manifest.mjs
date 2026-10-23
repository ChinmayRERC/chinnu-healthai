import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = "public/videos";
const target = "src/data/videoManifest.json";
const files = existsSync(dir) ? readdirSync(dir).filter((file) => /\.(mp4|webm|m4v)$/i.test(file)) : [];
const manifest = Object.fromEntries(files.map((file) => [file.replace(/\.(mp4|webm|m4v)$/i, ""), `/videos/${file}`]));
writeFileSync(target, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${files.length} video${files.length === 1 ? "" : "s"} to ${target}`);
