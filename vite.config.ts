import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const equipmentModelDir = join(projectRoot, "public/models/equipment");
const onnxRuntimeDist = join(projectRoot, "node_modules/onnxruntime-web/dist");
const onnxRuntimeFiles = ["ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs"];

function hasEquipmentModel() {
  try {
    const manifest = JSON.parse(readFileSync(join(equipmentModelDir, "manifest.json"), "utf8"));
    return typeof manifest.modelFile === "string"
      && /^[a-zA-Z0-9][a-zA-Z0-9._-]*[.]onnx$/.test(manifest.modelFile)
      && existsSync(join(equipmentModelDir, manifest.modelFile));
  } catch {
    return false;
  }
}

function equipmentRuntimeAssets(): Plugin {
  let compressedWasm: Buffer | null = null;
  return {
    name: "equipment-yolo-runtime-assets",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || "/", "http://localhost").pathname;
        const filename = pathname.startsWith("/onnxruntime/") ? pathname.slice("/onnxruntime/".length) : "";
        if (!onnxRuntimeFiles.includes(filename)) {
          next();
          return;
        }
        const assetPath = join(onnxRuntimeDist, filename);
        if (!existsSync(assetPath)) {
          next();
          return;
        }
        const acceptsGzip = filename.endsWith(".wasm") && (request.headers["accept-encoding"] || "").includes("gzip");
        const body = acceptsGzip
          ? (compressedWasm ||= gzipSync(readFileSync(assetPath)))
          : readFileSync(assetPath);
        response.setHeader("Content-Type", filename.endsWith(".wasm") ? "application/wasm" : "text/javascript");
        response.setHeader("Cache-Control", "no-cache");
        if (acceptsGzip) response.setHeader("Content-Encoding", "gzip");
        response.setHeader("Vary", "Accept-Encoding");
        response.setHeader("Content-Length", body.byteLength);
        response.end(body);
      });
    },
    closeBundle() {
      if (!hasEquipmentModel()) return;
      const outputDir = join(projectRoot, "dist/onnxruntime");
      mkdirSync(outputDir, { recursive: true });
      for (const filename of onnxRuntimeFiles) {
        const sourcePath = join(onnxRuntimeDist, filename);
        if (!existsSync(sourcePath)) throw new Error("Missing ONNX Runtime Web asset: " + sourcePath);
        copyFileSync(sourcePath, join(outputDir, filename));
        if (filename.endsWith(".wasm")) {
          writeFileSync(join(outputDir, filename + ".gz"), gzipSync(readFileSync(sourcePath)));
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), equipmentRuntimeAssets()],
  resolve: {
    conditions: ["onnxruntime-web-use-extern-wasm", "module", "browser", "development|production"],
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: { target: "es2022", minify: "esbuild", sourcemap: true }
});
