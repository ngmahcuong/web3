import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useEstimateContract } from './useEstimateContract';
import { getSwapRouterAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useUniswapRouter = (): [
  Contract,
  (
    method: string,
    args: Array<string | string[] | number | BigNumber | boolean>,
    value?: BigNumber | null,
  ) => Promise<TransactionResponse>,
] => {
  const { chainId } = useWeb3React();
  const address = useMemo(() => {
    return getSwapRouterAddress(chainId);
  }, [chainId]);
  const contract = useContract('swapRouterInterface', address);
  const estimate = useEstimateContract('swapRouterInterface', address);
  return [contract, estimate];
};
