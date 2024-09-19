import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getFactoryAddress } from '../../../config';
import { useDexContract } from './useDexContract';

export const useUniswapFactory = () => {
  const { chainId } = useWeb3React();
  const address = useMemo(() => {
    return getFactoryAddress(chainId);
  }, [chainId]);
  return useDexContract(ContractInterfaces.factoryInterface, address);
};
