import { expect } from "chai";
import { describe, it } from "vitest";
import { Action } from "@/blackjack/action";
import type { Rank } from "./rank";
import type { Card } from "./deck";
import { getDealerActionForCards } from "./dealer";

describe("getDealerActionForCards Tests", () => {
  const testCases: { name: string; action: Action; ranks: Rank[] }[] = [
    {
      name: "",
      action: Action.HIT,
      ranks: ["A", "A", "3"],
    },
    {
      name: "",
      action: Action.STAND,
      ranks: ["A", "10"],
    },
    {
      name: "",
      action: Action.HIT,
      ranks: ["A", "5"],
    },
    {
      name: "",
      action: Action.HIT,
      ranks: ["A", "A"],
    },
    {
      name: "",
      action: Action.HIT,
      ranks: ["A", "10", "A"],
    },
  ];

  for (const { name, action, ranks } of testCases) {
    it(name, () => {
      const cards: Card[] = ranks.map((rank) => ({ rank, suit: "diamonds" }));
      const actual = getDealerActionForCards(cards);
      expect(actual).to.equal(action);
    });
  }
});
