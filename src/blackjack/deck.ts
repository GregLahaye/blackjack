import type { Card } from "./card";
import { ranks } from "./rank";
import { suits } from "./suit";

/**
 * Creates a list of cards representing a standard playing deck
 * @returns A list of Cards
 */
export const createDeck = (): Card[] => {
  const cards: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      const card: Card = { suit, rank };
      cards.push(card);
    }
  }

  return cards;
};

/**
 * Shuffles a deck of cards in place, returning a reference to the same array.
 * @param cards The deck of cards to be shuffled
 * @returns A reference to the given array
 */
export const shuffleDeck = (cards: Card[]): Card[] => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

/**
 * Removes cards from the deck and returns them
 * @param cards The deck of cards to take from
 * @param n The number of cards to take
 * @returns The taken cards
 */
export const takeCards = (cards: Card[], n: number): Card[] => {
  const taken: Card[] = [];
  for (let i = 0; i < n; i++) {
    const card = takeCard(cards);
    taken.push(card);
  }
  return taken;
};

/**
 * Removes a card from the deck and returns it
 * @param cards The deck of cards to take from
 * @returns The taken card
 */
export const takeCard = (cards: Card[]): Card => {
  const card = cards.pop();

  if (card === undefined) {
    throw new Error("Deck is empty");
  }

  return card;
};
