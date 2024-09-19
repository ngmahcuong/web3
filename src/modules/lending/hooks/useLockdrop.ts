import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getLockdropAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useLockdrop = () => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getLockdropAddress(chainId);
  }, [chainId]);

  return useContract('lockdrop', address);
};
