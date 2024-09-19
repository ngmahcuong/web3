import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getMarketFromMarketAdrress } from '../../../../../config';
import { useMarket } from '../../../hooks/useLendingMarkets';

export const useLockDropMarketAsset = (address?: string) => {
  const { chainId } = useWeb3React();
  const marketConfig = useMemo(() => {
    return getMarketFromMarketAdrress(chainId, address);
  }, [address, chainId]);

  const market = useMarket(marketConfig?.asset);

  return {
    market,
  };
};
