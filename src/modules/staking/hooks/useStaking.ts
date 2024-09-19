import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getStakingAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useStaking = () => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getStakingAddress(chainId);
  }, [chainId]);

  return useContract('staking', address);
};
