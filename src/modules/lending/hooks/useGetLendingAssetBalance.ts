import { useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useWatchTokenBalance } from '../../../state/user/hooks';
import { getAllMarketsConfig, getTokenAddress } from '../../../config';

export const useGetLendingAssetBalance = () => {
  const { chainId } = useWeb3React();
  const watchTokens = useWatchTokenBalance();
  const allAssets = useMemo(() => {
    const markets = getAllMarketsConfig(chainId);
    return markets
      ?.filter((m) => !m.isNativeToken)
      .map((t) => getTokenAddress(chainId, t.asset));
  }, [chainId]);

  useEffect(() => {
    if (!allAssets || allAssets?.length === 0) {
      return;
    }
    watchTokens(allAssets);
  }, [allAssets, watchTokens]);
};
