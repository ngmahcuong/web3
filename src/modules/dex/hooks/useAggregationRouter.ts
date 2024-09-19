import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getAggregationRouterAddress } from '../../../config';
import { useContract } from '../../../hooks/useContract';

export const useAggregationRouter = () => {
  const { chainId } = useWeb3React();

  const address = useMemo(() => {
    return getAggregationRouterAddress(chainId);
  }, [chainId]);

  return useContract('aggregationRouterInterface', address);
};
