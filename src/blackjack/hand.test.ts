import { expect } from "chai";
import { describe, it } from "vitest";
import { createArrayAddCombinations, getValuesOfCards } from "@/blackjack/hand";
import type { Card } from "./deck";

describe("getValuesOfCards Tests", () => {
  it("", () => {
    const cards: Card[] = [
      { suit: "diamnods", rank: "A" },
      { suit: "diamnods", rank: "3" },
      { suit: "hearts", rank: "A" },
    ];

    const hand = { cards };

    const values = getValuesOfCards(hand.cards);
    expect(values).to.deep.equal([5, 15, 15, 25]);
  });

  it("", () => {
    const arr0: number[] = [];
    const arr1: number[] = [3];

    const values = createArrayAddCombinations(arr0, arr1);
    expect(values).to.deep.equal([3]);
  });

  it("", () => {
    const arr0: number[] = [3];
    const arr1: number[] = [1, 11];

    const values = createArrayAddCombinations(arr0, arr1);
    expect(values).to.deep.equal([4, 14]);
  });

  it("", () => {
    const arr0: number[] = [4, 14];
    const arr1: number[] = [1, 11];

    const values = createArrayAddCombinations(arr0, arr1);
    expect(values).to.deep.equal([5, 15, 15, 25]);
  });
});
