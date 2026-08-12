import { expect, test } from "@playwright/test";
import {
  envelopeName,
  formatPrice,
  parsePriceToCents,
  pluralize,
  toParagraphs,
} from "@/lib/format";

test.describe("formatPrice", () => {
  test("drops the cents on a whole dollar amount", () => {
    expect(formatPrice(4200)).toBe("$42");
    expect(formatPrice(129900)).toBe("$1,299");
  });

  test("keeps them when there are any", () => {
    expect(formatPrice(4250)).toBe("$42.50");
  });

  test("handles zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});

test.describe("parsePriceToCents", () => {
  test("accepts the shapes a human types", () => {
    expect(parsePriceToCents("42.50")).toBe(4250);
    expect(parsePriceToCents("$42.50")).toBe(4250);
    expect(parsePriceToCents("1,299")).toBe(129900);
    expect(parsePriceToCents("1299")).toBe(129900);
  });

  test("rounds rather than truncating", () => {
    expect(parsePriceToCents("0.005")).toBe(1);
  });

  test("returns null when there's no number in there", () => {
    expect(parsePriceToCents("")).toBeNull();
    expect(parsePriceToCents("free")).toBeNull();
  });

  test("round-trips with formatPrice", () => {
    expect(formatPrice(parsePriceToCents("$1,299.99")!)).toBe("$1,299.99");
  });
});

test.describe("envelopeName", () => {
  test("uses the override when there is one", () => {
    expect(
      envelopeName({ name: "The Mitchell Family", envelope_name: "Mr. & Mrs. David Mitchell" }),
    ).toBe("Mr. & Mrs. David Mitchell");
  });

  test("inherits the group name when blank", () => {
    expect(envelopeName({ name: "The Okonkwo Family", envelope_name: "" })).toBe(
      "The Okonkwo Family",
    );
  });

  test("treats whitespace as blank", () => {
    expect(envelopeName({ name: "James Whitfield", envelope_name: "   " })).toBe(
      "James Whitfield",
    );
  });

  test("tolerates a missing or null column", () => {
    expect(envelopeName({ name: "Nathan Reyes" })).toBe("Nathan Reyes");
    expect(envelopeName({ name: "Nathan Reyes", envelope_name: null })).toBe("Nathan Reyes");
  });
});

test.describe("toParagraphs", () => {
  test("splits on blank lines", () => {
    expect(toParagraphs("One.\n\nTwo.\n\n\nThree.")).toEqual(["One.", "Two.", "Three."]);
  });

  test("keeps single newlines inside a paragraph", () => {
    expect(toParagraphs("One.\nStill one.")).toEqual(["One.\nStill one."]);
  });

  test("drops empty input", () => {
    expect(toParagraphs("")).toEqual([]);
    expect(toParagraphs("\n\n  \n")).toEqual([]);
  });
});

test.describe("pluralize", () => {
  test("uses the singular only at exactly one", () => {
    expect(pluralize(1, "guest")).toBe("guest");
    expect(pluralize(0, "guest")).toBe("guests");
    expect(pluralize(2, "guest")).toBe("guests");
  });

  test("takes an irregular plural", () => {
    expect(pluralize(2, "party", "parties")).toBe("parties");
  });
});
