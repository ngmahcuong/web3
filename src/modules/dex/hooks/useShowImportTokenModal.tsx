import { Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useAllDexTokens, useDefaultsFromURLSearch } from '../../../state/dex/hooks';
import { useUniswapToken } from './useUniswapToken';

export const useShowImportTokenModal = () => {
  const allDexTokens = useAllDexTokens();
  const loadedDefaultUrlParams = useDefaultsFromURLSearch();
  let loadedInputCurrency = undefined;
  loadedInputCurrency = useUniswapToken(loadedDefaultUrlParams?.inputCurrencyId);

  let loadedOutputCurrency = undefined;
  loadedOutputCurrency = useUniswapToken(loadedDefaultUrlParams?.outputCurrencyId);

  const urlLoadedTokens = useMemo(() => {
    const inputCurrencyId = loadedDefaultUrlParams?.inputCurrencyId;
    const outputCurrencyId = loadedDefaultUrlParams?.outputCurrencyId;
    let conditional = false;
    if (inputCurrencyId && outputCurrencyId) {
      conditional = loadedInputCurrency !== undefined && loadedOutputCurrency !== undefined;
    } else if (inputCurrencyId && !outputCurrencyId) {
      conditional = loadedInputCurrency !== undefined;
    } else {
      conditional = loadedOutputCurrency !== undefined;
    }

    if (conditional) {
      return (
        [loadedInputCurrency, loadedOutputCurrency]?.filter(
          (c): c is Token => c instanceof Token,
        ) ?? []
      );
    }
  }, [loadedDefaultUrlParams, loadedInputCurrency, loadedOutputCurrency]);

  const importTokens = useMemo(() => {
    if (!Object.keys(allDexTokens).length) {
      return [];
    }
    return (
      (urlLoadedTokens &&
        urlLoadedTokens.filter((token: Token) => {
          return !(
            token?.address &&
            (allDexTokens[token.address] || allDexTokens[token.address.toLocaleLowerCase()])
          );
        })) ||
      []
    );
  }, [allDexTokens, urlLoadedTokens]);

  const showImportTokenModal = useMemo(() => {
    return importTokens.length;
  }, [importTokens]);

  return useMemo(() => {
    return {
      importTokens,
      showImportTokenModal,
    };
  }, [importTokens, showImportTokenModal]);
};
