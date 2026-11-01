// Bundles each published entry the way an app would (minified, React external)
// and fails if its gzipped size grows past the budget.
import { build } from "esbuild";
import { gzipSync } from "node:zlib";

const budgets = [
  { name: "react-polaroid-carousel", entry: "dist/index.js", kB: 4.5 },
  { name: "react-polaroid-carousel/lightbox", entry: "dist/lightbox.js", kB: 3.25 },
];

let failed = false;
for (const { name, entry, kB } of budgets) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    external: ["react", "react/jsx-runtime"],
    write: false,
    logLevel: "silent",
  });
  const size = gzipSync(result.outputFiles[0].contents).length;
  console.log(`${name}: ${(size / 1024).toFixed(2)} kB min+gzip (budget ${kB} kB)`);
  if (size > kB * 1024) failed = true;
}
if (failed) process.exit(1);
