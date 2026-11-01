import { useState, type CSSProperties, type ReactNode } from "react";
import { PolaroidCarousel, useCarousel } from "react-polaroid-carousel";
import { clips, homes, people, products, recipe, story, travel } from "./media";

export interface Example {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  code: string;
  Demo: () => ReactNode;
}

const vars = (v: Record<string, string>) => v as CSSProperties;

function TravelDemo() {
  return <PolaroidCarousel items={travel} autoplay={3500} label="Travel memories" priority />;
}

function ProductDemo() {
  const [index, setIndex] = useState(0);
  const product = products[index] ?? products[0];
  return (
    <div className="product">
      <PolaroidCarousel
        items={products.map((p) => ({ ...p, aspectRatio: "4 / 5" }))}
        index={index}
        onIndexChange={setIndex}
        frame="none"
        tilt={0}
        fan={0}
        spread={108}
        scale={0.9}
        arrows
        label="Product photos"
        style={vars({ "--rpc-card-width": "min(62%, 300px)", "--rpc-radius": "20px" })}
      />
      <div className="product-info" aria-live="polite">
        <strong>{product?.name}</strong>
        <span>{product?.price}</span>
      </div>
    </div>
  );
}

function StoryDemo() {
  return (
    <PolaroidCarousel
      items={story}
      tilt={7}
      fan={9}
      visible={2}
      spread={92}
      label="Our story"
      style={vars({
        "--rpc-frame": "#fdf8ef",
        "--rpc-caption-font": "'Caveat', cursive",
        "--rpc-caption-size": "1.5rem",
        "--rpc-card-width": "min(52%, 250px)",
      })}
    />
  );
}

function HomeDemo() {
  return (
    <PolaroidCarousel
      items={homes}
      frame="none"
      tilt={0}
      fan={0}
      spread={104}
      arrows
      label="Property photos"
      style={vars({ "--rpc-card-width": "min(82%, 520px)", "--rpc-aspect": "4 / 3", "--rpc-radius": "14px" })}
      renderSlide={(item, { index, loading }) => (
        <figure className="home-slide">
          <img src={item.src} alt={item.alt} loading={loading} decoding="async" />
          <figcaption>{homes[index]?.label}</figcaption>
        </figure>
      )}
    />
  );
}

function RecipeDemo() {
  return (
    <PolaroidCarousel
      items={recipe}
      loop={false}
      arrows
      tilt={3}
      label="Recipe steps"
      style={vars({ "--rpc-caption-font": "'Caveat', cursive", "--rpc-caption-size": "1.45rem" })}
    />
  );
}

function TestimonialDemo() {
  return (
    <PolaroidCarousel frame="none" autoplay={5000} tilt={2} fan={4} label="Testimonials" style={vars({ "--rpc-card-width": "min(84%, 380px)", "--rpc-aspect": "auto" })}>
      {people.map((p) => (
        <blockquote key={p.name} className="quote">
          <p>“{p.quote}”</p>
          <footer>
            <img src={p.src} alt="" width={44} height={44} loading="lazy" />
            <span>
              <strong>{p.name}</strong>
              {p.role}
            </span>
          </footer>
        </blockquote>
      ))}
    </PolaroidCarousel>
  );
}

function ReelsDemo() {
  return (
    <PolaroidCarousel
      items={clips}
      label="Video clips"
      style={vars({ "--rpc-aspect": "9 / 16", "--rpc-card-width": "min(46%, 220px)" })}
      renderImage={(item, { active, loading }) => {
        const poster = clips.find((c) => c.src === item.src)?.poster;
        return active ? (
          <video src={item.src} poster={poster} autoPlay muted loop playsInline aria-label={item.alt} className="clip" />
        ) : (
          <img src={poster} alt={item.alt} loading={loading} className="clip" />
        );
      }}
    />
  );
}

function StoriesDemo() {
  const slides = travel;
  const { rootRef, ...c } = useCarousel({ count: slides.length, autoplay: 3000, stopOnInteraction: false });
  const slide = slides[c.index] ?? slides[0];
  if (!slide) return null;
  return (
    <section ref={rootRef} {...c.rootProps} className="stories" aria-roledescription="carousel" aria-label="Stories">
      <div className="stories-bars">
        {slides.map((s, i) => (
          <span key={s.src} className="bar">
            <span
              key={c.index}
              className="fill"
              data-state={i < c.index ? "done" : i === c.index ? (c.isPlaying ? "run" : "hold") : "todo"}
            />
          </span>
        ))}
      </div>
      <div {...c.swipeProps} className="stories-frame">
        <img src={slide.src} alt={slide.alt} draggable={false} />
        <p>{slide.caption}</p>
        <button type="button" className="tap prev" onClick={c.prev} aria-label="Previous story" />
        <button type="button" className="tap next" onClick={c.next} aria-label="Next story" />
      </div>
      <button type="button" className="stories-toggle" onClick={c.toggleRotation}>
        {c.isRotationOn ? "Pause" : "Play"}
      </button>
    </section>
  );
}

