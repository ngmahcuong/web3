import { Zero } from '@ethersproject/constants';
import { createSelector } from '@reduxjs/toolkit';
import { Currency, Token } from '@uniswap/sdk-core';
import { TokenInfo, TokenList } from '@uniswap/token-lists';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { fromPairs, groupBy, uniqBy, zipObject, uniq } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { URLSearchParams } from 'url';
import { AppDispatch, AppState } from '..';
import {
  ChainId,
  getBaseTokensToCheckTrades,
  getDefaultSwapToken,
  getOfficialPairs,
  getOfficialPairsAddresses,
  supportedChainIds,
} from '../../config';
import useQuery from '../../hooks/useQuery';
import { CHAI_LIST, DEFAULT_LIST_OF_LISTS } from '../../modules/dex/config/lists';
import { ImportPair, PairTokens } from '../../modules/dex/models/Pair';
import { validatedRecipient } from '../../modules/dex/utils/addresses';
import { deserializeToken, serializeToken } from '../../modules/dex/utils/tokens';
import { useUserWallet } from '../../providers/UserWalletProvider';
import { isAddress } from '../../utils/addresses';
import { useTokenBalances, useWatchTokenBalance } from '../user/hooks';
import {
  addSerializedToken,
  Field,
  pairImported,
  removeSerializedToken,
  selectCurrency,
  selectLimitOrderCurrency,
  setLastPairSwap,
  setLimitOrderLastPairSwap,
  setRecipient,
  updateCurrency,
  updateExpertMode,
  updateGasPriceOption,
  updateHideExpertModeAcknowledgement,
  updateLimitOrderCurrency,
  updateSingleHopOnly,
} from './actions';
import { GasPrices, SwapState } from './reducer';

export const useSwapState = () => {
  return useSelector((s: AppState) => s.dex);
};

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const dispatch = useDispatch<AppDispatch>();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency?.isToken ? currency?.address : currency?.isNative ? 'ETH' : '',
        }),
      );
    },
    [dispatch],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch],
  );

  return {
    onCurrencySelection,
    onChangeRecipient,
  };
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery();
  const queryParametersToSwapState = useQueryParametersToSwapState();
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >();

  useEffect(() => {
    if (!chainId) return;
    const [parsed, isUpdated] = queryParametersToSwapState(query);
    if (isUpdated) {
      dispatch(
        updateCurrency({
          inputCurrencyId: parsed?.swapInputCurrencyId,
          outputCurrencyId: parsed?.swapOutputCurrencyId,
        }),
      );
      setResult({
        inputCurrencyId: parsed?.swapInputCurrencyId,
        outputCurrencyId: parsed?.swapOutputCurrencyId,
      });
      if (parsed?.recipient) {
        dispatch(
          setRecipient({
            recipient: parsed?.recipient,
          }),
        );
      }
    }
  }, [dispatch, chainId, query, queryParametersToSwapState]);

  return result;
}

export const useRecipient = () => {
  const swapState = useSwapState();
  return useMemo(() => {
    return swapState?.recipient;
  }, [swapState?.recipient]);
};

export const useSetLastPairSwap = () => {
  const dispatch = useDispatch();
  return useCallback(
    (inputCurrencyId?: string, outputCurrencyId?: string) => {
      if (!inputCurrencyId || !outputCurrencyId) {
        return;
      }
      dispatch(
        setLastPairSwap({
          inputCurrencyId,
          outputCurrencyId,
        }),
      );
    },
    [dispatch],
  );
};
export const useSetLimitOrderLastPairSwap = () => {
  const dispatch = useDispatch();
  return useCallback(
    (inputCurrencyId?: string, outputCurrencyId?: string) => {
      if (!inputCurrencyId || !outputCurrencyId) {
        return;
      }
      dispatch(
        setLimitOrderLastPairSwap({
          inputCurrencyId,
          outputCurrencyId,
        }),
      );
    },
    [dispatch],
  );
};
export const useUpdateCurrency = () => {
  const dispatch = useDispatch();
  const { chainId } = useWeb3React();
  const { lastInputCurrencyIdSwap, lastOutputCurrencyIdSwap } = useSwapState();
  const updateCurrencies = useCallback(
    (inputCurrencyId?: string, outputCurrencyId?: string) => {
      dispatch(
        updateCurrency({
          inputCurrencyId,
          outputCurrencyId,
        }),
      );
    },
    [dispatch],
  );
  const restoreCurrencyDefault = useCallback(() => {
    updateCurrencies(
      lastInputCurrencyIdSwap
        ? lastInputCurrencyIdSwap
        : getDefaultSwapToken(chainId).defaultSwapInput,
      lastOutputCurrencyIdSwap
        ? lastOutputCurrencyIdSwap
        : getDefaultSwapToken(chainId).defaultSwapOutput,
    );
  }, [updateCurrencies, lastInputCurrencyIdSwap, chainId, lastOutputCurrencyIdSwap]);

  return {
    updateCurrencies,
    restoreCurrencyDefault,
  };
};

