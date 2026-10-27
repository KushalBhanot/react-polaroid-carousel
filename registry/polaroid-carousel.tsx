"use client";

import type { CSSProperties } from "react";
import { PolaroidCarousel, type PolaroidCarouselProps } from "react-polaroid-carousel";

/**
 * react-polaroid-carousel, pre-themed with your shadcn/ui tokens.
 * Edit freely: every prop of <PolaroidCarousel> is available.
 * Docs: https://github.com/KushalBhanot/react-polaroid-carousel
 */
export function Polaroids({ className, style, ...props }: PolaroidCarouselProps) {
  return (
    <PolaroidCarousel
      className={["text-foreground", className].filter(Boolean).join(" ")}
      style={
        {
          "--rpc-frame": "var(--card)",
          "--rpc-caption-color": "var(--card-foreground)",
          "--rpc-button-bg": "var(--secondary)",
          "--rpc-button-color": "var(--secondary-foreground)",
          "--rpc-radius": "var(--radius)",
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
