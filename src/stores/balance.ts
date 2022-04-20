import { defineStore } from "pinia";

export const useBalanceStore = (initialBalance: number) =>
  defineStore({
    id: "balance",
    state: () => ({
      balance: initialBalance,
    }),
  })();
