// Post-export: tell GitHub Pages not to run Jekyll (so /_next works).
import { promises as fs } from "fs";
import path from "path";

const out = path.join(process.cwd(), "out");
await fs.writeFile(path.join(out, ".nojekyll"), "");
console.log("wrote out/.nojekyll");