export function useQueryParametersToSwapState() {
  const {
    lastInputCurrencyIdSwap,
    lastOutputCurrencyIdSwap,
    swapInputCurrencyId,
    swapOutputCurrencyId,
  } = useSwapState();
  const { chainId } = useWeb3React();
  return useCallback(
    (parsedQs: URLSearchParams): [SwapState, boolean] => {
      const recipient = validatedRecipient(parsedQs?.get('recipient'));
      let inputCurrencyId;
      let outputCurrencyId;
      let isUpdated = false;
      if (!swapInputCurrencyId && !swapOutputCurrencyId) {
        // first time access
        const parsedInputCurrency = parsedQs?.get('inputCurrency');
        const parsedOutputCurrency = parsedQs?.get('outputCurrency');
        const inputCurrencyFromURL = parseCurrencyFromURLParameter(parsedInputCurrency);
        const outputCurrencyFromURL = parseCurrencyFromURLParameter(parsedOutputCurrency);
        if (!parsedInputCurrency && !parsedOutputCurrency) {
          inputCurrencyId = lastInputCurrencyIdSwap
            ? lastInputCurrencyIdSwap
            : getDefaultSwapToken(chainId).defaultSwapInput;
          outputCurrencyId = lastOutputCurrencyIdSwap
            ? lastOutputCurrencyIdSwap
            : getDefaultSwapToken(chainId).defaultSwapOutput;
        } else {
          if (inputCurrencyFromURL === outputCurrencyFromURL) {
            if (parsedInputCurrency && !parsedOutputCurrency) {
              inputCurrencyId = inputCurrencyFromURL;
              outputCurrencyId = '';
            } else if (!parsedInputCurrency && parsedOutputCurrency) {
              inputCurrencyId = '';
              outputCurrencyId = outputCurrencyFromURL;
            } else {
              inputCurrencyId = inputCurrencyFromURL;
              outputCurrencyId = '';
            }
          } else if (inputCurrencyFromURL && !outputCurrencyFromURL) {
            inputCurrencyId = inputCurrencyFromURL;
            outputCurrencyId = '';
          } else if (!inputCurrencyFromURL && outputCurrencyFromURL) {
            if (parsedOutputCurrency === 'ETH') {
              inputCurrencyId = '';
            } else {
              inputCurrencyId = getDefaultSwapToken(chainId).defaultSwapInput;
            }
            outputCurrencyId = outputCurrencyFromURL;
          } else {
            inputCurrencyId = inputCurrencyFromURL ?? '';
            outputCurrencyId = outputCurrencyFromURL ?? '';
          }
        }
        isUpdated = true;
      } else {
        inputCurrencyId = swapInputCurrencyId;
        outputCurrencyId = swapOutputCurrencyId;
      }
      return [
        {
          swapInputCurrencyId: inputCurrencyId,
          swapOutputCurrencyId: outputCurrencyId,
          recipient,
        },
        isUpdated,
      ];
    },
    [
      chainId,
      lastInputCurrencyIdSwap,
      lastOutputCurrencyIdSwap,
      swapInputCurrencyId,
      swapOutputCurrencyId,
    ],
  );
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam);
    if (valid) return valid;
    if (urlParam.toUpperCase() === 'ETH') return 'ETH';
    if (valid === false) return 'ETH';
  }
  return '';
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch],
  );
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch],
  );
}

const selectUserTokens = ({ dex: { importTokens: tokens } }: AppState) => tokens;

export default function useUserAddedTokens(): Token[] {
  const { chainId } = useWeb3React();

  const addTokens = useSelector(selectUserTokens);

  return useMemo(() => {
    if (!chainId) return [];

    return Object.values(addTokens?.[chainId] ?? {}).map(deserializeToken);
  }, [chainId, addTokens]);
}

