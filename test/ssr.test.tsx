// @vitest-environment node
// Server rendering must not touch window/document and must be deterministic,
// so the HTML matches the first client render (no hydration errors).
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { PolaroidCarousel } from "../src/index.js";

const items = [
  { src: "/a.jpg", alt: "Alpha", caption: "first" },
  { src: "/b.jpg", alt: "Bravo" },
  { src: "/c.jpg", alt: "Charlie" },
];

it("renders on the server without browser globals", () => {
  expect(typeof window).toBe("undefined");
  const html = renderToString(<PolaroidCarousel items={items} autoplay />);
  expect(html).toContain('aria-roledescription="carousel"');
  expect(html).toContain("Alpha");
});

it("produces identical HTML on every render", () => {
  const a = renderToString(<PolaroidCarousel items={items} autoplay tilt={6} />);
  const b = renderToString(<PolaroidCarousel items={items} autoplay tilt={6} />);
  expect(a).toBe(b);
});
