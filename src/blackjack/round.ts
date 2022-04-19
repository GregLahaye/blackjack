import { createDeck, shuffleDeck, takeCards } from "@/blackjack/deck";
import {
  getResultedHand,
  getResultedHandWithoutBlackjack,
  getValuesOfCards,
  type Hand,
} from "@/blackjack/hand";
import { getDealerActionForCards } from "./dealer";
import type { Action } from "@/blackjack/action";
import { getFunctionForAction } from "./actions";
import type { Card } from "./card";
import { blackjackValue, bustIfOverValue, initialCardCount } from "./blackjack";
import { Result } from "./result";

export class Round {
  private deck: Card[];
  public humanHands: Hand[];
  public dealerHand: Hand;

  constructor() {
    this.deck = createDeck();
    shuffleDeck(this.deck);

    this.humanHands = [dealHand(this.deck)];
    this.dealerHand = dealHand(this.deck);
    this.humanHands = this.humanHands.map((hand) => getResultedHand(hand));
    this.dealerHand = getResultedHand(this.dealerHand);
  }

  public get humanHasActionableHands() {
    return this.humanActionableHands.length > 0;
  }

  private get humanActionableHands() {
    const actionableHands = this.humanHands.filter(
      ({ actionable }) => actionable
    );
    return actionableHands;
  }

  public get currentHandIndex() {
    const handsCount = this.humanHands.length;
    const actionableHandsCount = this.humanActionableHands.length;
    const unactionableHandsCount = handsCount - actionableHandsCount;
    return unactionableHandsCount;
  }

  public get dealerHasActionableHand() {
    return this.dealerHand.actionable;
  }

  public human(action: Action) {
    const currentHandIndex = this.currentHandIndex;
    const currentHand = this.humanHands[currentHandIndex];
    const fn = getFunctionForAction(action);
    const { hands } = fn({ deck: this.deck, hand: currentHand });

    const resultedHands = hands.map((hand) =>
      getResultedHandWithoutBlackjack(hand)
    );
    this.humanHands.splice(currentHandIndex, 1, ...resultedHands);
  }

  public dealer() {
    const dealerAction = getDealerActionForCards(this.dealerHand.cards);
    const fn = getFunctionForAction(dealerAction);
    const { hands } = fn({ deck: this.deck, hand: this.dealerHand });
    this.dealerHand = hands[0];
    this.dealerHand = getResultedHand(this.dealerHand);
  }

  public resultHands() {
    const hands = [...this.humanHands, this.dealerHand];
    const nonResultedHands = hands.filter(({ result }) => result === undefined);
    for (const hand of nonResultedHands) {
      const result = getResultAgainstDealer({
        humanHand: hand,
        dealerHand: this.dealerHand,
      });

      hand.actionable = false;
      hand.result = result;
    }
  }
}

const dealHand = (deck: Card[]): Hand => {
  const cards = takeCards(deck, initialCardCount);
  return { bet: 10, cards, actionable: true, result: undefined, fresh: true };
};

const getResultAgainstDealer = ({
  humanHand,
  dealerHand,
}: {
  humanHand: Hand;
  dealerHand: Hand;
}): Result => {
  const humanHandValues = getValuesOfCards(humanHand.cards);
  const dealerHandValues = getValuesOfCards(dealerHand.cards);

  /* blackjack checks */
  const isHumanBlackack = humanHandValues.some(
    (value) => value === blackjackValue
  );
  const isDealerBlackack = dealerHandValues.some(
    (value) => value === blackjackValue
  );

  if (isHumanBlackack && isDealerBlackack) {
    return Result.PUSH;
  } else if (isHumanBlackack) {
    return Result.WIN;
  } else if (isDealerBlackack) {
    return Result.LOSS;
  }

  /* bust checks */
  const isHumanBust = humanHandValues.every(
    (value) => value >= bustIfOverValue
  );
  const isDealerBust = dealerHandValues.every(
    (value) => value >= bustIfOverValue
  );

  if (isHumanBust) {
    return Result.BUST;
  } else if (isDealerBust) {
    return Result.WIN;
  }

  /* value comparison checks */
  const acceptableHumanHandValues = humanHandValues.filter(
    (value) => value <= bustIfOverValue
  );
  const acceptableDealerHandValues = dealerHandValues.filter(
    (value) => value <= bustIfOverValue
  );
  const maxHumanValue = Math.max(...acceptableHumanHandValues);
  const maxDealerValue = Math.max(...acceptableDealerHandValues);

  if (maxHumanValue === maxDealerValue) {
    return Result.PUSH;
  } else if (maxHumanValue > maxDealerValue) {
    return Result.WIN;
  } else {
    return Result.LOSS;
  }

  throw new Error("Invalid game state");
};