export function useAllDexTokens(): { [address: string]: Token } {
  const { chainId } = useWeb3React();
  const tokenMap = useCombinedActiveList();
  const userAddedTokens = useUserAddedTokens();

  return useMemo(() => {
    if (!chainId) return {};
    const mapWithoutUrls =
      tokenMap?.[chainId] &&
      Object.keys(tokenMap?.[chainId]).reduce<{
        [address: string]: Token;
      }>((newMap, address) => {
        const tokenInfo = tokenMap[chainId][address].tokenInfo;
        newMap[address] = new Token(
          chainId,
          tokenInfo.address,
          tokenInfo.decimals,
          tokenInfo.symbol,
          tokenInfo.name,
        );
        return newMap;
      }, {});

    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token;
            return tokenMap;
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...mapWithoutUrls },
        )
    );
  }, [chainId, tokenMap, userAddedTokens]);
}

export function useAllDexTokenBalances(): { [tokenAddress: string]: BigNumber | undefined } {
  const allTokens = useAllDexTokens();
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens]);
  const validatedTokens: Token[] = useMemo(
    () =>
      allTokensArray?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [allTokensArray],
  );

  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens],
  );
  const balances = useTokenBalances(validatedTokenAddresses);
  return balances ?? {};
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
  const activeTokens = useAllDexTokens();
  return activeTokens && token && !!activeTokens[token.address];
}

export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens();
  return userAddedTokens.some((token) => currency?.equals(token));
}

export const useAllImportedPairs = () => {
  const { chainId } = useWeb3React();
  const importPairs = useSelector((s: AppState) => s.dex.importPairs?.[chainId]);
  return useMemo(() => {
    return (
      (importPairs || []).map((p) => {
        return {
          address: p.address,
          tokens: {
            currencyA: deserializeToken(p.tokens.currencyA),
            currencyB: deserializeToken(p.tokens.currencyB),
          },
          stable: p.stable,
        } as ImportPair;
      }) || []
    );
  }, [importPairs]);
};

export const useAllImportedPairAddresses = () => {
  const pairs = useAllImportedPairs();

  return useMemo(() => {
    return pairs.map((p) => p.address) || [];
  }, [pairs]);
};

export const useGetUserPairsInfo = () => {
  const watchTokens = useWatchTokenBalance();
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const importPairs = useAllImportedPairs();
  const importPairLps = useMemo(() => {
    return importPairs.map((p) => p.address);
  }, [importPairs]);

  const officialCurrencies = useMemo(() => {
    return getOfficialPairs(chainId)?.map((item) => {
      return {
        currencyA: item[0].sortsBefore(item[1]) ? item[0] : item[1],
        currencyB: item[0].sortsBefore(item[1]) ? item[1] : item[0],
      } as PairTokens;
    });
  }, [chainId]);

  const officialPairs = getOfficialPairsAddresses(chainId);

  const lps = useMemo(() => {
    const data = officialPairs ? officialPairs?.concat(importPairLps) : importPairLps;
    return account ? uniq(data) : [];
  }, [importPairLps, officialPairs, account]);

  const importCurrencies = useMemo(() => {
    return importPairs.map((p) => {
      return {
        currencyA: p.tokens.currencyA,
        currencyB: p.tokens.currencyB,
      } as PairTokens;
    });
  }, [importPairs]);

  const allCurrencies = useMemo(() => {
    const currencies = officialCurrencies
      ? officialCurrencies?.concat(importCurrencies)
      : importCurrencies;
    return uniq(currencies);
  }, [importCurrencies, officialCurrencies]);

  const lpBalances = useTokenBalances(lps);
  const pairsWithBalance = useMemo(() => {
    return lps
      ?.map((lp, index) => {
        const lpBalance = lpBalances[lp];
        return {
          ...allCurrencies[index],
          lpBalance,
          liquidityToken: lp,
          stable: importPairs?.find((p) => p.address === lp)?.stable,
        };
      })
      ?.filter((x) => x.lpBalance && x.lpBalance.gt(Zero));
  }, [lps, lpBalances, allCurrencies, importPairs]);

  const loading = useMemo(() => {
    return lps?.length !== Object.keys(lpBalances)?.length;
  }, [lps?.length, lpBalances]);

  useEffect(() => {
    if (lps) {
      watchTokens(lps);
    }
  }, [lps, watchTokens]);

  return useMemo(() => {
    return {
      pairs: pairsWithBalance,
      loading,
    };
  }, [pairsWithBalance, loading]);
};

export const useAddImportedPairs = () => {
  const dispatch = useDispatch();
  const { chainId } = useWeb3React();

  return useCallback(
    (pairs: ImportPair[]) => {
      if (!chainId || !pairs || !pairs.length) {
        return;
      }

      return dispatch(
        pairImported({
          chainId,
          pairs,
        }),
      );
    },
    [chainId, dispatch],
  );
};

