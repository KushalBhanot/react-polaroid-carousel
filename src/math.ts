/** Wraps any integer into the range `0..count-1`. */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/** Keeps an index valid: wraps when looping, clamps otherwise. */
export function normalizeIndex(index: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  return loop ? wrapIndex(index, count) : Math.min(Math.max(index, 0), count - 1);
}

/**
 * Signed distance from the active slide to slide `index`.
 * `0` is the active slide, `-1` the one before it, `1` the one after it.
 * When looping, takes the shortest way round, so the last slide sits just
 * before the first one.
 */
export function slideOffset(index: number, active: number, count: number, loop: boolean): number {
  let offset = index - active;
  if (loop && count > 0) {
    if (offset > count / 2) offset -= count;
    else if (offset < -count / 2) offset += count;
  }
  return offset;
}

// Resting tilts (degrees, before scaling by the `tilt` prop), so the stack looks
// hand-placed. Fixed rather than random, so server and client render identically.
const TILT_PATTERN = [-1, 0.75, -0.5, 1.25, -0.75, 0.5];

/** Deterministic resting tilt for slide `index`, in degrees. */
export function restingTilt(index: number, tilt: number): number {
  return (TILT_PATTERN[index % TILT_PATTERN.length] ?? 0) * tilt;
}
