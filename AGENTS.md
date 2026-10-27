# AGENTS.md

Guidance for AI coding agents working **on** this repository. (To **use** the package in an app, read `llms.txt` or `skills/react-polaroid-carousel/SKILL.md`.)

## Commands

- `npm run verify`: lint, typecheck, tests, build, size budget, publint + arethetypeswrong. Run before every commit.
- `npm test`: Vitest (jsdom). `test/ssr.test.tsx` runs in a Node environment to prove server rendering touches no browser globals.
- `npm run build`: `tsc` to `dist/` (no bundler, per the TypeScript handbook) and regenerates `llms-full.txt`.
- `npm run registry`: rebuilds the shadcn registry JSON in `public/r/` (run after editing `registry/`).

## Rules

- Zero runtime dependencies. React is the only peer dependency (`>=18`).
- Keep `"use client"` as the first statement of every module that uses hooks.
- Never read `window`/`document` during render; use effects or `useSyncExternalStore` with a server snapshot, so SSR HTML matches the first client render.
- Animate only `transform` and `opacity`. Do not re-render React on pointermove.
- Accessibility follows the W3C APG carousel pattern; keep the tests in `test/PolaroidCarousel.test.tsx` passing and add one for any new behavior.
- Public API changes need: JSDoc on the prop, a README row, a CHANGELOG entry. `llms-full.txt` is generated; do not edit it by hand.
- Stay under the 4.5 kB min+gzip budget (`npm run size`).
- ESM only, relative imports end in `.js` (`module: node18`).
