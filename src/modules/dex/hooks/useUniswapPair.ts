import { ContractInterfaces } from '../../../abis';
import { useDexContract } from './useDexContract';

export const useUniswapPair = (address: string) => {
  return useDexContract(ContractInterfaces.pairInterface, address);
};
