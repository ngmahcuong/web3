import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getLimitOrderAddress } from '../../../config';
import { useDexContract } from './useDexContract';
import { useEstimateContract } from './useEstimateContract';

export const useLimitOrderContract = () => {
  const { chainId } = useWeb3React();
  const address = useMemo(() => {
    return getLimitOrderAddress(chainId);
  }, [chainId]);
  const estimate = useEstimateContract('limitOrderInterface', address);
  const limitOrderContract = useDexContract(ContractInterfaces.limitOrderInterface, address);

  return {
    limitOrderContract,
    estimate,
  };
};
