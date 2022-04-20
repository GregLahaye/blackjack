export type Wallet = {
  balance: number;
};

export const createWallet = (balance: number) => {
  return {
    balance,
  };
};
