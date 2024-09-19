import { Currency, Token } from '@uniswap/sdk-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';
import styled from 'styled-components';
import useDebounce from '../../../../hooks/useDebounce';
import { useAllDexTokens, useIsUserAddedToken } from '../../../../state/dex/hooks';
import { useWatchTokenBalance } from '../../../../state/user/hooks';
import { isAddress } from '../../../../utils/addresses';
import { useDexNativeToken } from '../../hooks/useDexNativeToken';
import { useUniswapToken } from '../../hooks/useUniswapToken';
import { createFilterToken, useSearchInactiveTokenLists } from '../../utils/filtering';
import useTokenComparator from '../../utils/sorting';
import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { ImportRow } from './ImportRow';

interface CurrencySearchProps {
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  isShowCommonBase: boolean;
}

export const CurrencySearch: React.FC<CurrencySearchProps> = ({
  selectedCurrency,
  onCurrencySelect,
  showImportView,
  setImportToken,
  isShowCommonBase,
}) => {
  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();
  const nativeToken = useDexNativeToken();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);

  const allTokens = useAllDexTokens();

  // if they input an address, use it
  const searchToken = useUniswapToken(debouncedQuery);
  const searchTokenIsAdded = useIsUserAddedToken(searchToken);

  const showETH: boolean = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim();
    return s === '' || (nativeToken?.name?.includes(s) && !searchToken);
  }, [debouncedQuery, nativeToken?.name, searchToken]);

  const filteredTokens: Token[] = useMemo(() => {
    const filterToken = createFilterToken(debouncedQuery);
    return Object.values(allTokens).filter(filterToken);
  }, [allTokens, debouncedQuery]);

  const tokenComparator = useTokenComparator();

  const filteredSortedTokens: Token[] = useMemo(() => {
    return [...filteredTokens].sort(tokenComparator);
  }, [filteredTokens, tokenComparator]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
    },
    [onCurrencySelect],
  );

  const handleInput = useCallback((event) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim();
        if (s === nativeToken?.symbol?.toLowerCase()) {
          handleCurrencySelect(nativeToken);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() ===
              debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokens, handleCurrencySelect, nativeToken],
  );

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(debouncedQuery);

  const watchToken = useWatchTokenBalance();
  useEffect(() => {
    watchToken(Object.keys(allTokens).concat(filteredInactiveTokens?.map((t) => t.address)));
  }, [allTokens, filteredInactiveTokens, watchToken]);

  return (
    <>
      <StyledInputContainer>
        <StyledInput
          type="text"
          id="token-search-input"
          placeholder="Search name or paste address"
          autoComplete="off"
          value={searchQuery}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
      </StyledInputContainer>
      {isShowCommonBase && (
        <CommonBases
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
        />
      )}
      <StyledTitle>Tokens</StyledTitle>
      {searchToken &&
        !searchTokenIsAdded &&
        !filteredSortedTokens?.length &&
        !filteredInactiveTokens?.length && (
          <ImportRow
            token={searchToken as Token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            hasBorder
          />
        )}
      <StyledCurrencyListContainer>
        {filteredSortedTokens?.length > 0 ||
        filteredInactiveTokens?.length > 0 ||
        showETH ||
        searchToken ? (
          <CurrencyList
            currencies={filteredSortedTokens}
            inactiveCurrencies={filteredInactiveTokens}
            breakIndex={
              Boolean(filteredInactiveTokens?.length) && filteredSortedTokens && !showETH
                ? filteredSortedTokens.length
                : undefined
            }
            onCurrencySelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            fixedListRef={fixedList}
            showImportView={showImportView}
            setImportToken={setImportToken}
            showETH={showETH}
          />
        ) : (
          <StyledNoResult>No results found</StyledNoResult>
        )}
      </StyledCurrencyListContainer>
    </>
  );
};

const StyledTitle = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.muted};
`;

const StyledInputContainer = styled.div`
  padding: 8px 0 10px 12px;
  background-color: ${({ theme }) => theme.white};
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.input.border};
  background-color: ${({ theme }) => theme.input.background};
`;

const StyledInput = styled.input`
  width: 100%;
  font-size: 16px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.primary};
`;

const StyledCurrencyListContainer = styled.div`
  height: 100%;
`;

const StyledNoResult = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: normal;
  font-size: 16px;
  color: ${({ theme }) => theme.muted};
  min-height: 150px;
`;
