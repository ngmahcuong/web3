import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useCombinedActiveList } from '../../../state/dex/hooks';

export const useTokenListLogo = () => {
  const tokenMap = useCombinedActiveList();
  const { chainId } = useWeb3React();

  return useCallback(
    (address?: string) => {
      return (
        tokenMap?.[chainId]?.[address]?.tokenInfo?.logoURI ||
        tokenMap?.[chainId]?.[address?.toLowerCase()]?.tokenInfo?.logoURI ||
        tokenMap?.[chainId]?.[address?.toUpperCase()]?.tokenInfo?.logoURI
      );
    },
    [chainId, tokenMap],
  );
};
