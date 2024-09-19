import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getLaunchpadAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useLaunchpad = (index: number) => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getLaunchpadAddress(chainId, index);
  }, [chainId, index]);

  return useContract('launchpadInterface', address);
};
