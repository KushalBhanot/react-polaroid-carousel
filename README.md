# react-polaroid-carousel

**Photo carousels that feel like memories.** A tiny React carousel that stacks your photos like tilted polaroids. Swipe it, let it autoplay, theme it with CSS variables, or go fully headless with `useCarousel`.

[![A polaroid photo carousel autoplaying through travel, wedding and coffee photos](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/hero.gif)](https://kushalbhanot.github.io/react-polaroid-carousel/)

[![npm](https://img.shields.io/npm/v/react-polaroid-carousel)](https://www.npmjs.com/package/react-polaroid-carousel)
[![minzipped size](https://img.shields.io/bundlejs/size/react-polaroid-carousel)](https://bundlejs.com/?q=react-polaroid-carousel)
[![types included](https://img.shields.io/npm/types/react-polaroid-carousel)](./src/index.ts)
[![license](https://img.shields.io/npm/l/react-polaroid-carousel)](./LICENSE)

**[Live demo and 8 examples →](https://kushalbhanot.github.io/react-polaroid-carousel/)**

- **~4 kB** min+gzip, **zero dependencies** (just React 18 or 19)
- **SSR-safe**: identical HTML on server and client, no layout shift, works in Next.js App Router, Remix, Astro
- **Accessible** by default, following the [W3C APG carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) and WCAG 2.2.2
- **Smooth**: GPU transforms only, no React re-render per drag frame, only nearby slides are mounted
- **Customisable**: 20+ optional props, CSS variables, class name slots, `renderImage` / `renderSlide`, `unstyled`, and a headless hook
- **TypeScript** first, ESM, tree-shakeable

```bash
npm install react-polaroid-carousel
```

```tsx
import { PolaroidCarousel } from "react-polaroid-carousel";

export default function Trip() {
  return (
    <PolaroidCarousel
      items={[
        { src: "/beach.jpg", alt: "Sunset over the beach", caption: "summer '25" },
        { src: "/hike.jpg", alt: "Friends on a mountain trail", caption: "made it!" },
        { src: "/city.jpg", alt: "City skyline at night", caption: "night out" },
      ]}
    />
  );
}
```

That's it: no CSS import, no config, no wrapper needed in Server Components.

## What you can build

One component, many looks. Every example below is live (with its code) on the [demo site](https://kushalbhanot.github.io/react-polaroid-carousel/).

| | |
| --- | --- |
| [![Travel memories: tilted polaroids with handwritten captions](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/travel.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#travel)<br>**Travel memories**: the default scrapbook look, autoplay and captions | [![Product gallery: straight frameless cards with name and price](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/product.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#product)<br>**Product gallery**: `frame="none"`, no tilt, price synced via `onIndexChange` |
| [![Wedding timeline: cream polaroids fanned out with dates](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/story.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#story)<br>**Wedding & "our story" timelines**: cream frames, handwriting font, two cards each side | [![Real estate: wide room photos with labels and arrows](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/real-estate.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#real-estate)<br>**Real estate tours**: 4:3 photos and room labels with `renderSlide` |
| [![Recipe steps: numbered polaroids that stop at the ends](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/recipe.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#recipe)<br>**Recipe & tutorial steps**: `loop={false}` so arrows stop at the ends | [![Testimonials: quote cards with avatars](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/testimonials.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#testimonials)<br>**Testimonials**: any `children` become slides |
| [![Video reels: vertical clips in polaroid frames](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/video.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#video)<br>**Video reels**: only the active card plays, others show a poster | [![Instagram-style stories built with the headless hook](https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/media/examples/headless.jpg)](https://kushalbhanot.github.io/react-polaroid-carousel/#headless)<br>**Stories UI**: build your own markup with the headless `useCarousel` hook |

<sub>Demo photos from [Unsplash](https://unsplash.com/license) and videos from [Pexels](https://www.pexels.com/license/). [Credits](./site/CREDITS.md).</sub>

## Why another carousel?

Popular carousels keep getting the same bug reports. This one is designed so they can't happen:

| Common problem (from real GitHub issues) | How react-polaroid-carousel avoids it |
| --- | --- |
| Slider renders too wide or zero-height until JS measures it; flicker in Next.js | Pure CSS grid layout. Nothing is measured, so the server HTML is final |
| Infinite loop flashes or breaks with cloned slides | No clones. Looping is index math |
| `aria-hidden` on slides that still contain focus; Lighthouse a11y warnings | Off-screen slides use `inert`, plus APG roles, labels and a live region |
| Swiping the carousel blocks page scroll on phones; passive-listener warnings | Pointer events with `touch-action: pan-y` and axis locking |
| A drag also fires a click on the slide | The click after a real drag is swallowed |
| Autoplay keeps going while you interact | Stops on interaction; pauses on hover, hidden tabs and when off screen |
| Hard to use with Next.js `<Image>`, needs a CSS import, broken TS/ESM types | `renderImage`, inline styles + CSS variables, validated with publint and arethetypeswrong |

## Recipes

### Autoplay

```tsx
<PolaroidCarousel items={items} autoplay={3500} />
```

Autoplay pauses on hover, when the tab is hidden and when the carousel is scrolled off screen. It stops after the user swipes, presses a key or clicks a dot, and shows a pause/play button (required for accessibility). It starts paused if the user prefers reduced motion.

### Next.js `<Image>`

```tsx
import Image from "next/image";

<PolaroidCarousel
  items={items}
  renderImage={(item, { active }) => (
    <Image src={item.src} alt={item.alt} width={600} height={600} priority={active} style={{ width: "100%", height: "auto" }} />
  )}
/>;
```

### Custom slides

Any children become slides:

```tsx
<PolaroidCarousel frame="none" label="Testimonials">
  <blockquote>“Shipped in a day.”</blockquote>
  <blockquote>“Finally, an accessible carousel.”</blockquote>
</PolaroidCarousel>
```

### Controlled

```tsx
const [index, setIndex] = useState(0);
<PolaroidCarousel items={items} index={index} onIndexChange={setIndex} />;
```

### Theme with CSS variables

```tsx
<PolaroidCarousel
  items={items}
  style={{
    "--rpc-card-width": "min(70%, 320px)",
    "--rpc-frame": "#fdf8ef",
    "--rpc-caption-font": "'Caveat', cursive",
    "--rpc-shadow": "0 24px 48px rgb(0 0 0 / 0.3)",
  } as React.CSSProperties}
/>
```

### Tailwind / your own styles

```tsx
<PolaroidCarousel
  items={items}
  unstyled
  classNames={{ slide: "rounded-xl bg-white p-3 shadow-xl", caption: "mt-2 text-center font-hand", dot: "size-6" }}
/>
```

### Headless

Build any markup you like on the same state machine (autoplay, swipe, keyboard, APG rules):

```tsx
import { useCarousel } from "react-polaroid-carousel";

function MySlider({ slides }: { slides: string[] }) {
  const c = useCarousel({ count: slides.length, autoplay: 4000 });
  return (
    <section ref={c.rootRef} {...c.rootProps} aria-roledescription="carousel" aria-label="Slides">
      <div {...c.swipeProps}>{slides[c.index]}</div>
      <button onClick={c.prev}>Prev</button>
      <button onClick={c.next}>Next</button>
      {c.hasAutoplay && <button onClick={c.toggleRotation}>{c.isRotationOn ? "Pause" : "Play"}</button>}
    </section>
  );
}
```

## Props

Everything is optional except `items` (or `children`).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `PolaroidItem[]` | | `{ src, alt, caption?, srcSet?, sizes?, width?, height?, aspectRatio? }` |
| `children` | `ReactNode` | | Custom slides (one per child), instead of `items` |
| `label` | `string` | `"Photo carousel"` | Accessible name of the carousel |
| `autoplay` | `boolean \| number` | `false` | `true` = 4000ms, or a delay in ms |
| `loop` | `boolean` | `true` | Wrap around at the ends |
| `index` / `defaultIndex` | `number` | `0` | Controlled / initial slide |
| `onIndexChange` | `(index) => void` | | Called on every slide change |
| `frame` | `"polaroid" \| "none"` | `"polaroid"` | Instant-photo frame, or bare cards |
| `visible` | `number` | `1` | Cards shown on each side |
| `spread` | `number` | `118` | Gap between cards, % of card width |
| `fan` | `number` | `6` | Extra rotation per step away (deg) |
| `tilt` | `number` | `4` | Max resting tilt (deg), `0` for straight |
| `scale` | `number` | `0.86` | Scale of non-active cards |
| `dots` | `boolean` | `true` | Dot navigation |
| `arrows` | `boolean` | `false` | Previous / next buttons |
| `draggable` | `boolean` | `true` | Swipe / drag |
| `swipeThreshold` | `number` | `50` | Pixels to trigger a slide change |
| `keyboard` | `boolean` | `true` | Arrow keys, Home, End |
| `pauseOnHover` | `boolean` | `true` | Pause autoplay on hover |
| `stopOnInteraction` | `boolean` | `true` | Stop autoplay after user interaction |
| `direction` | `"ltr" \| "rtl"` | `"ltr"` | Layout and gesture direction |
| `reducedMotion` | `"user" \| "always" \| "never"` | `"user"` | Follow the OS setting or force it |
| `priority` | `boolean` | `false` | Eager, high-priority active image (above the fold) |
| `duration` / `easing` | `number` / `string` | `600` / spring-like | Transition timing |
| `renderImage` | `(item, ctx) => ReactNode` | | Replace the `<img>` |
| `renderSlide` | `(item, ctx) => ReactNode` | | Replace a slide's contents |
| `unstyled` | `boolean` | `false` | Keep layout + motion, drop visual styles |
| `className` / `style` | | | Root element |
| `classNames` | `{ root, stage, slide, frame, image, caption, dots, dot, arrow, rotationButton }` | | Class names for each part |
| `labels` | `Partial<PolaroidCarouselLabels>` | English | Override any text (i18n) |

`ctx` is `{ index, offset, active, visible, loading }`.

## CSS variables

| Variable | Default |
| --- | --- |
| `--rpc-card-width` | `min(60%, 260px)` |
| `--rpc-aspect` | `1` (square photos) |
| `--rpc-frame` | `#fff` |
| `--rpc-frame-padding` | `12px 12px 14px` |
| `--rpc-shadow` | soft drop shadow |
| `--rpc-radius` | `16px` (with `frame="none"`) |
| `--rpc-caption-font` | handwriting system fonts |
| `--rpc-caption-size` | `1.15rem` |
| `--rpc-caption-color` | `#1f1f1f` |
| `--rpc-dot` | `currentColor` |
| `--rpc-button-bg` / `--rpc-button-color` | translucent black / white |
| `--rpc-stage-padding` | `28px 0 36px` |

## Accessibility

- `section` with `aria-roledescription="carousel"` and a label; each slide is a `group` labelled "2 of 5"
- Only the active slide is in the accessibility tree and tab order (`inert`, never `aria-hidden` over focusable content)
- A polite live region announces slide changes, and is silenced while autoplay runs
- Autoplay has a visible pause/play button first in tab order, stops on keyboard focus, and starts paused with `prefers-reduced-motion`
- Keyboard: ← → Home End; every control is a real `<button>` with a 24px+ target

## Performance

- Layout is CSS grid, so there is no measuring, no resize observer and no layout shift
- Movement uses only `transform` and `opacity`; dragging updates CSS variables, not React state
- Only the active slide ±`visible + 1` are mounted, so 1,000 photos cost the same as 5
- Images are `loading="lazy"` and `decoding="async"` unless you set `priority`

## For AI agents and LLMs

- [`llms.txt`](./llms.txt) and [`llms-full.txt`](./llms-full.txt) (complete API) ship in the npm package
- An [Agent Skill](./skills/react-polaroid-carousel/SKILL.md) (`SKILL.md`) for AI coding agents
- A [shadcn registry item](#shadcn) for v0 and shadcn-based projects
- Use it when a React or Next.js page needs an image carousel, photo slider, gallery, memories/timeline strip or testimonial carousel

<a id="shadcn"></a>

### shadcn

```bash
npx shadcn@latest add https://raw.githubusercontent.com/KushalBhanot/react-polaroid-carousel/main/public/r/polaroid-carousel.json
```

Adds `components/polaroid-carousel.tsx`, pre-themed with your shadcn colors.

## Browser support

All evergreen browsers (uses `inert`, CSS grid and pointer events: Chrome/Edge 102+, Safari 15.5+, Firefox 112+).

## License

MIT © [Kushal Bhanot](https://www.kushalbhanot.com)
