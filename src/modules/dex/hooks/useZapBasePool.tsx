import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getStablePoolConfig } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useZapBasePool = (poolId: string) => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getStablePoolConfig(chainId, poolId)?.zap;
  }, [chainId, poolId]);

  return useContract('stableSwapZap', address);
};
