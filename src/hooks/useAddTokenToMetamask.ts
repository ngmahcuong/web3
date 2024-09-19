import { useCallback } from 'react';

export const useAddTokenMetamask = () => {
  const addToken = async (
    address: string,
    symbol: string,
    decimals: number,
    image?: string,
  ) => {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: address,
          symbol: symbol,
          decimals: decimals,
          image: image,
        },
      },
    });
  };

  return useCallback(
    async (symbol: string, address?: string, decimals?: number, image?: string) => {
      await addToken(address, symbol, decimals, image);
    },
    [],
  );
};
