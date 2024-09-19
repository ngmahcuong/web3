import { useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';
import { TokenInfo } from '@uniswap/token-lists';
import { useWeb3React } from '@web3-react/core';
import { isAddress } from '../../../utils/addresses';
import { useAllLists, useAllDexTokens, useInactiveListUrls } from '../../../state/dex/hooks';

export function filterTokens(tokens: Token[], search: string): Token[] {
  if (search.length === 0) return tokens;

  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    return tokens.filter((token) => token.address === searchingAddress);
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return tokens;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s_) => s_.length > 0);

    return lowerSearchParts.every(
      (p) => p.length === 0 || sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p)),
    );
  };

  return tokens.filter((token) => {
    const { symbol, name } = token;
    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  });
}

export function createFilterToken<T extends TokenInfo | Token>(
  search: string,
): (token: T) => boolean {
  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    const address = searchingAddress.toLowerCase();
    return (t: T) => 'address' in t && address === t.address.toLowerCase();
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return () => true;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s_) => s_.length > 0);

    return lowerSearchParts.every(
      (p) => p.length === 0 || sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p)),
    );
  };
  return (token) => {
    const { symbol, name } = token;
    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  };
}

export function useSearchInactiveTokenLists(
  search: string | undefined,
  minResults = 10,
): Token[] {
  const lists = useAllLists();
  const inactiveUrls = useInactiveListUrls();
  const { chainId } = useWeb3React();
  const activeTokens = useAllDexTokens();
  return useMemo(() => {
    if (!search || search.trim().length === 0) return [];
    const filterToken = createFilterToken(search);
    const result: Token[] = [];
    const addressSet: { [address: string]: true } = {};
    for (const url of inactiveUrls) {
      const list = lists[url].current;
      if (!list) continue;
      for (const tokenInfo of list.tokens) {
        if (tokenInfo.chainId === chainId && filterToken(tokenInfo)) {
          const token = new Token(
            tokenInfo.chainId,
            tokenInfo.address,
            tokenInfo.decimals,
            tokenInfo.symbol,
            tokenInfo.name,
          );
          if (!(tokenInfo.address in activeTokens) && !addressSet[tokenInfo.address]) {
            addressSet[tokenInfo.address] = true;
            result.push(token);
            if (result.length >= minResults) return result;
          }
        }
      }
    }
    return result;
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search]);
}
