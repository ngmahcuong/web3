import { Currency, Token } from '@uniswap/sdk-core';
import { CSSProperties, FC, useCallback, useMemo, MutableRefObject } from 'react';
import styled from 'styled-components';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { BigNumber } from 'ethers';
import { Zero } from '@ethersproject/constants';
import { screenUp } from '../../../../utils/styles';
import { ImportRow } from './ImportRow';
import { useCurrencyBalance } from '../../../../state/user/hooks';
import { shortenAddress } from '../../../../utils/addresses';
import { useUserWallet } from '../../../../providers/UserWalletProvider';
import { useAddTokenMetamask } from '../../../../hooks/useAddTokenToMetamask';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import { useDexNativeToken } from '../../hooks/useDexNativeToken';
import { useTokenListLogo } from '../../hooks/useTokenListLogo';
import { DexTokenSymbol } from '../DexTokenSymbol';
import {
  TokenAddressMap,
  useCombinedActiveList,
  useIsUserAddedToken,
} from '../../../../state/dex/hooks';
import { CurrencyThreshold } from '../../../../utils/constants';

interface CurrencyRowProps {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  style: CSSProperties;
}

interface CurrencyListProps {
  currencies: Currency[];
  inactiveCurrencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  fixedListRef?: MutableRefObject<List | undefined>;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  breakIndex: number | undefined;
  showETH?: boolean;
}

function currencyKey(currency: Currency): string {
  return currency?.isToken ? currency.address : 'ETHER';
}

function isTokenOnList(tokenAddressMap: TokenAddressMap, token?: Token): boolean {
  return Boolean(token?.isToken && tokenAddressMap[token.chainId]?.[token.address]);
}

function Balance({ balance, decimals }: { balance: BigNumber; decimals: number }) {
  return (
    <StyledBalance
      bold={balance?.gt(Zero)}
      className={balance?.gt(Zero) ? 'text-high-emphesis' : 'text-low-emphesis'}
    >
      <BigNumberValue
        value={balance}
        decimals={decimals}
        fractionDigits={2}
        threshold={CurrencyThreshold}
      />
    </StyledBalance>
  );
}

const CurrencyRow: FC<CurrencyRowProps> = ({ currency, onSelect, isSelected, style }) => {
  const { account } = useUserWallet();
  const key = currencyKey(currency);
  const selectedTokenList = useCombinedActiveList();
  const isOnSelectedList = isTokenOnList(
    selectedTokenList,
    currency?.isToken ? currency : undefined,
  );
  const customAdded = useIsUserAddedToken(currency);
  const balance = useCurrencyBalance(currency);

  const addToken = useAddTokenMetamask();
  const getTokenLogo = useTokenListLogo();

  const onAddTokenToMetamask = useCallback(
    (e) => {
      e?.stopPropagation();
      addToken(
        currency?.symbol,
        currency?.wrapped.address,
        currency?.decimals,
        getTokenLogo(currency?.wrapped.address),
      );
    },
    [addToken, currency, getTokenLogo],
  );

  return (
    <StyledRow
      disabled={isSelected}
      id={`token-item-${key}`}
      style={style}
      onClick={() => (isSelected ? null : onSelect())}
    >
      <StyledToken>
        <DexTokenSymbol
          address={currency?.isNative ? currency?.symbol : currency?.wrapped?.address}
          size={36}
        />
        <StyledFlexCol>
          <StyledContent className="text-secondary">
            {currency.name} {!isOnSelectedList && customAdded && '• Added by user'}
            &nbsp;
            {!currency.isNative && (
              <StyledAddToken onClick={onAddTokenToMetamask}>
                <i className="fal fa-plus-circle"></i>
              </StyledAddToken>
            )}
          </StyledContent>
          <StyledFlexRow margin="3px">
            <StyledContent size="md" className="text-high-emphesis">
              {currency.symbol}
            </StyledContent>
            {!isOnSelectedList && customAdded && (
              <StyledContent className="text-address" size="md">
                {shortenAddress(currency?.wrapped?.address, 8, 5)}
              </StyledContent>
            )}
          </StyledFlexRow>
        </StyledFlexCol>
      </StyledToken>
      {balance ? (
        <Balance balance={balance} decimals={currency.decimals} />
      ) : account ? (
        <StyledLoader>
          <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
        </StyledLoader>
      ) : null}
    </StyledRow>
  );
};

