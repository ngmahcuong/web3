import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getSwapExecutorAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useSwapExecutor = () => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getSwapExecutorAddress(chainId);
  }, [chainId]);

  return useContract('swapExecutorInterface', address);
};
