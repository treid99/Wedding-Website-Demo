import { expect, test } from "@playwright/test";
import { paginate } from "@/lib/paginate";

const rows = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

test("slices the requested page", () => {
  const result = paginate(rows(191), 2, 50);
  expect(result.items).toHaveLength(50);
  expect(result.items[0]).toBe(51);
  expect(result.from).toBe(51);
  expect(result.to).toBe(100);
  expect(result.pageCount).toBe(4);
});

test("the last page is short, and `to` stops at the total", () => {
  const result = paginate(rows(191), 4, 50);
  expect(result.items).toHaveLength(41);
  expect(result.from).toBe(151);
  expect(result.to).toBe(191);
});

test("clamps a page past the end rather than returning nothing", () => {
  // Deep-linking to ?page=99 after a filter narrows the list has to land
  // somewhere real, not on an empty screen with no way back.
  const result = paginate(rows(60), 99, 50);
  expect(result.page).toBe(2);
  expect(result.items).toHaveLength(10);
});

test("clamps a page below 1", () => {
  expect(paginate(rows(60), 0, 50).page).toBe(1);
  expect(paginate(rows(60), -5, 50).page).toBe(1);
});

test("an empty list is one page reporting zero", () => {
  const result = paginate([], 1, 50);
  expect(result).toEqual({
    items: [],
    total: 0,
    page: 1,
    perPage: 50,
    pageCount: 1,
    from: 0,
    to: 0,
  });
});

test("a list shorter than one page is a single page", () => {
  const result = paginate(rows(31), 1, 50);
  expect(result.pageCount).toBe(1);
  expect(result.from).toBe(1);
  expect(result.to).toBe(31);
});

test("an exact multiple does not produce a trailing empty page", () => {
  expect(paginate(rows(100), 1, 50).pageCount).toBe(2);
});