export const useSavePool = () => {
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const addImportedPairs = useAddImportedPairs();

  const bases = useMemo(() => {
    if (!chainId) return [];
    return getBaseTokensToCheckTrades(chainId)?.map((t) => t.address) ?? [];
  }, [chainId]);

  return useCallback(
    (pair?: ImportPair) => {
      const tokens = pair?.tokens;
      const address = pair?.address;
      if (
        account &&
        chainId &&
        address &&
        tokens &&
        !(
          bases.includes(tokens.currencyA?.address) && bases.includes(tokens.currencyB?.address)
        )
      ) {
        addImportedPairs([
          {
            stable: pair.stable,
            address,
            tokens,
          },
        ]);
      }
    },
    [account, addImportedPairs, bases, chainId],
  );
};

/* ========== TOKEN LIST ========== */

// use ordering of default list of lists to assign priority
function sortByListPriority(urlA: string, urlB: string) {
  const first = DEFAULT_LIST_OF_LISTS.includes(urlA)
    ? DEFAULT_LIST_OF_LISTS.indexOf(urlA)
    : Number.MAX_SAFE_INTEGER;
  const second = DEFAULT_LIST_OF_LISTS.includes(urlB)
    ? DEFAULT_LIST_OF_LISTS.indexOf(urlB)
    : Number.MAX_SAFE_INTEGER;

  // need reverse order to make sure mapping includes top priority last
  if (urlA === CHAI_LIST || urlB === CHAI_LIST) return -1;
  if (first < second) return 1;
  if (first > second) return -1;
  return 0;
}

function enumKeys<O, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

export type TokenAddressMap = {
  [k: number]: Readonly<{
    [tokenAddress: string]: { tokenInfo: TokenInfo; list: TokenList };
  }>;
};

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = zipObject(
  supportedChainIds,
  supportedChainIds.map(() => {
    return {};
  }),
);

// -------------------------------------
//   Selectors
// -------------------------------------
const selectorActiveUrls = (state: AppState) => state.dex.activeTokenListUrls;
const selectorByUrls = (state: AppState) => state.dex.tokenListActiveUrl;

const combineTokenMaps = (lists: AppState['dex']['tokenListActiveUrl'], urls: string[]) => {
  if (!urls || !lists) return EMPTY_LIST;
  return (
    urls
      .slice()
      // sort by priority so top priority goes last
      .sort(sortByListPriority)
      .reduce((allTokens, currentUrl) => {
        const current = lists?.[currentUrl]?.current;
        if (!current) return allTokens;
        try {
          const newTokens = Object.assign(listToTokenMap(current));
          return combineMaps(allTokens, newTokens);
        } catch (error) {
          console.error('Could not show token list due to error', error);
          return allTokens;
        }
      }, EMPTY_LIST)
  );
};

export const combinedTokenMapFromActiveUrlsSelector = createSelector(
  [selectorByUrls, selectorActiveUrls],
  (lists, urls) => {
    return combineTokenMaps(lists, urls);
  },
);

const inactiveUrlSelector = createSelector(
  [selectorByUrls, selectorActiveUrls],
  (lists, urls) => {
    return lists && Object.keys(lists).filter((url) => !urls?.includes(url));
  },
);

export const combinedTokenMapFromInActiveUrlsSelector = createSelector(
  [selectorByUrls, inactiveUrlSelector],
  (lists, inactiveUrl) => {
    return combineTokenMaps(lists, inactiveUrl);
  },
);

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const tokenMap: TokenInfo[] = uniqBy(
    list.tokens
      .filter((t) => isAddress(t.address))
      .map((t) => {
        return { ...t, address: getAddress(t.address) };
      }),
    (tokenInfo) => `${tokenInfo.chainId}#${tokenInfo.address}`,
  );

  const groupedTokenMap: { [chainId: string]: TokenInfo[] } = groupBy(
    tokenMap,
    (tokenInfo) => tokenInfo.chainId,
  );

  const tokenAddressMap = fromPairs(
    Object.entries(groupedTokenMap).map(([chainId, tokenList]) => [
      chainId,
      fromPairs(tokenList.map((tokenInfo) => [tokenInfo.address, { tokenInfo, list }])),
    ]),
  ) as TokenAddressMap;

  // add chain id item if not exist
  enumKeys(ChainId).forEach((chainId) => {
    if (!(ChainId[chainId] in tokenAddressMap)) {
      Object.defineProperty(tokenAddressMap, ChainId[chainId], {
        value: {},
      });
    }
  });

  listCache?.set(list, tokenAddressMap);
  return tokenAddressMap;
}

// -------------------------------------
//   Hooks
// -------------------------------------
export function useAllLists(): {
  [url: string]: {
    current: TokenList | null;
    pendingUpdate: TokenList | null;
    loadingRequestId: string | null;
    error: string | null;
  };
} {
  return useSelector(selectorByUrls);
}

