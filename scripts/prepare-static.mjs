// Prepares the working tree for a static export (GitHub Pages UI preview).
//
// GitHub Pages serves static files only, so the server-only parts of the app
// (API routes, admin, login) are removed and `force-dynamic` is dropped from
// the public pages. The main app source is unaffected in normal builds — this
// runs on a throwaway CI checkout (or restore locally with `git checkout .`).

import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();

const REMOVE_DIRS = ["app/api", "app/admin", "app/masuk"];

async function rmDir(rel) {
  const p = path.join(ROOT, rel);
  await fs.rm(p, { recursive: true, force: true });
  console.log("removed:", rel);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(full);
  }
  return files;
}

async function stripForceDynamic() {
  const publicDir = path.join(ROOT, "app/(public)");
  const files = await walk(publicDir);
  for (const file of files) {
    const src = await fs.readFile(file, "utf8");
    const next = src
      .split("\n")
      .filter((line) => line.trim() !== 'export const dynamic = "force-dynamic";')
      .join("\n");
    if (next !== src) {
      await fs.writeFile(file, next, "utf8");
      console.log("patched (force-dynamic removed):", path.relative(ROOT, file));
    }
  }
}

for (const d of REMOVE_DIRS) await rmDir(d);
await stripForceDynamic();
console.log("Static preparation done.");
