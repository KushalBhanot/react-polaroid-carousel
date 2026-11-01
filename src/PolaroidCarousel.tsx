"use client";

import {
  Children,
  useCallback,
  useRef,
  version,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { restingTilt, slideOffset } from "./math.js";
import { useCarousel, type UseCarouselOptions } from "./use-carousel.js";

export interface PolaroidItem {
  /** Image URL. */
  src: string;
  /** Alt text (required for accessibility; use "" only for purely decorative images). */
  alt: string;
  /** Handwritten-style caption under the photo. */
  caption?: ReactNode;
  srcSet?: string;
  sizes?: string;
  /** Intrinsic width, helps the browser reserve space. */
  width?: number;
  /** Intrinsic height, helps the browser reserve space. */
  height?: number;
  /** Crop this photo to its own aspect ratio, e.g. "4 / 3" for a wide shot. Defaults to `--rpc-aspect` (square). */
  aspectRatio?: string;
  /** "video" plays `src` as a muted, looping clip while its slide is active and shows `poster` otherwise. @default "image" */
  type?: "image" | "video";
  /** Still image for a video item: shown while the slide is inactive and before the clip loads. */
  poster?: string;
}

/** Passed to `renderImage` and `renderSlide`. */
export interface SlideContext {
  /** Position in `items` / children. */
  index: number;
  /** Distance from the active slide: 0 active, -1 previous, 1 next. */
  offset: number;
  /** This is the active slide. */
  active: boolean;
  /** Within `visible` steps of the active slide (painted on screen). */
  visible: boolean;
  /** Suggested `loading` attribute for images in this slide. */
  loading: "eager" | "lazy";
}

export type PolaroidCarouselSlot =
  | "root"
  | "stage"
  | "slide"
  | "frame"
  | "image"
  | "caption"
  | "dots"
  | "dot"
  | "arrow"
  | "rotationButton"
  | "openButton";

export interface PolaroidCarouselLabels {
  carousel: string;
  slide: (position: number, total: number) => string;
  goTo: (position: number) => string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  /** Name of the button over the active slide when `onSlideClick` is set. */
  open: (position: number, total: number) => string;
}

export interface PolaroidCarouselProps extends Omit<UseCarouselOptions, "count" | "onDragMove"> {
  /** Photos to show. Use `children` instead for fully custom slides. */
  items?: readonly PolaroidItem[];
  /** Custom slides: each child becomes one slide (wrapped in the frame unless `frame="none"`). */
  children?: ReactNode;
  /** Accessible name for the carousel region. @default "Photo carousel" */
  label?: string;
  /** "polaroid": white instant-photo frame with caption. "none": bare rounded cards. @default "polaroid" */
  frame?: "polaroid" | "none";
  /** Horizontal distance between cards, as % of card width. @default 118 */
  spread?: number;
  /** Extra rotation per step away from the active card, in degrees. @default 6 */
  fan?: number;
  /** Maximum resting tilt, in degrees (0 for a straight stack). @default 4 */
  tilt?: number;
  /** Scale of non-active cards. @default 0.86 */
  scale?: number;
  /** How many cards to show on each side of the active one. @default 1 */
  visible?: number;
  /** Show dot navigation. @default true */
  dots?: boolean;
  /** Show previous / next buttons. @default false */
  arrows?: boolean;
  /** Load the active image eagerly with high fetch priority (use for above-the-fold carousels). @default false */
  priority?: boolean;
  /** Transition length in ms. @default 600 */
  duration?: number;
  /** Transition timing function. @default "cubic-bezier(0.22, 1, 0.36, 1)" */
  easing?: string;
  /** Replace the `<img>` (e.g. with Next.js `<Image>`). */
  renderImage?: (item: PolaroidItem, context: SlideContext) => ReactNode;
  /**
   * Called when the active slide is clicked, or activated with Enter / Space (e.g. to open
   * `PolaroidLightbox`). Adds an accessible button over the active slide. A swipe never triggers it.
   */
  onSlideClick?: (index: number) => void;
  /** Replace a whole slide's contents (frame included unless `frame="none"`). */
  renderSlide?: (item: PolaroidItem, context: SlideContext) => ReactNode;
  /** Drop all visual styling (colors, frame, shadows, fonts), keep only layout and motion. */
  unstyled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Class names for inner parts. */
  classNames?: Partial<Record<PolaroidCarouselSlot, string>>;
  /** Override any text (for i18n). */
  labels?: Partial<PolaroidCarouselLabels>;
}

const DEFAULT_LABELS: PolaroidCarouselLabels = {
  carousel: "Photo carousel",
  slide: (position, total) => `${position} of ${total}`,
  goTo: (position) => `Go to slide ${position}`,
  previous: "Previous slide",
  next: "Next slide",
  pause: "Pause slide rotation",
  play: "Start slide rotation",
  open: (position) => `Open slide ${position}`,
};

// React 19 takes boolean `inert` / camelCase `fetchPriority`; React 18 needs the
// string / lowercase forms or it warns.
const REACT_19 = Number(version.split(".")[0]) >= 19;
const inertProps = (on: boolean) => (on ? { inert: (REACT_19 ? true : "") as unknown as boolean } : {});
const highPriority = REACT_19 ? { fetchPriority: "high" as const } : { fetchpriority: "high" };

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * A swipeable, accessible stack of tilted polaroid photos.
 *
 * @example
 * <PolaroidCarousel
 *   items={[{ src: "/beach.jpg", alt: "Beach at sunset", caption: "summer '25" }]}
 *   autoplay
 * />
 */
export function PolaroidCarousel(props: PolaroidCarouselProps): ReactElement {
  const {
    items,
    children,
    label,
    frame = "polaroid",
    spread = 118,
    fan = 6,
    tilt = 4,
    scale = 0.86,
    visible = 1,
    dots = true,
    arrows = false,
    priority = false,
    duration = 600,
    easing = "cubic-bezier(0.22, 1, 0.36, 1)",
    renderImage,
    renderSlide,
    onSlideClick,
    unstyled = false,
    className,
    style,
    classNames = {},
    labels: labelOverrides,
    direction = "ltr",
    ...carouselOptions
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const childSlides = Children.toArray(children);
  const count = items ? items.length : childSlides.length;
  const loop = carouselOptions.loop ?? true;

  // Drag moves the active card through CSS variables, so pointermove never re-renders.
  const stageRef = useRef<HTMLDivElement>(null);
  const onDragMove = useCallback((dx: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--rpc-drag", `${dx}px`);
    stage.style.setProperty("--rpc-drag-rotate", `${dx * 0.04}deg`);
  }, []);

  const { rootRef, ...carousel } = useCarousel({ ...carouselOptions, direction, count, onDragMove });
  const { index, reducedMotion, isDragging } = carousel;

  const stopRotation = () => {
    if (carousel.hasAutoplay && props.stopOnInteraction !== false && carousel.isRotationOn) carousel.toggleRotation();
  };
  const userGoTo = (target: number) => {
    carousel.goTo(target);
    stopRotation();
  };

  const forward = direction === "rtl" ? -1 : 1;
  const transition =
    reducedMotion ? "none" : `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;

  const mediaStyle = (item: PolaroidItem): CSSProperties => ({
    display: "block",
    width: "100%",
    aspectRatio: item.aspectRatio ?? "var(--rpc-aspect, 1)",
    objectFit: "cover",
    height: "auto",
    ...(unstyled ? {} : { borderRadius: frame === "polaroid" ? 2 : "var(--rpc-radius, 16px)" }),
  });

  const slides = [];
  for (let i = 0; i < count; i++) {
    const offset = slideOffset(i, index, count, loop);
    const distance = Math.abs(offset);
    // Render only what's on screen plus one card each side, so long lists stay cheap.
    if (distance > visible + 1) continue;
    const active = offset === 0;
    const isVisible = distance <= visible;
    const context: SlideContext = {
      index: i,
      offset,
      active,
      visible: isVisible,
      loading: priority && isVisible ? "eager" : "lazy",
    };
    const rotate = restingTilt(i, tilt) + offset * fan * forward;
    const x = offset * spread * forward;
    const item = items?.[i];

    const transform = active
      ? `translateX(calc(${x}% + var(--rpc-drag, 0px))) rotate(calc(${rotate}deg + var(--rpc-drag-rotate, 0deg)))`
      : `translateX(${x}%) rotate(${rotate}deg) scale(${scale})`;

    let content: ReactNode;
    if (item && renderSlide) content = renderSlide(item, context);
    else if (item) {
      content = (
        <>
          {renderImage ? (
            renderImage(item, context)
          ) : item.type === "video" && active ? (
            // Native controls keep moving content pausable (WCAG 2.2.2); reduced motion skips autoplay.
            <video
              key={item.src}
              src={item.src}
              poster={item.poster}
              aria-label={item.alt}
              autoPlay={!reducedMotion}
              muted
              loop
              playsInline
              controls
              className={classNames.image}
              style={mediaStyle(item)}
            />
          ) : (
            <img
              src={item.type === "video" ? (item.poster ?? "") : item.src}
              alt={item.alt}
              srcSet={item.type === "video" ? undefined : item.srcSet}
              sizes={item.sizes}
              width={item.width}
              height={item.height}
              loading={context.loading}
              decoding="async"
              draggable={false}
              className={classNames.image}
              style={mediaStyle(item)}
              {...(priority && active ? highPriority : {})}
            />
          )}
          {item.caption != null && (
            <p
              className={classNames.caption}
              style={
                unstyled
                  ? { margin: 0 }
                  : {
                      margin: frame === "polaroid" ? "10px 0 0" : "8px 0 0",
                      textAlign: "center",
                      lineHeight: 1.2,
                      fontSize: "var(--rpc-caption-size, 1.15rem)",
                      fontFamily:
                        "var(--rpc-caption-font, 'Segoe Print', 'Bradley Hand', 'Marker Felt', 'Comic Sans MS', cursive)",
                      color: "var(--rpc-caption-color, #1f1f1f)",
                    }
              }
            >
              {item.caption}
            </p>
          )}
        </>
      );
    } else content = childSlides[i];

    const framed =
      !unstyled && frame === "polaroid"
        ? {
            background: "var(--rpc-frame, #fff)",
            padding: "var(--rpc-frame-padding, 12px 12px 14px)",
            borderRadius: 4,
            boxShadow: "var(--rpc-shadow, 0 18px 40px rgb(0 0 0 / 0.22), 0 2px 6px rgb(0 0 0 / 0.08))",
          }
        : !unstyled
          ? { borderRadius: "var(--rpc-radius, 16px)", boxShadow: "var(--rpc-shadow, 0 18px 40px rgb(0 0 0 / 0.22))" }
          : {};

    slides.push(
      <div
        key={i}
        role="group"
        aria-roledescription="slide"
        aria-label={labels.slide(i + 1, count)}
        data-active={active || undefined}
        data-offset={offset}
        className={classNames.slide}
        onClick={active ? undefined : () => userGoTo(i)}
        style={{
          gridArea: "1 / 1",
          position: "relative",
          width: "var(--rpc-card-width, min(60%, 260px))",
          boxSizing: "border-box",
          transform,
          // Off-screen cards (opacity 0) may wrap around the stack; nobody sees them move.
          transition: active && isDragging ? "none" : transition,
          opacity: isVisible ? 1 : 0,
          zIndex: visible + 2 - distance,
          cursor: active ? (carousel.isDragging ? "grabbing" : "grab") : "pointer",
          pointerEvents: isVisible ? "auto" : "none",
          willChange: "transform",
          userSelect: "none",
          WebkitUserSelect: "none",
          ...framed,
        }}
      >
        <div className={classNames.frame} {...inertProps(!active)}>
          {content}
        </div>
        {active && onSlideClick && (
          <button
            type="button"
            className={classNames.openButton}
            aria-label={labels.open(i + 1, count)}
            data-rpc-open=""
            onClick={() => {
              // Opening a viewer is an interaction: don't let autoplay change the photo underneath it.
              stopRotation();
              onSlideClick(i);
            }}
            style={{ position: "absolute", inset: 0, padding: 0, border: 0, background: "transparent", cursor: "zoom-in", borderRadius: "inherit" }}
          />
        )}
      </div>,
    );
  }

  const current = items?.[index];
  const announcement = `${labels.slide(index + 1, count)}${current?.alt ? `: ${current.alt}` : ""}`;

  const buttonBase: CSSProperties = unstyled
    ? {}
    : {
        display: "grid",
        placeItems: "center",
        width: 36,
        height: 36,
        border: 0,
        borderRadius: 999,
        background: "var(--rpc-button-bg, rgb(0 0 0 / 0.55))",
        color: "var(--rpc-button-color, #fff)",
        cursor: "pointer",
      };

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={label ?? labels.carousel}
      dir={direction}
      className={[classNames.root, className].filter(Boolean).join(" ") || undefined}
      onMouseEnter={carousel.rootProps.onMouseEnter}
      onMouseLeave={carousel.rootProps.onMouseLeave}
      onFocus={carousel.rootProps.onFocus}
      onKeyDown={carousel.rootProps.onKeyDown}
      style={{ position: "relative", ...style }}
    >
      {carousel.hasAutoplay && (
        // APG: the rotation control comes first in tab order and is always visible.
        <button
          type="button"
          className={classNames.rotationButton}
          aria-label={carousel.isRotationOn ? labels.pause : labels.play}
          onClick={carousel.toggleRotation}
          style={{ position: "absolute", top: 8, right: 8, zIndex: visible + 3, ...buttonBase }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            {carousel.isRotationOn ? <path d="M3 2h3v10H3zM8 2h3v10H8z" /> : <path d="M3 1.5v11L12 7z" />}
          </svg>
        </button>
      )}

      <div
        ref={stageRef}
        className={classNames.stage}
        {...carousel.swipeProps}
        style={{
          ...carousel.swipeProps.style,
          display: "grid",
          justifyItems: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: "var(--rpc-stage-padding, 28px 0 36px)",
        }}
      >
        {slides}
      </div>

      {arrows && count > 1 && (
        <>
          {[
            { key: "prev", label: labels.previous, enabled: carousel.canPrev, go: () => userGoTo(index - 1), side: "left", d: "M9 2 4 7l5 5" },
            { key: "next", label: labels.next, enabled: carousel.canNext, go: () => userGoTo(index + 1), side: "right", d: "m5 2 5 5-5 5" },
          ].map((arrow) => (
            <button
              key={arrow.key}
              type="button"
              className={classNames.arrow}
              aria-label={arrow.label}
              disabled={!arrow.enabled}
              onClick={arrow.go}
              style={{
                position: "absolute",
                top: "50%",
                [arrow.side]: 8,
                transform: "translateY(-50%)",
                zIndex: visible + 3,
                ...buttonBase,
                ...(arrow.enabled ? {} : { opacity: 0.35, cursor: "default" }),
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={direction === "rtl" ? (arrow.key === "prev" ? "m5 2 5 5-5 5" : "M9 2 4 7l5 5") : arrow.d} />
              </svg>
            </button>
          ))}
        </>
      )}

      {dots && count > 1 && (
        <div
          className={classNames.dots}
          style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: unstyled ? 0 : -20 }}
        >
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              className={classNames.dot}
              aria-label={labels.goTo(i + 1)}
              aria-current={i === index ? "true" : undefined}
              onClick={() => userGoTo(i)}
              style={{
                display: "grid",
                placeItems: "center",
                minWidth: 24,
                height: 24,
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              {!unstyled && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "block",
                    height: 6,
                    width: i === index ? 18 : 6,
                    borderRadius: 999,
                    background: "var(--rpc-dot, currentColor)",
                    opacity: i === index ? 1 : 0.3,
                    transition: reducedMotion ? "none" : `width ${duration / 2}ms ${easing}, opacity ${duration / 2}ms`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <p aria-live={carousel.isPlaying ? "off" : "polite"} aria-atomic="true" style={srOnly}>
        {announcement}
      </p>
    </section>
  );
}
