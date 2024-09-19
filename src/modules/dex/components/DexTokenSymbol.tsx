import React, { ReactText, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import { useNativeToken } from '../../../hooks/useNativeToken';
import NO_NAME from '../../../assets/tokens/NO_NAME.png';
import WETH from '../../../assets/tokens/WETH.png';
import { useCombinedActiveList, useCombinedInactiveList } from '../../../state/dex/hooks';

export type DexTokenSymbolProps = {
  address: string;
  size?: ReactText;
  autoHeight?: boolean;
};

export const DexTokenSymbol: React.FC<DexTokenSymbolProps> = ({
  address,
  size = 32,
  autoHeight = false,
}) => {
  const { chainId } = useWeb3React();
  const tokenList = useCombinedActiveList();
  const inActiveTokens = useCombinedInactiveList();
  const nativeToken = useNativeToken();

  const src = useMemo(() => {
    if (address === nativeToken?.symbol) {
      return WETH;
    }
    if (address) {
      const token =
        tokenList?.[chainId]?.[address] ||
        tokenList?.[chainId]?.[address?.toLowerCase()] ||
        tokenList?.[chainId]?.[address?.toUpperCase()] ||
        inActiveTokens?.[chainId]?.[address] ||
        inActiveTokens?.[chainId]?.[address?.toLowerCase()] ||
        inActiveTokens?.[chainId]?.[address?.toUpperCase()];
      return token?.tokenInfo?.logoURI || NO_NAME;
    }
    return NO_NAME;
  }, [address, chainId, inActiveTokens, nativeToken?.symbol, tokenList]);

  return (
    <StyledImg
      className="token-symbol"
      src={src}
      alt={`${address || 'NO NAME'} Logo`}
      width={size}
      height={autoHeight ? 'auto' : size}
      rounded
    />
  );
};

const StyledImg = styled.img<{ rounded?: boolean }>`
  object-fit: contain;
  border-radius: ${({ rounded }) => rounded && '9999px'};
`;