function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  return zipObject(
    supportedChainIds,
    supportedChainIds.map((chainId) => {
      return { ...map1[chainId], ...map2[chainId] };
    }),
  );
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector(selectorActiveUrls);
}

export function useInactiveListUrls() {
  return useSelector(inactiveUrlSelector) || [];
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  const activeTokens = useSelector(combinedTokenMapFromActiveUrlsSelector);
  return activeTokens;
}

// all tokens from inactive lists
export function useCombinedInactiveList(): TokenAddressMap {
  return useSelector(combinedTokenMapFromInActiveUrlsSelector);
}

export function useIsListActive(url: string): boolean {
  const activeTokenListUrls = useActiveListUrls();
  return useMemo(() => Boolean(activeTokenListUrls?.includes(url)), [activeTokenListUrls, url]);
}

/* ========== SETTING ========== */

export function useIsExpertMode(): boolean {
  return useSelector<AppState, boolean>((state) => state.dex?.setting?.expertMode);
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>();
  const expertMode = useIsExpertMode();

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateExpertMode({ expertMode: !expertMode }));
  }, [expertMode, dispatch]);

  return [expertMode, toggleSetExpertMode];
}

export function useSingleHopOnly(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>();

  const singleHopOnly = useSelector<AppState, boolean>(
    (state) => state.dex?.setting?.singleHopOnly,
  );

  const setSingleHopOnly = useCallback(() => {
    dispatch(updateSingleHopOnly());
  }, [dispatch]);

  return [singleHopOnly, setSingleHopOnly];
}

export function useGasPrice(): BigNumber {
  const option = useSelector<AppState, string>((state) => state.dex?.setting?.gasPriceOption);
  const gasPrices = useSelector<AppState, GasPrices>((state) => state.dex?.setting?.gasPrices);
  return gasPrices?.[option] ? BigNumber.from(gasPrices?.[option]) : Zero;
}

export function useGasPriceOptionManager(): [string, (gasPrice: string) => void] {
  const dispatch = useDispatch<AppDispatch>();
  const option = useSelector<AppState, string>((state) => state.dex?.setting?.gasPriceOption);

  const setGasPriceOption = useCallback(
    (gasPriceOption: string) => {
      dispatch(updateGasPriceOption({ gasPriceOption }));
    },
    [dispatch],
  );

  return [option, setGasPriceOption];
}

export function useHideExpertModeAcknowledgement(): [
  boolean,
  (showAcknowledgement: boolean) => void,
] {
  const dispatch = useDispatch<AppDispatch>();
  const hideExpertModeAcknowledgement = useSelector<AppState, boolean>((state) => {
    return state.dex?.setting?.hideExpertModeAcknowledgement;
  });

  const setHideExpertModeAcknowledgement = useCallback(
    (hideAcknowledgement: boolean) => {
      dispatch(
        updateHideExpertModeAcknowledgement({
          hideExpertModeAcknowledgement: hideAcknowledgement,
        }),
      );
    },
    [dispatch],
  );

  return [hideExpertModeAcknowledgement, setHideExpertModeAcknowledgement];
}

export function useGetGasPrices(): GasPrices {
  const options = useSelector((state: AppState) => state.dex.setting.gasPrices);
  return options;
}

export const useLimitOrderCurrencies = () => {
  const appState = useSwapState();
  return {
    inputCurrencyId: appState.limitOrderInputCurrencyId,
    outputCurrencyId: appState.limitOrderOutputCurrencyId,
  };
};

export const useLimitOrderActionHandlers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectLimitOrderCurrency({
          field,
          currencyId: currency?.isToken ? currency?.address : currency?.isNative ? 'ETH' : '',
        }),
      );
    },
    [dispatch],
  );

  const onUpdateCurrencies = useCallback(
    (inputCurrencyId?: string, outputCurrencyId?: string) => {
      dispatch(
        updateLimitOrderCurrency({
          inputCurrencyId,
          outputCurrencyId,
        }),
      );
    },
    [dispatch],
  );

  return {
    onCurrencySelection,
    onUpdateCurrencies,
  };
};

export const useLimitOrderCurrencyDefault = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { chainId } = useWeb3React();
  useEffect(() => {
    const { defaultSwapInput, defaultSwapOutput } = getDefaultSwapToken(chainId);
    dispatch(
      updateLimitOrderCurrency({
        inputCurrencyId: defaultSwapInput,
        outputCurrencyId: defaultSwapOutput,
      }),
    );
  }, [dispatch, chainId]);
};
