"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefCallback,
} from "react";
import { normalizeIndex } from "./math.js";

export interface UseCarouselOptions {
  /** Number of slides. */
  count: number;
  /** Controlled active index. Pair with `onIndexChange`. */
  index?: number;
  /** Starting index when uncontrolled. @default 0 */
  defaultIndex?: number;
  /** Called with the new index whenever the user or autoplay changes slides. */
  onIndexChange?: (index: number) => void;
  /** Wrap from the last slide to the first and back. @default true */
  loop?: boolean;
  /**
   * Auto-advance. `true` uses 4000ms; a number sets the delay in ms.
   * Pauses on hover, while the tab is hidden, while scrolled off screen, and
   * stays paused after the user interacts (unless `stopOnInteraction` is false).
   * Starts paused when the OS asks for reduced motion.
   * @default false
   */
  autoplay?: boolean | number;
  /** Pause autoplay while the pointer is over the carousel. @default true */
  pauseOnHover?: boolean;
  /** Keep autoplay paused after a swipe, key press, dot click or keyboard focus. @default true */
  stopOnInteraction?: boolean;
  /** Enable swipe / drag to change slides. @default true */
  draggable?: boolean;
  /** Pixels a swipe must travel to change slides. @default 50 */
  swipeThreshold?: number;
  /** Arrow keys, Home and End change slides while focus is inside the carousel. @default true */
  keyboard?: boolean;
  /** Layout and gesture direction. @default "ltr" */
  direction?: "ltr" | "rtl";
  /**
   * Follow the OS reduced-motion setting ("user"), or force it on or off.
   * Reduced motion disables transitions and starts autoplay paused.
   * @default "user"
   */
  reducedMotion?: "user" | "always" | "never";
  /** Receives the live horizontal drag distance in px (0 when released). Use it to move slides without re-rendering. */
  onDragMove?: (dx: number) => void;
}

export interface CarouselApi {
  /** Active slide index. */
  index: number;
  count: number;
  loop: boolean;
  /** Go to a slide. Out-of-range values wrap (loop) or clamp. */
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  canPrev: boolean;
  canNext: boolean;
  /** Autoplay was configured (a delay is set). */
  hasAutoplay: boolean;
  /** Slides are advancing right now. */
  isPlaying: boolean;
  /** What the rotation button should offer: true means "pause". */
  isRotationOn: boolean;
  /** Start or stop autoplay (the APG "rotation control"). */
  toggleRotation: () => void;
  /** The user is mid-swipe. */
  isDragging: boolean;
  /** Reduced motion is in effect. */
  reducedMotion: boolean;
  /** Attach to the outer element (used to pause autoplay while it's off screen). */
  rootRef: RefCallback<HTMLElement>;
  /** Spread on the outer element: hover, focus and keyboard handlers. */
  rootProps: {
    onMouseEnter: (event: MouseEvent) => void;
    onMouseLeave: (event: MouseEvent) => void;
    onFocus: (event: FocusEvent) => void;
    onKeyDown: (event: KeyboardEvent) => void;
  };
  /** Spread on the element that receives swipes. */
  swipeProps: {
    onPointerDown: (event: PointerEvent) => void;
    onPointerMove: (event: PointerEvent) => void;
    onPointerUp: (event: PointerEvent) => void;
    onPointerCancel: (event: PointerEvent) => void;
    onClickCapture: (event: MouseEvent) => void;
    style: { touchAction: "pan-y" };
  };
}

type RotationState = "auto" | "playing" | "paused";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const isTextInput = (target: EventTarget) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * Headless carousel state: index, autoplay, swipe, keyboard and accessibility
 * rules, with no markup or styles. `<PolaroidCarousel>` is built on it; use it
 * directly to render a completely custom carousel.
 */
