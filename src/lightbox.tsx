"use client";

import { useEffect, useRef, type CSSProperties, type ReactElement, type ReactNode } from "react";
import type { PolaroidItem } from "./PolaroidCarousel.js";
import { useCarousel } from "./use-carousel.js";

export interface PolaroidLightboxLabels {
  /** Accessible name of the dialog. */
  dialog: string;
  close: string;
  previous: string;
  next: string;
  position: (position: number, total: number) => string;
}

export interface PolaroidLightboxProps {
  /** The same items you pass to `PolaroidCarousel`. */
  items: readonly PolaroidItem[];
  /** Show the lightbox. */
  open: boolean;
  /** Called when the user closes it (close button, Esc, or a click on the backdrop). */
  onClose: () => void;
  /** Slide to show. Share it with the carousel so both stay in sync. */
  index: number;
  /** Called when the user moves to another slide. */
  onIndexChange?: (index: number) => void;
  /** Wrap from the last slide to the first and back. @default true */
  loop?: boolean;
  /** Replace the full-size `<img>` / `<video>`. */
  renderImage?: (item: PolaroidItem, context: { index: number }) => ReactNode;
  className?: string;
  /** Styles for the dialog. Its default background is `--rpc-lightbox-bg`. */
  style?: CSSProperties;
  /** Override any text (for i18n). */
  labels?: Partial<PolaroidLightboxLabels>;
}

const DEFAULT_LABELS: PolaroidLightboxLabels = {
  dialog: "Photo viewer",
  close: "Close",
  previous: "Previous photo",
  next: "Next photo",
  position: (position, total) => `${position} of ${total}`,
};

const button: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 44,
  height: 44,
  border: 0,
  borderRadius: 999,
  background: "var(--rpc-button-bg, rgb(255 255 255 / 0.14))",
  color: "var(--rpc-button-color, #fff)",
  cursor: "pointer",
};

const icon = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d={d} />
  </svg>
);

/**
 * A full-screen viewer for carousel items, built on the native `<dialog>` element
 * (focus trap, Esc to close and focus return come from the browser).
 *
 * @example
 * const [index, setIndex] = useState(0);
 * const [open, setOpen] = useState(false);
 * <PolaroidCarousel items={items} index={index} onIndexChange={setIndex} onSlideClick={() => setOpen(true)} />
 * <PolaroidLightbox items={items} index={index} onIndexChange={setIndex} open={open} onClose={() => setOpen(false)} />
 */
export function PolaroidLightbox(props: PolaroidLightboxProps): ReactElement {
  const { items, open, onClose, index, onIndexChange, loop = true, renderImage, className, style } = props;
  const labels = { ...DEFAULT_LABELS, ...props.labels };
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { rootRef, ...carousel } = useCarousel({ count: items.length, index, onIndexChange, loop });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const carousel = opener?.closest('[aria-roledescription="carousel"]');
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    // Keep the page behind from scrolling while the viewer is open.
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
      if (dialog.open) {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      }
      // The browser returns focus to the opener; if the user moved to another photo,
      // that card's button is gone, so focus the carousel's current one instead.
      if (opener && !opener.isConnected) carousel?.querySelector<HTMLElement>("[data-rpc-open]")?.focus();
      else opener?.focus();
    };
  }, [open]);

  const item = items[carousel.index];
  // Media shrinks to fit the space left after the toolbar, caption and buttons.
  const media: CSSProperties = { display: "block", flex: "0 1 auto", minHeight: 0, maxWidth: "100%", maxHeight: "100%", objectFit: "contain" };

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.dialog}
      className={className}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog itself (not its content) is a click on the backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={carousel.rootProps.onKeyDown}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        maxWidth: "none",
        maxHeight: "none",
        margin: 0,
        padding: 16,
        border: 0,
        boxSizing: "border-box",
        background: "var(--rpc-lightbox-bg, rgb(10 10 10 / 0.97))",
        color: "#fff",
        ...style,
      }}
    >
      {open && item && (
        <div style={{ display: "grid", gridTemplateRows: "auto minmax(0, 1fr) auto", height: "100%", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span aria-live="polite" style={{ fontSize: 14, opacity: 0.8 }}>
              {labels.position(carousel.index + 1, items.length)}
            </span>
            <button type="button" aria-label={labels.close} onClick={onClose} style={button}>
              {icon("m3 3 8 8M11 3l-8 8")}
            </button>
          </div>

          <figure
            ref={rootRef}
            {...carousel.swipeProps}
            style={{
              ...carousel.swipeProps.style,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 0,
              overflow: "hidden",
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
          >
            {renderImage ? (
              renderImage(item, { index: carousel.index })
            ) : item.type === "video" ? (
              <video key={item.src} src={item.src} poster={item.poster} aria-label={item.alt} controls autoPlay playsInline style={media} />
            ) : (
              <img key={item.src} src={item.src} srcSet={item.srcSet} alt={item.alt} draggable={false} style={media} />
            )}
            {item.caption != null && (
              <figcaption style={{ flex: "none", textAlign: "center", fontSize: "var(--rpc-caption-size, 1.15rem)" }}>{item.caption}</figcaption>
            )}
          </figure>

          {items.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button type="button" aria-label={labels.previous} disabled={!carousel.canPrev} onClick={carousel.prev} style={{ ...button, opacity: carousel.canPrev ? 1 : 0.35 }}>
                {icon("M9 2 4 7l5 5")}
              </button>
              <button type="button" aria-label={labels.next} disabled={!carousel.canNext} onClick={carousel.next} style={{ ...button, opacity: carousel.canNext ? 1 : 0.35 }}>
                {icon("m5 2 5 5-5 5")}
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
