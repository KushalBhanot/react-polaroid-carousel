// Builds the demo site into site/dist: bundles the client, prerenders the page
// to static HTML (so it's crawlable and proves SSR-safety), and copies media.
// `node site/build.mjs --serve` rebuilds on change and serves on :4173.
import * as esbuild from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "dist");
const serve = process.argv.includes("--serve");

// The demo always uses the library source in this repo, not the published build.
const alias = {
  "react-polaroid-carousel/lightbox": join(here, "../src/lightbox.tsx"),
  "react-polaroid-carousel": join(here, "../src/index.ts"),
};
const shared = { bundle: true, alias, jsx: "automatic", logLevel: "warning", define: { "process.env.NODE_ENV": '"production"' } };

async function prerender() {
  const ssr = join(here, ".ssr.mjs");
  await esbuild.build({
    ...shared,
    entryPoints: [join(here, "src/app.tsx")],
    outfile: ssr,
    platform: "node",
    format: "esm",
    packages: "external",
    alias,
  });
  const [{ App }, { renderToString }, React] = await Promise.all([
    import(`${pathToFileURL(ssr).href}?t=${Date.now()}`),
    import("react-dom/server"),
    import("react"),
  ]);
  const html = renderToString(React.createElement(React.StrictMode, null, React.createElement(App)));
  await rm(ssr);
  const shell = await readFile(join(here, "index.html"), "utf8");
  await writeFile(join(out, "index.html"), shell.replace("<!--app-->", html));
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(here, "public"), out, { recursive: true });

const client = {
  ...shared,
  entryPoints: [join(here, "src/main.tsx"), join(here, "src/styles.css")],
  outdir: join(out, "assets"),
  format: "esm",
  minify: !serve,
  target: "es2020",
};

if (serve) {
  const ctx = await esbuild.context({ ...client, plugins: [{ name: "prerender", setup: (b) => b.onEnd(() => prerender()) }] });
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: out, port: 4173 });
  console.log(`demo site on http://localhost:${port}`);
} else {
  await esbuild.build(client);
  await prerender();
  console.log("built site/dist");
}
