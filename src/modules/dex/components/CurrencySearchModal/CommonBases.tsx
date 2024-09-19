import { Currency } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { FC } from 'react';
import styled from 'styled-components';
import { getCommonBases, getTokenAddress } from '../../../../config';
import { useDexNativeToken } from '../../hooks/useDexNativeToken';
import { useUniswapToken } from '../../hooks/useUniswapToken';
import { DexTokenSymbol } from '../DexTokenSymbol';

interface CommonBasesProps {
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency: Currency;
}

const CommonBasesItem: FC<{
  symbol: string;
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency: Currency;
}> = ({ symbol, onCurrencySelect, selectedCurrency }) => {
  const { chainId } = useWeb3React();
  const tokenAddress = getTokenAddress(chainId, symbol);
  const nativeToken = useDexNativeToken();
  const currency = useUniswapToken(tokenAddress);

  const token = symbol === nativeToken?.symbol ? nativeToken : currency;

  return (
    <StyledButton
      onClick={() => onCurrencySelect(token)}
      disabled={selectedCurrency?.equals(token)}
    >
      <DexTokenSymbol
        address={token?.isNative ? token?.symbol : token?.wrapped.address}
        size={22}
      />
      <span>{token?.symbol}</span>
    </StyledButton>
  );
};

const CommonBases: FC<CommonBasesProps> = ({ onCurrencySelect, selectedCurrency }) => {
  const { chainId } = useWeb3React();
  const bases = chainId ? getCommonBases(chainId) ?? [] : [];

  if (bases.length === 0) return <></>;

  return (
    <StyledContainer>
      <StyledTitle>Common tokens</StyledTitle>
      <StyledList>
        {bases.map((token: string) => (
          <CommonBasesItem
            symbol={token}
            onCurrencySelect={onCurrencySelect}
            key={token}
            selectedCurrency={selectedCurrency}
          />
        ))}
      </StyledList>
    </StyledContainer>
  );
};

export default CommonBases;

const StyledContainer = styled.div`
  margin-top: 12px;
`;

const StyledTitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.muted};
`;

const StyledList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  gap: 8px;
`;

const StyledButton = styled.button`
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.box.border};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1px;
  color: ${({ theme }) => theme.text.primary};
  img {
    margin-right: 5px;
  }
  :not(:disabled) {
    cursor: pointer;
    :hover {
      color: ${({ theme }) => theme.header.background};
    }
  }
  :disabled {
    pointer-events: none;
    color: ${(p) => p.theme.gray3};
  }
`;
