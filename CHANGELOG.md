# Changelog

All notable changes to this project are documented here. This project follows [Semantic Versioning](https://semver.org/).

## 0.1.1

Docs and demo only; no changes to the library code.

- New demo site with 8 live use cases and their code: travel memories, product gallery, wedding timeline, real estate, recipe steps, testimonials, video reels and a headless stories UI. Built from this repo and deployed to GitHub Pages.
- README: hero GIF, a "What you can build" gallery, and a link to the demo. Package homepage now points to the demo site.
- Free stock demo media from Unsplash and Pexels, credited in `site/CREDITS.md`.

## 0.1.0

First release.

- `PolaroidCarousel` component: tilted polaroid stack, swipe/drag with axis lock, keyboard, dots, optional arrows, autoplay with APG rotation control, reduced-motion support, RTL, lazy images, per-item aspect ratio.
- Customisation: CSS variables, `classNames` slots, `unstyled`, `renderImage`, `renderSlide`, custom `children`, `labels` for i18n.
- `useCarousel` headless hook.
- SSR-safe (Next.js App Router), zero dependencies, ~4 kB min+gzip.
- AI tooling: `llms.txt`, `llms-full.txt`, Agent Skill, shadcn registry item.