export const examples: Example[] = [
  {
    id: "travel",
    title: "Travel memories",
    blurb: "The default look. Drop in photos with captions and it feels like a scrapbook. Autoplay pauses on hover and stops when someone swipes.",
    tags: ["autoplay", "captions", "priority"],
    Demo: TravelDemo,
    code: `<PolaroidCarousel
  items={[
    { src: "/beach.webp", alt: "Waves at golden hour", caption: "first swim of summer" },
    { src: "/lake.webp", alt: "Turquoise mountain lake", caption: "lake mornings" },
    { src: "/van.webp", alt: "Camper van on a desert road", caption: "road trip!" },
  ]}
  autoplay={3500}
  priority
/>`,
  },
  {
    id: "product",
    title: "Product gallery",
    blurb: "Straight, frameless cards for a shop. Controlled index keeps the product name and price in sync with the photo.",
    tags: ['frame="none"', "controlled", "arrows"],
    Demo: ProductDemo,
    code: `const [index, setIndex] = useState(0);

<PolaroidCarousel
  items={products.map((p) => ({ ...p, aspectRatio: "4 / 5" }))}
  index={index}
  onIndexChange={setIndex}
  frame="none"
  tilt={0}
  fan={0}
  arrows
  style={{ "--rpc-card-width": "min(62%, 300px)", "--rpc-radius": "20px" }}
/>
<p>{products[index].name} · {products[index].price}</p>`,
  },
  {
    id: "story",
    title: "Wedding & “our story” timelines",
    blurb: "Cream frames, a handwriting font and a wider fan. Show two cards on each side for a messy-table feel.",
    tags: ["CSS variables", "visible={2}", "custom font"],
    Demo: StoryDemo,
    code: `<PolaroidCarousel
  items={moments}
  tilt={7}
  fan={9}
  visible={2}
  spread={92}
  style={{
    "--rpc-frame": "#fdf8ef",
    "--rpc-caption-font": "'Caveat', cursive",
    "--rpc-caption-size": "1.5rem",
  }}
/>`,
  },
  {
    id: "real-estate",
    title: "Real estate & property tours",
    blurb: "Wide 4:3 photos with a label on each room. renderSlide gives you full control of what's inside a card.",
    tags: ["renderSlide", "4 / 3", "arrows"],
    Demo: HomeDemo,
    code: `<PolaroidCarousel
  items={rooms}
  frame="none"
  tilt={0}
  fan={0}
  arrows
  style={{ "--rpc-card-width": "min(82%, 520px)", "--rpc-aspect": "4 / 3" }}
  renderSlide={(item, { index, loading }) => (
    <figure>
      <img src={item.src} alt={item.alt} loading={loading} />
      <figcaption>{rooms[index].label}</figcaption>
    </figure>
  )}
/>`,
  },
  {
    id: "recipe",
    title: "Recipe & tutorial steps",
    blurb: "Turn off looping so step 1 is always first and the arrows stop at the ends.",
    tags: ["loop={false}", "arrows"],
    Demo: RecipeDemo,
    code: `<PolaroidCarousel
  items={steps}
  loop={false}
  arrows
  style={{ "--rpc-caption-font": "'Caveat', cursive" }}
/>`,
  },
  {
    id: "testimonials",
    title: "Testimonials",
    blurb: "Any children become slides. These are sample quotes for a made-up café, to show the layout.",
    tags: ["children", 'frame="none"', "autoplay"],
    Demo: TestimonialDemo,
    code: `<PolaroidCarousel frame="none" autoplay={5000} label="Testimonials">
  {reviews.map((r) => (
    <blockquote key={r.name}>
      <p>“{r.quote}”</p>
      <footer><img src={r.avatar} alt="" /> {r.name}, {r.role}</footer>
    </blockquote>
  ))}
</PolaroidCarousel>`,
  },
  {
    id: "video",
    title: "Video reels",
    blurb: "Only the active card plays; the rest show a poster image, so a page of clips stays light.",
    tags: ["renderImage", "9 / 16", "<video>"],
    Demo: ReelsDemo,
    code: `<PolaroidCarousel
  items={clips}
  style={{ "--rpc-aspect": "9 / 16" }}
  renderImage={(item, { active }) =>
    active
      ? <video src={item.src} poster={item.poster} autoPlay muted loop playsInline />
      : <img src={item.poster} alt={item.alt} />
  }
/>`,
  },
  {
    id: "headless",
    title: "Headless: Instagram-style stories",
    blurb: "useCarousel gives you the state machine (autoplay, swipe, keyboard, pause rules) and you write the markup.",
    tags: ["useCarousel", "headless"],
    Demo: StoriesDemo,
    code: `const { rootRef, ...c } = useCarousel({ count: stories.length, autoplay: 3000 });

<section ref={rootRef} {...c.rootProps} aria-roledescription="carousel" aria-label="Stories">
  <Progress count={stories.length} index={c.index} playing={c.isPlaying} />
  <div {...c.swipeProps}>
    <img src={stories[c.index].src} alt={stories[c.index].alt} />
    <button onClick={c.prev} aria-label="Previous story" />
    <button onClick={c.next} aria-label="Next story" />
  </div>
</section>`,
  },
];
