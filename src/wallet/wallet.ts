export type Wallet = {
  balance: number;
};

export const createWallet = () => {
  return {
    balance: 100,
  };
};
