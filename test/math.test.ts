import { describe, expect, it } from "vitest";
import { normalizeIndex, slideOffset, wrapIndex } from "../src/math.js";

describe("wrapIndex", () => {
  it("wraps positive and negative indexes", () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(12, 5)).toBe(2);
  });
  it("returns 0 for empty lists", () => expect(wrapIndex(3, 0)).toBe(0));
});

describe("normalizeIndex", () => {
  it("wraps when looping and clamps otherwise", () => {
    expect(normalizeIndex(-1, 4, true)).toBe(3);
    expect(normalizeIndex(-1, 4, false)).toBe(0);
    expect(normalizeIndex(9, 4, false)).toBe(3);
  });
});

describe("slideOffset", () => {
  it("is signed distance from the active slide", () => {
    expect(slideOffset(3, 1, 10, false)).toBe(2);
    expect(slideOffset(0, 2, 10, false)).toBe(-2);
  });
  it("takes the shortest way round when looping", () => {
    expect(slideOffset(4, 0, 5, true)).toBe(-1);
    expect(slideOffset(0, 4, 5, true)).toBe(1);
  });
  it("does not wrap when not looping", () => expect(slideOffset(4, 0, 5, false)).toBe(4));
});
