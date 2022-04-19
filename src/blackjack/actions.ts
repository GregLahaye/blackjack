import { Action } from "@/blackjack/action";
import { takeCard } from "@/blackjack/deck";
import type { Hand } from "@/blackjack/hand";
import type { Card } from "./card";

type ActionFunctionInput = {
  deck: Card[];
  hand: Hand;
};

type ActionFunctionOutput = {
  hands: Hand[];
};

type ActionFunction = (options: ActionFunctionInput) => ActionFunctionOutput;

export const getFunctionForAction = (action: Action): ActionFunction => {
  switch (action) {
    case Action.STAND:
      return stand;
    case Action.HIT:
      return hit;
    case Action.DOUBLE:
      return double;
    case Action.SPLIT:
      return split;
    default:
      throw new Error("Unexpected action");
  }
};

const stand = ({ hand }: ActionFunctionInput) => {
  hand.actionable = false;
  hand.fresh = false;

  const hands = [hand];

  return { hands };
};

const hit = ({ deck, hand }: ActionFunctionInput) => {
  const card = takeCard(deck);
  hand.cards.push(card);
  hand.fresh = false;

  const hands = [hand];

  return { hands };
};

const double = ({ deck, hand }: ActionFunctionInput) => {
  const canDouble = hand.fresh;
  if (!canDouble) {
    throw new Error("Cannot double");
  }

  const card = takeCard(deck);
  hand.cards.push(card);

  hand.bet *= 2;
  hand.actionable = false;
  hand.fresh = false;

  const hands = [hand];

  return { hands };
};

const split = ({ hand }: ActionFunctionInput) => {
  if (hand.cards.length !== 2) {
    throw new Error("Cannot split hand");
  }

  const cardsAreSame = hand.cards.every(
    (card) => card.rank === hand.cards[0].rank
  );
  if (!cardsAreSame) {
    throw new Error("Cannot split hand");
  }

  const hands = hand.cards.map((card) => ({
    bet: hand.bet,
    cards: [card],
    actionable: true,
    result: hand.result,
    fresh: true,
  }));

  return { hands };
};
