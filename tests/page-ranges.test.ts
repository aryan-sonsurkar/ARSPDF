import { describe, expect, it } from "vitest";
import { parsePageRanges } from "@/lib/pdf/ranges";

describe("parsePageRanges", () => {
  it("parses individual pages and ranges in order", () => {
    const result = parsePageRanges("1,3,5-8", 8);
    expect(result).toEqual({ ok: true, pages: [1, 3, 5, 6, 7, 8] });
  });

  it("removes duplicate selections while preserving order", () => {
    const result = parsePageRanges("3,1,1,2-3", 5);
    expect(result).toEqual({ ok: true, pages: [3, 1, 2] });
  });

  it("tolerates whitespace around commas and ranges", () => {
    const result = parsePageRanges(" 2 , 4 - 5 ", 6);
    expect(result).toEqual({ ok: true, pages: [2, 4, 5] });
  });

  it("rejects an empty selection", () => {
    const result = parsePageRanges("   ", 5);
    expect(result.ok).toBe(false);
  });

  it("rejects page zero", () => {
    const result = parsePageRanges("0,2", 5);
    expect(result.ok).toBe(false);
  });

  it("rejects pages beyond the document", () => {
    const result = parsePageRanges("2,9", 5);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("does not exist");
  });

  it("rejects a reversed range", () => {
    const result = parsePageRanges("5-3", 5);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("reversed");
  });

  it("rejects a range beyond the document", () => {
    const result = parsePageRanges("4-9", 8);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("beyond page 8");
  });

  it("rejects arbitrary text", () => {
    const result = parsePageRanges("first", 5);
    expect(result.ok).toBe(false);
  });

  it("rejects empty entries", () => {
    const result = parsePageRanges("1,,3", 5);
    expect(result.ok).toBe(false);
  });
});
