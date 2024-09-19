import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getComptrollerAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';
import { Comptroller } from '../../../typechain';

export const useComptroller = () => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getComptrollerAddress(chainId);
  }, [chainId]);

  return useContract('comptroller', address) as Comptroller;
};
