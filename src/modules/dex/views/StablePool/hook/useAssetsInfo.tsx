import { useMemo } from 'react';
import { getTokenConfig } from '../../../../../config';
import { useWeb3React } from '@web3-react/core';

export const useAssetsInfo = (assets: string[]) => {
  const { chainId } = useWeb3React();

  return useMemo(() => {
    const assetsInfo = assets?.map((t) => {
      const tokenConfig = getTokenConfig(chainId, t);
      return {
        ...tokenConfig,
        symbol: t,
      };
    });
    return assetsInfo;
  }, [assets, chainId]);
};
