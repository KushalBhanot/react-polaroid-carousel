---
name: react-polaroid-carousel
description: Adds an accessible, swipeable image carousel (photo slider / gallery) to React or Next.js apps using the react-polaroid-carousel package. Use when a page needs an image carousel, photo slider, gallery, memories or timeline strip, or a testimonial/card carousel, or when the user mentions carousels, sliders or polaroid photos in React.
license: MIT
metadata:
  package: react-polaroid-carousel
  docs: https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/llms-full.txt
---

# Using react-polaroid-carousel

A ~4 kB, zero-dependency React 18/19 carousel. Photos stack like tilted polaroids; works with swipe, keyboard and autoplay; SSR-safe; accessible by default.

## Steps

1. Install: `npm install react-polaroid-carousel` (or the project's package manager).
2. Import the named export and pass `items`. Every item needs `src` and a meaningful `alt`:

   ```tsx
   import { PolaroidCarousel } from "react-polaroid-carousel";

   <PolaroidCarousel
     label="Team offsite photos"
     items={[
       { src: "/offsite/1.jpg", alt: "Team hiking up a ridge", caption: "day 1" },
       { src: "/offsite/2.jpg", alt: "Group dinner at a long table", caption: "day 2" },
     ]}
   />
   ```

3. Do **not** add a CSS import or a `"use client"` wrapper: styles are inline and the package already marks itself as a client component, so it renders fine from Next.js Server Components.
4. Size it with `--rpc-card-width` (default `min(60%, 260px)`) rather than wrapping it in a fixed-height box. Height is automatic.

## Choosing options

| Need | Use |
| --- | --- |
| Auto-advance | `autoplay={4000}` (adds a required pause button; stops on interaction) |
| Above the fold | `priority` (eager, high-priority first image) |
| Next.js `<Image>` | `renderImage={(item) => <Image src={item.src} alt={item.alt} width={600} height={600} style={{ width: "100%", height: "auto" }} />}` |
| Non-photo slides (quotes, cards) | pass `children` instead of `items`, often with `frame="none"` |
| Wide or tall photos | per item `aspectRatio: "4 / 3"`, or `--rpc-aspect` for all |
| Brand colors / fonts | CSS variables in `style`: `--rpc-frame`, `--rpc-caption-font`, `--rpc-caption-color`, `--rpc-shadow`, `--rpc-dot` |
| Tailwind-only styling | `unstyled` plus `classNames={{ slide, caption, dot, ... }}` |
| Show more cards | `visible={2}`; straight stack: `tilt={0} fan={0}` |
| Sync with other UI | controlled `index` + `onIndexChange` |
| Fully custom markup | `useCarousel({ count })` hook: spread `rootProps` + `ref={rootRef}` on the wrapper and `swipeProps` on the swipe area |
| Other languages | `labels={{ carousel, slide, goTo, previous, next, pause, play }}`, `direction="rtl"` |

## Gotchas

- `items` must be stable between renders when possible (define outside the component or `useMemo`) to avoid needless work.
- Do not wrap it in `overflow: hidden` containers that are narrower than the cards plus `spread`; side cards are meant to peek out and the stage already clips itself.
- `alt=""` only for purely decorative images; captions are not a substitute for alt text.
- Full API with every prop and type: see the `docs` URL in this skill's metadata, or `node_modules/react-polaroid-carousel/llms-full.txt`.