export function useCarousel(options: UseCarouselOptions): CarouselApi {
  const {
    count,
    index: controlledIndex,
    defaultIndex = 0,
    onIndexChange,
    loop = true,
    autoplay = false,
    pauseOnHover = true,
    stopOnInteraction = true,
    draggable = true,
    swipeThreshold = 50,
    keyboard = true,
    direction = "ltr",
    reducedMotion: reducedMotionMode = "user",
    onDragMove,
  } = options;

  const [uncontrolledIndex, setUncontrolledIndex] = useState(() => normalizeIndex(defaultIndex, count, loop));
  const isControlled = controlledIndex !== undefined;
  const index = normalizeIndex(isControlled ? controlledIndex : uncontrolledIndex, count, loop);

  // Server snapshot is `false`, so the first client render matches the HTML.
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const reducedMotion = reducedMotionMode === "always" || (reducedMotionMode === "user" && prefersReducedMotion);
  const pageHidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);

  const [rotation, setRotation] = useState<RotationState>("auto");
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const goTo = useCallback(
    (target: number) => {
      const next = normalizeIndex(target, count, loop);
      if (next === index) return;
      if (!isControlled) setUncontrolledIndex(next);
      onIndexChange?.(next);
    },
    [count, loop, index, isControlled, onIndexChange],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const delay = autoplay === true ? 4000 : typeof autoplay === "number" && autoplay > 0 ? autoplay : 0;
  const hasAutoplay = delay > 0 && count > 1;
  const isRotationOn = hasAutoplay && (rotation === "playing" || (rotation === "auto" && !reducedMotion));
  const isPlaying =
    isRotationOn && !(pauseOnHover && hovered) && !pageHidden && inView && !isDragging && (loop || index < count - 1);

  const interact = useCallback(() => {
    if (hasAutoplay && stopOnInteraction) setRotation("paused");
  }, [hasAutoplay, stopOnInteraction]);

  const toggleRotation = useCallback(() => setRotation(isRotationOn ? "paused" : "playing"), [isRotationOn]);

  // Autoplay: one timeout per slide, restarted whenever the slide changes.
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [isPlaying, next, delay, index]);

  // Pause while scrolled off screen (only needed when autoplay is on).
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rootRef = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!element || !hasAutoplay || typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)));
      observer.observe(element);
      observerRef.current = observer;
    },
    [hasAutoplay],
  );
  useEffect(() => () => observerRef.current?.disconnect(), []);

  const forward = direction === "rtl" ? -1 : 1;

  const rootProps: CarouselApi["rootProps"] = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: (event) => {
      // APG: keyboard focus inside the carousel stops rotation.
      if (event.target instanceof Element && event.target.matches(":focus-visible")) interact();
    },
    onKeyDown: (event) => {
      if (!keyboard || event.defaultPrevented || isTextInput(event.target)) return;
      const keys: Record<string, () => void> = {
        ArrowRight: () => goTo(index + forward),
        ArrowLeft: () => goTo(index - forward),
        Home: () => goTo(0),
        End: () => goTo(count - 1),
      };
      const action = keys[event.key];
      if (!action) return;
      event.preventDefault();
      interact();
      action();
    },
  };

  // Swipe: decide the axis after a few px so vertical page scrolls pass through
  // (touch-action: pan-y), and swallow the click that follows a real drag.
  const drag = useRef<{ id: number; x: number; y: number; dx: number; axis: "x" | "y" | null } | null>(null);
  const suppressClick = useRef(false);

  const endDrag = (event: PointerEvent, commit: boolean) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    if (state.axis !== "x") return;
    setIsDragging(false);
    onDragMove?.(0);
    suppressClick.current = true;
    setTimeout(() => (suppressClick.current = false), 0);
    if (!commit) return;
    if (state.dx * forward <= -swipeThreshold) next();
    else if (state.dx * forward >= swipeThreshold) prev();
  };

  const swipeProps: CarouselApi["swipeProps"] = {
    style: { touchAction: "pan-y" },
    onPointerDown: (event) => {
      if (!draggable || count < 2 || event.button !== 0) return;
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, axis: null };
    },
    onPointerMove: (event) => {
      const state = drag.current;
      if (!state || state.id !== event.pointerId) return;
      const dx = event.clientX - state.x;
      const dy = event.clientY - state.y;
      if (state.axis === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        state.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (state.axis === "y") return;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setIsDragging(true);
        interact();
      }
      if (state.axis !== "x") return;
      // Rubber-band at the ends when not looping.
      const atEdge = !loop && ((dx * forward > 0 && index === 0) || (dx * forward < 0 && index === count - 1));
      state.dx = atEdge ? dx / 3 : dx;
      onDragMove?.(state.dx);
    },
    onPointerUp: (event) => endDrag(event, true),
    onPointerCancel: (event) => endDrag(event, false),
    onClickCapture: (event) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  return {
    index,
    count,
    loop,
    goTo,
    next,
    prev,
    canPrev: loop ? count > 1 : index > 0,
    canNext: loop ? count > 1 : index < count - 1,
    hasAutoplay,
    isPlaying,
    isRotationOn,
    toggleRotation,
    isDragging,
    reducedMotion,
    rootRef,
    rootProps,
    swipeProps,
  };
}
