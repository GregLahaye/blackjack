import { Action } from "@/blackjack/action";
import { bustIfOverValue } from "./blackjack";
import type { Card } from "./card";
import { getValuesOfCards } from "./hand";

const standValue = 17;

export const getDealerActionForCards = (cards: Card[]) => {
  const handValues = getValuesOfCards(cards);
  for (const value of handValues) {
    if (value >= standValue && value <= bustIfOverValue) {
      return Action.STAND;
    }
  }

  return Action.HIT;
};
