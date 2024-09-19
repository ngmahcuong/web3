import { useContract } from './useContract';

export const useErc20 = (address: string) => {
  return useContract('erc20', address);
};
