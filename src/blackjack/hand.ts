import { Result } from "@/blackjack/result";
import { blackjackValue, bustIfOverValue } from "@/blackjack/blackjack";
import { type Card, getValuesOfCard } from "./card";

/**
 * Represents an actionable set of Cards
 */
export type Hand = {
  bet: number;
  cards: Card[];
  actionable: boolean;
  fresh: boolean;
  result: Result | undefined;
};

export const getResultedHand = (hand: Hand): Hand => {
  const result = getResultOfHand(hand);

  switch (result) {
    case Result.BLACKJACK:
      hand.actionable = false;
      hand.result = Result.BLACKJACK;
      break;

    case Result.BUST:
      hand.actionable = false;
      hand.result = Result.BUST;
      break;
  }

  return hand;
};

export const getResultedHandWithoutBlackjack = (hand: Hand): Hand => {
  const result = getResultOfHand(hand);

  switch (result) {
    case Result.BUST:
      hand.actionable = false;
      hand.result = Result.BUST;
      break;
  }

  return hand;
};

export const getResultOfHand = ({ cards }: Hand): Result | undefined => {
  const values = getValuesOfCards(cards);

  const bust = values.every((value) => value > bustIfOverValue);
  if (bust) {
    return Result.BUST;
  }

  const blackjack = values.some((value) => value === blackjackValue);
  if (blackjack) {
    return Result.BLACKJACK;
  }
};

/**
 * Calculates the possible values for cards
 * @param cards The cards to calculate values for
 * @returns A list of numbers representing the possible values of the cards
 */
export const getValuesOfCards = (cards: Card[]): number[] => {
  let currentValues: number[] = [];

  for (const card of cards) {
    const cardValues = getValuesOfCard(card);
    currentValues = createArrayAddCombinations(currentValues, cardValues);
  }

  return currentValues;
};

export const createArrayAddCombinations = (
  arr0: number[],
  arr1: number[]
): number[] => {
  const values: number[] = [];

  /* if only one array has values, return that */
  if (arr0.length === 0 || arr1.length === 0) {
    return arr0.length > 0 ? [...arr0] : [...arr1];
  }

  for (const i of arr0) {
    for (const j of arr1) {
      const value = i + j;
      values.push(value);
    }
  }

  return values;
};
