import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PolaroidCarousel, type PolaroidItem } from "../src/index.js";

const items: PolaroidItem[] = [
  { src: "/a.jpg", alt: "Alpha", caption: "first" },
  { src: "/b.jpg", alt: "Bravo", caption: "second" },
  { src: "/c.jpg", alt: "Charlie", caption: "third" },
  { src: "/d.jpg", alt: "Delta", caption: "fourth" },
];

let reducedMotion = false;
beforeEach(() => {
  reducedMotion = false;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("reduce") ? reducedMotion : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const activeSlide = () => document.querySelector("[data-active]") as HTMLElement;
const activeLabel = () => activeSlide().getAttribute("aria-label");

describe("PolaroidCarousel", () => {
  it("follows the APG carousel structure", () => {
    render(<PolaroidCarousel items={items} label="Trip photos" />);
    const region = screen.getByRole("region", { name: "Trip photos" });
    expect(region.getAttribute("aria-roledescription")).toBe("carousel");
    const slides = screen.getAllByRole("group");
    expect(slides[0]?.getAttribute("aria-roledescription")).toBe("slide");
    expect(activeLabel()).toBe("1 of 4");
  });

  it("makes only the active slide reachable, without aria-hidden", () => {
    render(<PolaroidCarousel items={items} />);
    const inner = [...document.querySelectorAll("[role=group] > div")];
    expect(inner.filter((el) => el.hasAttribute("inert"))).toHaveLength(inner.length - 1);
    expect(document.querySelector("[aria-hidden=true] img")).toBeNull();
    expect(screen.getByRole("img", { name: "Alpha" })).toBeTruthy();
  });

  it("navigates with dots and announces the change", () => {
    const onIndexChange = vi.fn();
    render(<PolaroidCarousel items={items} onIndexChange={onIndexChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(activeLabel()).toBe("3 of 4");
    expect(screen.getByRole("button", { name: "Go to slide 3" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByText("3 of 4: Charlie").getAttribute("aria-live")).toBe("polite");
  });

  it("supports arrow keys, Home and End, looping by default", () => {
    render(<PolaroidCarousel items={items} />);
    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(activeLabel()).toBe("4 of 4");
    fireEvent.keyDown(region, { key: "Home" });
    expect(activeLabel()).toBe("1 of 4");
    fireEvent.keyDown(region, { key: "End" });
    expect(activeLabel()).toBe("4 of 4");
  });

  it("clamps at the ends when loop is false", () => {
    render(<PolaroidCarousel items={items} loop={false} arrows />);
    expect((screen.getByRole("button", { name: "Previous slide" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowLeft" });
    expect(activeLabel()).toBe("1 of 4");
  });

  it("reverses arrow keys in RTL", () => {
    render(<PolaroidCarousel items={items} direction="rtl" />);
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowLeft" });
    expect(activeLabel()).toBe("2 of 4");
  });

  it("works controlled", () => {
    function Controlled() {
      const [index, setIndex] = useState(1);
      return (
        <>
          <PolaroidCarousel items={items} index={index} onIndexChange={setIndex} />
          <output>{index}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(activeLabel()).toBe("2 of 4");
    fireEvent.click(screen.getByRole("button", { name: "Go to slide 4" }));
    expect(screen.getByText("3", { selector: "output" })).toBeTruthy();
    expect(activeLabel()).toBe("4 of 4");
  });

  it("ignores index changes the parent rejects when controlled", () => {
    render(<PolaroidCarousel items={items} index={0} onIndexChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to slide 2" }));
    expect(activeLabel()).toBe("1 of 4");
  });

  describe("autoplay", () => {
    it("advances on a timer and offers a pause control first in tab order", () => {
      vi.useFakeTimers();
      render(<PolaroidCarousel items={items} autoplay={1000} />);
      const firstButton = screen.getAllByRole("button")[0];
      expect(firstButton?.getAttribute("aria-label")).toBe("Pause slide rotation");
      act(() => vi.advanceTimersByTime(1000));
      expect(activeLabel()).toBe("2 of 4");
      expect(screen.getByText("2 of 4: Bravo").getAttribute("aria-live")).toBe("off");
    });

    it("pauses while hovered and resumes after", () => {
      vi.useFakeTimers();
      render(<PolaroidCarousel items={items} autoplay={1000} />);
      fireEvent.mouseEnter(screen.getByRole("region"));
      act(() => vi.advanceTimersByTime(3000));
      expect(activeLabel()).toBe("1 of 4");
      fireEvent.mouseLeave(screen.getByRole("region"));
      act(() => vi.advanceTimersByTime(1000));
      expect(activeLabel()).toBe("2 of 4");
    });

    it("stays paused after the user interacts", () => {
      vi.useFakeTimers();
      render(<PolaroidCarousel items={items} autoplay={1000} />);
      fireEvent.click(screen.getByRole("button", { name: "Go to slide 3" }));
      act(() => vi.advanceTimersByTime(5000));
      expect(activeLabel()).toBe("3 of 4");
      expect(screen.getByRole("button", { name: "Start slide rotation" })).toBeTruthy();
    });

    it("toggles with the rotation control", () => {
      vi.useFakeTimers();
      render(<PolaroidCarousel items={items} autoplay={1000} />);
      fireEvent.click(screen.getByRole("button", { name: "Pause slide rotation" }));
      act(() => vi.advanceTimersByTime(3000));
      expect(activeLabel()).toBe("1 of 4");
      fireEvent.click(screen.getByRole("button", { name: "Start slide rotation" }));
      act(() => vi.advanceTimersByTime(1000));
      expect(activeLabel()).toBe("2 of 4");
    });

    it("starts paused when the OS asks for reduced motion", () => {
      vi.useFakeTimers();
      reducedMotion = true;
      render(<PolaroidCarousel items={items} autoplay={1000} />);
      act(() => vi.advanceTimersByTime(3000));
      expect(activeLabel()).toBe("1 of 4");
      expect(screen.getByRole("button", { name: "Start slide rotation" })).toBeTruthy();
      expect(activeSlide().style.transition).toBe("none");
    });
  });

  it("renders only nearby slides for long lists", () => {
    const many = Array.from({ length: 200 }, (_, i) => ({ src: `/${i}.jpg`, alt: `Photo ${i}` }));
    render(<PolaroidCarousel items={many} dots={false} />);
    expect(screen.getAllByRole("group")).toHaveLength(5);
  });

  it("lazy-loads images unless priority is set", () => {
    const { unmount } = render(<PolaroidCarousel items={items} />);
    expect(screen.getByRole("img", { name: "Alpha" }).getAttribute("loading")).toBe("lazy");
    unmount();
    render(<PolaroidCarousel items={items} priority />);
    const active = screen.getByRole("img", { name: "Alpha" });
    expect(active.getAttribute("loading")).toBe("eager");
    expect(active.getAttribute("fetchpriority")).toBe("high");
  });

  it("lets a photo set its own aspect ratio", () => {
    render(<PolaroidCarousel items={[{ src: "/w.jpg", alt: "Wide", aspectRatio: "4 / 3" }, ...items]} />);
    expect(screen.getByRole("img", { name: "Wide" }).style.aspectRatio).toBe("4 / 3");
  });

  it("accepts custom slides as children", () => {
    render(
      <PolaroidCarousel frame="none">
        <div>One</div>
        <div>Two</div>
      </PolaroidCarousel>,
    );
    expect(screen.getByText("One")).toBeTruthy();
    expect(activeLabel()).toBe("1 of 2");
  });

  it("lets renderImage replace the img (e.g. next/image)", () => {
    render(<PolaroidCarousel items={items} renderImage={(item, ctx) => <span data-testid={`img-${ctx.index}`}>{item.alt}</span>} />);
    expect(screen.getByTestId("img-0").textContent).toBe("Alpha");
    expect(document.querySelector("img")).toBeNull();
  });

  it("applies slot class names and supports unstyled", () => {
    render(<PolaroidCarousel items={items} unstyled classNames={{ root: "r", slide: "s", dot: "d" }} />);
    expect(screen.getByRole("region").className).toBe("r");
    expect(activeSlide().className).toBe("s");
    expect(activeSlide().style.background).toBe("");
  });

  it("translates every label", () => {
    render(
      <PolaroidCarousel
        items={items}
        labels={{ carousel: "Fotos", slide: (n, t) => `${n} de ${t}`, goTo: (n) => `Ir a ${n}` }}
      />,
    );
    expect(screen.getByRole("region", { name: "Fotos" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ir a 2" })).toBeTruthy();
    expect(activeLabel()).toBe("1 de 4");
  });
});