const CurrencyList: FC<CurrencyListProps> = ({
  currencies,
  inactiveCurrencies,
  selectedCurrency,
  onCurrencySelect,
  fixedListRef,
  showImportView,
  setImportToken,
  breakIndex,
  showETH,
}) => {
  const nativeToken = useDexNativeToken();
  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showETH
      ? [nativeToken, ...currencies, ...inactiveCurrencies]
      : [...currencies, ...inactiveCurrencies];
    if (breakIndex !== undefined) {
      formatted = [
        ...formatted.slice(0, breakIndex),
        undefined,
        ...formatted.slice(breakIndex, formatted.length),
      ];
    }
    return formatted;
  }, [breakIndex, currencies, inactiveCurrencies, nativeToken, showETH]);

  const Row = useCallback(
    ({ index, style }) => {
      const currency = itemData[index];
      const isSelected = Boolean(selectedCurrency && selectedCurrency.equals(currency));
      const handleSelect = () => onCurrencySelect(currency);
      const showImport = index > currencies.length;
      if (index === breakIndex) {
        return (
          <StyledFixedContentRow style={style}>
            <StyledFixedCol>
              <StyledContent className="text-high-emphesis">
                Expanded results from inactive token lists
              </StyledContent>
              <StyledContent className="text-secondary">
                Tokens from inactive lists: import specific tokens below or click manage to
                activate more lists.
              </StyledContent>
            </StyledFixedCol>
          </StyledFixedContentRow>
        );
      }

      if (showImport && currency) {
        return (
          <ImportRow
            style={style}
            token={currency as Token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            handleCurrencySelect={handleSelect}
            showBalance
            hasBorder
          />
        );
      }
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
        />
      );
    },
    [
      itemData,
      selectedCurrency,
      currencies.length,
      breakIndex,
      onCurrencySelect,
      showImportView,
      setImportToken,
    ],
  );

  return (
    <StyledContainer id="all-currencies-list">
      <AutoSizer>
        {({ height, width }) => (
          <StyledList
            height={height}
            width={width}
            ref={fixedListRef}
            itemCount={itemData.length}
            itemSize={65}
          >
            {Row}
          </StyledList>
        )}
      </AutoSizer>
    </StyledContainer>
  );
};

export default CurrencyList;

const StyledList = styled(List)`
  ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: ${({ theme }) => theme.gray2};
  }
`;

const StyledContainer = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1;
  flex-grow: 1;
  min-height: 50vh;
  height: 100%;
  ${screenUp('lg')`
    min-height: fit-content;
 `}
`;

const StyledContent = styled.div<{ size?: 'sm' | 'md' }>`
  font-weight: ${({ size }) => size === 'md' && 'bold'};
  font-size: ${({ size }) => (size === 'md' ? '.875rem' : '.75rem')};
  display: flex;
  align-items: center;
  &.text-secondary {
    color: ${({ theme }) => theme.gray3};
  }
  &.text-high-emphesis {
    color: ${({ theme }) => theme.text.primary};
  }
  &.text-address {
    color: ${({ theme }) => theme.muted};
    font-weight: normal;
    padding-left: 5px;
  }
`;

const StyledRow = styled.div<{ disabled: boolean }>`
  pointer-events: ${({ disabled }) => disabled && 'none'};
  padding: 12px 0;
  color: ${({ theme }) => theme.box.itemBackground};
  display: flex;
  align-items: center;
  justify-content: space-between;
  > * + * {
    margin-left: 0.875rem;
  }
  &:not(:last-child) {
    border-bottom: 1px dashed ${({ theme }) => theme.box.border};
  }
  :hover {
    .text-high-emphesis {
      color: ${({ theme }) => theme.success};
    }
  }
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => !disabled && 'pointer'};
`;

const StyledFlexCol = styled.div`
  display: flex;
  flex-direction: column;
  > * + * {
    padding-top: 0.125rem;
  }
`;

const StyledFlexRow = styled.div<{ justify?: string; margin?: string }>`
  display: flex;
  align-items: center;
  justify-content: ${({ justify }) => justify && justify};
  margin-top: ${({ margin }) => margin && margin};
`;

const StyledToken = styled(StyledFlexRow)`
  flex-grow: 1;
  > * + * {
    margin-left: 0.75rem;
  }
`;

const StyledBalance = styled.div<{ bold?: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
  margin-right: 5px;
  &.text-high-emphesis {
    color: ${({ theme }) => theme.gray3};
  }
  &.text-low-emphesis {
    color: #bcb4c673;
  }
`;

const StyledFixedContentRow = styled.div`
  display: grid;
  align-items: center;
  margin-top: 5px;
`;

const StyledFixedCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  > * + * {
    margin-top: 0.125rem;
  }
`;

const StyledAddToken = styled.button`
  color: ${({ theme }) => theme.muted};
  transition: all 0.1s ease-in-out 0s;
  &:hover {
    color: ${({ theme }) => theme.muted};
  }
  i {
    font-size: 14px;
  }
`;

const StyledLoader = styled.div`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
  i {
    font-size: 16px;
  }
`;
