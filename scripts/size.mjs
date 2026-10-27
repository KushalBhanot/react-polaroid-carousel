// Bundles the published entry the way an app would (minified, React external)
// and fails if the gzipped size grows past the budget.
import { build } from "esbuild";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 4.5 * 1024;
const result = await build({
  entryPoints: ["dist/index.js"],
  bundle: true,
  minify: true,
  format: "esm",
  external: ["react", "react/jsx-runtime"],
  write: false,
  logLevel: "silent",
});
const size = gzipSync(result.outputFiles[0].contents).length;
console.log(`react-polaroid-carousel: ${(size / 1024).toFixed(2)} kB min+gzip (budget ${BUDGET_BYTES / 1024} kB)`);
if (size > BUDGET_BYTES) process.exit(1);
