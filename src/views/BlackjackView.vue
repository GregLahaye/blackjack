<script lang="ts">
import { Action } from "@/blackjack/action";
import { Round } from "@/blackjack/round";
import { Result } from "@/blackjack/result";
import Card from "../components/Card.vue";
import type { Cheat } from "@/blackjack/round";
import type { Store } from "pinia";
import { useBalanceStore } from "@/stores/balance";

const INITIAL_BET = 10;
const INITIAL_BALANCE = 100;

export default {
  mounted() {
    this.balanceStore.$subscribe((mutation, state) => {
      localStorage.setItem("balance", state.balance);
    });
  },
  data(): {
    round: Round | undefined;
    currentHandIndex: number;
    humanHasActionableHands: boolean;
    canDouble: boolean;
    canSplit: boolean;
    isRoundEnded: boolean;
    isDealerBust: boolean;
    balanceStore: Store;
    roundStartBalance: number;
    empty: boolean;
    bet: number;
  } {
    return {
      round: undefined,
      currentHandIndex: 0,
      humanHasActionableHands: true,
      canDouble: false,
      canSplit: false,
      isRoundEnded: true,
      isDealerBust: false,
      balanceStore: useBalanceStore(
        localStorage.getItem("balance") ?? INITIAL_BALANCE
      ),
      roundStartBalance: 0,
      empty: true,
      bet: INITIAL_BET,
    };
  },
  computed: {
    balance: {
      get(): number {
        return this.balanceStore.$state.balance;
      },
      set(value: number): void {
        this.balanceStore.$state.balance = value;
      },
    },
    hasFunds(): boolean {
      return this.balance >= this.bet;
    },
  },
  methods: {
    deal() {
      const enableCheats = true;
      const cheat: Cheat = {
        humanCards: [
          { rank: "Q", suit: "hearts" },
          { rank: "Q", suit: "hearts" },
        ],
        dealerCards: [
          { rank: "K", suit: "clubs" },
          { rank: "10", suit: "spades" },
          { rank: "10", suit: "spades" },
        ],
      };

      this.empty = false;
      this.roundStartBalance = this.balance;
      this.round = new Round(this.bet, enableCheats ? cheat : undefined);
      this.currentHandIndex = 0;
      this.humanHasActionableHands = true;
      this.isRoundEnded = false;
      this.isDealerBust = false;
      this.postActionCheck();
    },
    clear() {
      this.balance = INITIAL_BALANCE;
    },
    updateBalance() {
      const totalBet = this.round.humanHands.reduce(
        (sum, { bet }) => sum + bet,
        0
      );
      const balance = this.roundStartBalance - totalBet;
      this.balance = balance;
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
      this.balance += blackjackBalance + winBalance + drawBalance;
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
  <div class="flex flex-col h-screen p-5 justify-between items-center">
    <div>
      <div>
        <p class="text-slate-900 font-extrabold text-l text-center">Balance</p>
        <p class="text-slate-900 font-extrabold text-4xl text-center">
          {{ balance }}
        </p>
      </div>

      <div class="flex justify-center">
        <p class="text-slate-700 font-extrabold text-l text-center">Bet</p>
        <input
          type="range"
          min="10"
          max="50"
          step="5"
          v-model.number="bet"
          :disabled="!isRoundEnded"
          class="mx-1"
        />
        <p class="text-slate-900 font-extrabold text-l text-center">
          {{ bet }}
        </p>
      </div>
    </div>

    <div :hidden="empty">
      <div class="p-3">
        <p class="text-slate-700 font-extrabold text-l text-center">
          Your Hands
        </p>

        <div class="flex flex-col content-center">
          <div
            v-for="(hand, index) in round?.humanHands"
            :key="hand"
            :class="{
              'bg-pink-100': index === currentHandIndex,
              'px-5': true,
              'py-3': true,
              rounded: true,
            }"
          >
            <div class="active cards flex flex-col items-center">
              <div class="flex flex-row overflow-auto">
                <template v-for="card of hand?.cards" :key="card">
                  <Card :card="card"></Card>
                </template>
              </div>
            </div>

            <template v-if="hand.result">
              <p class="text-slate-500 font-extrabold text-l text-center">
                {{ hand.result }}
              </p>
            </template>
          </div>
        </div>
      </div>

      <div class="p-3">
        <p class="text-slate-700 font-extrabold text-l text-center">
          Dealer Hand
        </p>

        <div
          v-if="round?.dealerHand"
          class="cards flex flex-col items-center p-3"
        >
          <div class="flex flex-row overflow-auto">
            <Card :card="round.dealerHand.cards[0]"></Card>

            <template v-if="humanHasActionableHands === false">
              <template
                v-for="card of round.dealerHand.cards.slice(1)"
                :key="card"
              >
                <Card :card="card"></Card>
              </template>
            </template>
          </div>
        </div>

        <p
          v-if="isDealerBust"
          class="text-slate-500 font-extrabold text-l text-center"
        >
          Dealer Busts
        </p>
      </div>
    </div>

    <div class="self-stretch">
      <div class="flex">
        <button
          @click="deal()"
          :disabled="!isRoundEnded || !hasFunds"
          class="flex-auto m-1 bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-1 disabled:bg-slate-400"
        >
          Deal
        </button>
      </div>

      <div class="flex justify-center al">
        <button
          @click="hit()"
          :disabled="isRoundEnded"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-400"
        >
          Hit
        </button>
        <button
          @click="stand()"
          :disabled="isRoundEnded"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-400"
        >
          Stand
        </button>
        <button
          @click="double()"
          :disabled="!canDouble || isRoundEnded || !hasFunds"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-400"
        >
          Double
        </button>
        <button
          @click="split()"
          :disabled="!canSplit || isRoundEnded || !hasFunds"
          class="flex-auto m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-400"
        >
          Split
        </button>
      </div>

      <div class="flex">
        <button
          @click="clear()"
          :hidden="!isRoundEnded || balance >= bet"
          class="flex-auto m-1 bg-red-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-1 disabled:bg-slate-400"
        >
          RESET
        </button>
      </div>
    </div>
  </div>
</template>
