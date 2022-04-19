<script lang="ts">
import { Action } from "@/blackjack/action";
import { Round } from "@/blackjack/round";
import { Result } from "@/blackjack/result";
import { createWallet } from "@/wallet/wallet";
import type { Wallet } from "@/wallet/wallet";
import Card from "../components/Card.vue";

export default {
  data(): {
    round: Round | undefined;
    currentHandIndex: number;
    humanHasActionableHands: boolean;
    canDouble: boolean;
    canSplit: boolean;
    isRoundEnded: boolean;
    isDealerBust: boolean;
    wallet: Wallet;
    roundStartBalance: number;
    empty: boolean;
  } {
    return {
      round: undefined,
      currentHandIndex: 0,
      humanHasActionableHands: true,
      canDouble: false,
      canSplit: false,
      isRoundEnded: true,
      isDealerBust: false,
      wallet: createWallet(),
      roundStartBalance: 0,
      empty: true,
    };
  },
  methods: {
    deal() {
      this.empty = false;
      this.roundStartBalance = this.wallet.balance;
      this.round = new Round();
      this.currentHandIndex = 0;
      this.humanHasActionableHands = true;
      this.isRoundEnded = false;
      this.isDealerBust = false;
      this.postActionCheck();
    },
    updateBalance() {
      const totalBet = this.round.humanHands.reduce(
        (sum, { bet }) => sum + bet,
        0
      );
      const balance = this.roundStartBalance - totalBet;
      this.wallet.balance = balance;
    },
    postActionCheck() {
      this.currentHandIndex = this.round.currentHandIndex;
      this.humanHasActionableHands = this.round.humanHasActionableHands;
      this.updateButtons();
      this.updateBalance();
      if (this.humanHasActionableHands === false) {
        while (this.round.dealerHasActionableHand) {
          this.round.dealer();
        }
        this.round.resultHands();
        if (!this.isRoundEnded) {
          this.updateFinalBalance();
        }
        this.isRoundEnded = true;
        this.isDealerBust = this.round.dealerHand.result === Result.BUST;
      }
    },
    updateFinalBalance() {
      const blackjackHands = this.round.humanHands.filter(
        ({ result }) => result === Result.BLACKJACK
      );
      const winningHands = this.round.humanHands.filter(
        ({ result }) => result === Result.WIN
      );
      const drawingHands = this.round.humanHands.filter(
        ({ result }) => result === Result.PUSH
      );
      const blackjackBalance = blackjackHands.reduce(
        (sum, { bet }) => sum + bet * 2.5,
        0
      );
      const winBalance = winningHands.reduce(
        (sum, { bet }) => sum + bet * 2,
        0
      );
      const drawBalance = drawingHands.reduce((sum, { bet }) => sum + bet, 0);
      this.wallet.balance += blackjackBalance + winBalance + drawBalance;
    },
    updateButtons() {
      const currentHumanHand = this.round.humanHands[this.currentHandIndex];
      this.canDouble = currentHumanHand?.fresh;
      const currentHandCount = currentHumanHand?.cards.length;
      const cardsAreSame = currentHumanHand?.cards.every(
        (card) => card.rank === currentHumanHand?.cards[0].rank
      );
      this.canSplit = currentHandCount === 2 && cardsAreSame;
    },
    stand() {
      this.round.human(Action.STAND);
      this.postActionCheck();
    },
    hit() {
      this.round.human(Action.HIT);
      this.postActionCheck();
    },
    double() {
      this.round.human(Action.DOUBLE);
      this.postActionCheck();
    },
    split() {
      this.round.human(Action.SPLIT);
      this.postActionCheck();
    },
  },
  components: { Card },
};
</script>

<template>
  <div class="flex flex-col h-screen p-5 justify-between">
    <div>
      <p class="text-slate-900 font-extrabold text-l text-center">Balance</p>
      <p class="text-slate-900 font-extrabold text-4xl text-center">
        {{ wallet.balance }}
      </p>
    </div>

    <div :hidden="empty">
      <div class="p-3">
        <p class="text-slate-700 font-extrabold text-l text-center">
          Your Hands
        </p>

        <div
          v-for="(hand, index) in round?.humanHands"
          :key="hand"
          :class="{
            active: index === currentHandIndex,
            'p-2': true,
            rounded: true,
          }"
        >
          <template v-for="card of hand?.cards" :key="card">
            <Card :card="card"></Card>
          </template>

          <template v-if="hand.result">
            <p class="text-slate-500 font-extrabold text-l text-center">
              {{ hand.result }}
            </p>
          </template>
        </div>
      </div>

      <div class="p-3">
        <p class="text-slate-700 font-extrabold text-l text-center">
          Dealer Hand
        </p>

        <template v-if="round?.dealerHand">
          <Card :card="round.dealerHand.cards[0]"></Card>

          <template v-if="humanHasActionableHands === false">
            <div v-for="card of round.dealerHand.cards.slice(1)" :key="card">
              <Card :card="card"></Card>
            </div>
          </template>

          <p
            v-if="isDealerBust"
            class="text-slate-500 font-extrabold text-l text-center"
          >
            Dealer Busts
          </p>
        </template>
      </div>
    </div>

    <div>
      <div class="flex">
        <button
          @click="deal()"
          :disabled="!isRoundEnded"
          class="flex-auto m-1 bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-1"
        >
          Deal
        </button>
      </div>

      <div class="flex justify-center al">
        <button
          @click="hit()"
          :disabled="isRoundEnded"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Hit
        </button>
        <button
          @click="stand()"
          :disabled="isRoundEnded"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Stand
        </button>
        <button
          @click="double()"
          :disabled="!canDouble || isRoundEnded"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Double
        </button>
        <button
          @click="split()"
          :disabled="!canSplit || isRoundEnded"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Split
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@import "@/assets/base.css";

.active {
  background: var(--color-background-soft);
}
</style>
