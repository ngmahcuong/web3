import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getWrappedToken } from '../../../config';
import { useContract } from '../../../hooks/useContract';
import { useEstimateContract } from './useEstimateContract';

export const useWrapNativeToken = () => {
  const { chainId } = useWeb3React();
  const address = useMemo(() => {
    return getWrappedToken(chainId)?.address;
  }, [chainId]);
  const estimate = useEstimateContract('wethInterface', address);
  const contract = useContract('factoryInterface', address);

  return {
    contract,
    estimate,
  };
};
