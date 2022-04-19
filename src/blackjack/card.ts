import { type Rank, rankToValues } from "./rank";
import type { Suit } from "./suit";

export type Card = {
  suit: Suit;
  rank: Rank;
};

/**
 * Calculates the possible values for a card
 * @param card The card to calculate values for
 * @returns A list of numbers representing the possible values of the card
 */
export const getValuesOfCard = ({ rank }: Card): number[] => {
  const values = rankToValues[rank];
  return values;
};
