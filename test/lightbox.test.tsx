import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PolaroidLightbox } from "../src/lightbox.js";
import type { PolaroidItem } from "../src/index.js";

const items: PolaroidItem[] = [
  { src: "/a.jpg", alt: "Alpha", caption: "first" },
  { src: "/b.jpg", alt: "Bravo" },
  { src: "/c.mp4", alt: "Clip", type: "video", poster: "/c.jpg" },
];

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});
afterEach(cleanup);

const dialog = () => document.querySelector("dialog") as HTMLDialogElement;

describe("PolaroidLightbox", () => {
  it("renders an empty, closed dialog until opened", () => {
    render(<PolaroidLightbox items={items} index={0} open={false} onClose={() => {}} />);
    expect(dialog().open).toBe(false);
    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
  });

  it("opens on the given slide with its caption and position", () => {
    render(<PolaroidLightbox items={items} index={0} open onClose={() => {}} />);
    expect(dialog().open).toBe(true);
    expect(dialog().getAttribute("aria-label")).toBe("Photo viewer");
    expect(screen.getByRole("img", { name: "Alpha" })).toBeTruthy();
    expect(screen.getByText("first")).toBeTruthy();
    expect(screen.getByText("1 of 3")).toBeTruthy();
  });

  it("moves with buttons and arrow keys", () => {
    const onIndexChange = vi.fn();
    render(<PolaroidLightbox items={items} index={0} open onClose={() => {}} onIndexChange={onIndexChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
  });

  it("closes from the close button and the backdrop", () => {
    const onClose = vi.fn();
    render(<PolaroidLightbox items={items} index={1} open onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(dialog());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("shows videos with controls", () => {
    render(<PolaroidLightbox items={items} index={2} open onClose={() => {}} />);
    const video = document.querySelector("video") as HTMLVideoElement;
    expect(video.getAttribute("poster")).toBe("/c.jpg");
    expect(video.hasAttribute("controls")).toBe(true);
  });

  it("locks page scroll while open", () => {
    const { rerender } = render(<PolaroidLightbox items={items} index={0} open onClose={() => {}} />);
    expect(document.documentElement.style.overflow).toBe("hidden");
    rerender(<PolaroidLightbox items={items} index={0} open={false} onClose={() => {}} />);
    expect(document.documentElement.style.overflow).toBe("");
    expect(dialog().open).toBe(false);
  });
});

describe("with PolaroidCarousel", () => {
  it("returns focus to the carousel's current card after browsing", async () => {
    const { useState } = await import("react");
    const { PolaroidCarousel } = await import("../src/index.js");
    function Gallery() {
      const [index, setIndex] = useState(0);
      const [open, setOpen] = useState(false);
      return (
        <>
          <PolaroidCarousel items={items} index={index} onIndexChange={setIndex} onSlideClick={() => setOpen(true)} />
          <PolaroidLightbox items={items} index={index} onIndexChange={setIndex} open={open} onClose={() => setOpen(false)} />
        </>
      );
    }
    render(<Gallery />);
    const opener = screen.getByRole("button", { name: "Open slide 1" });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Open slide 2");
  });
});
