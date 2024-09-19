import { createReducer } from '@reduxjs/toolkit';
import { getVersionUpgrade, TokenList, VersionUpgrade } from '@uniswap/token-lists';
import { BigNumber } from 'ethers';
import { reduce, uniqBy } from 'lodash';
import {
  DEFAULT_ACTIVE_LIST_URLS,
  DEFAULT_LIST_OF_LISTS,
} from '../../modules/dex/config/lists';
import { ImportPair, SerializedToken } from '../../modules/dex/models/Pair';
import {
  Field,
  selectCurrency,
  setLastPairSwap,
  setRecipient,
  updateCurrency,
  addSerializedToken,
  removeSerializedToken,
  pairImported,
  loadedPairsEmpty,
  acceptListUpdate,
  addList,
  fetchTokenList,
  removeList,
  enableList,
  disableList,
  initLists,
  updateGasPriceOption,
  updateExpertMode,
  updateSingleHopOnly,
  updateHideExpertModeAcknowledgement,
  updateGasPrices,
  selectLimitOrderCurrency,
  updateLimitOrderCurrency,
  setLimitOrderLastPairSwap,
} from './actions';

export enum GasOption {
  Normal = 'normal',
  Fast = 'fast',
  VeryFast = 'veryfast',
}

export type GasPrices = {
  [GasOption.Normal]: BigNumber;
  [GasOption.Fast]: BigNumber;
  [GasOption.VeryFast]: BigNumber;
};

export interface SwapState {
  swapInputCurrencyId?: string;
  swapOutputCurrencyId?: string;
  recipient: string | null;
  lastInputCurrencyIdSwap?: string;
  lastOutputCurrencyIdSwap?: string;
  importTokens?: {
    [chainId: number]: {
      [address: string]: SerializedToken;
    };
  };
  importPairs?: {
    [chainId: number]: ImportPair[];
  };
  tokenListActiveUrl?: {
    [url: string]: {
      current: TokenList | null;
      pendingUpdate: TokenList | null;
      loadingRequestId: string | null;
      error: string | null;
    };
  };
  // currently active lists
  activeTokenListUrls?: string[] | undefined;
  setting?: {
    gasPriceOption: string;
    expertMode: boolean;
    singleHopOnly: boolean;
    hideExpertModeAcknowledgement?: boolean;
    gasPrices: GasPrices;
  };
  limitOrderInputCurrencyId?: string;
  limitOrderOutputCurrencyId?: string;
  limitOrderLastInputCurrencyId?: string;
  limitOrderLastOutputCurrencyId?: string;
}

export const initialState: SwapState = {
  swapInputCurrencyId: '',
  swapOutputCurrencyId: '',
  recipient: null,
  setting: null,
  limitOrderInputCurrencyId: '',
  limitOrderOutputCurrencyId: '',
};

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(updateCurrency, (state, { payload: { inputCurrencyId, outputCurrencyId } }) => {
      return {
        ...state,
        swapInputCurrencyId: inputCurrencyId,
        swapOutputCurrencyId: outputCurrencyId,
      };
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? 'swapOutputCurrencyId' : 'swapInputCurrencyId';
      const selectedField =
        field === Field.INPUT ? 'swapInputCurrencyId' : 'swapOutputCurrencyId';
      if (currencyId === state[otherField]) {
        // the case where we have to swap the order
        return {
          ...state,
          [selectedField]: currencyId,
          [otherField]: state[field],
        };
      }
      // the normal case
      return {
        ...state,
        [selectedField]: currencyId,
      };
    })
    .addCase(
      updateLimitOrderCurrency,
      (state, { payload: { inputCurrencyId, outputCurrencyId } }) => {
        return {
          ...state,
          limitOrderInputCurrencyId: inputCurrencyId,
          limitOrderOutputCurrencyId: outputCurrencyId,
        };
      },
    )
    .addCase(selectLimitOrderCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField =
        field === Field.INPUT ? 'limitOrderOutputCurrencyId' : 'limitOrderInputCurrencyId';
      const selectedField =
        field === Field.INPUT ? 'limitOrderInputCurrencyId' : 'limitOrderOutputCurrencyId';
      if (currencyId === state[otherField]) {
        // the case where we have to swap the order
        return {
          ...state,
          [selectedField]: currencyId,
          [otherField]: state[field],
        };
      }
      // the normal case
      return {
        ...state,
        [selectedField]: currencyId,
      };
    })
    .addCase(
      setLimitOrderLastPairSwap,
      (state, { payload: { inputCurrencyId, outputCurrencyId } }) => {
        return {
          ...state,
          limitOrderLastInputCurrencyId: inputCurrencyId,
          limitOrderLastOutputCurrencyId: outputCurrencyId,
        };
      },
    )
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      return {
        ...state,
        recipient: recipient,
      };
    })
    .addCase(setLastPairSwap, (state, { payload: { inputCurrencyId, outputCurrencyId } }) => {
      return {
        ...state,
        lastInputCurrencyIdSwap: inputCurrencyId,
        lastOutputCurrencyIdSwap: outputCurrencyId,
      };
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.importTokens) {
        state.importTokens = {};
      }
      state.importTokens[serializedToken.chainId] =
        state.importTokens[serializedToken.chainId] || {};
      state.importTokens[serializedToken.chainId][serializedToken.address] = serializedToken;
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      if (!state.importTokens) {
        state.importTokens = {};
      }
      state.importTokens[chainId] = state.importTokens[chainId] || {};
      delete state.importTokens[chainId][address];
    })
    .addCase(loadedPairsEmpty, (state) => {
      return {
        ...state,
        position: {
          pairs: undefined,
          loading: false,
        },
      };
    })
    .addCase(pairImported, (state, { payload: { chainId, pairs } }) => {
      if (!chainId || !pairs?.length) {
        return {
          ...state,
        };
      }
      const currentPairs = (state.importPairs && state.importPairs[chainId]) || [];

      const newPairs = uniqBy(pairs.concat(currentPairs), (x) => x.address);

      const newPairImported = {
        [chainId]: newPairs,
      };

      return {
        ...state,
        importPairs: newPairImported,
      };
    })
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
      state.tokenListActiveUrl[url] = {
        current: null,
        pendingUpdate: null,
        ...state.tokenListActiveUrl[url],
        loadingRequestId: requestId,
        error: null,
      };
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url } }) => {
      const current = state.tokenListActiveUrl[url]?.current;
      const loadingRequestId = state.tokenListActiveUrl[url]?.loadingRequestId;

      // no-op if update does nothing
      if (current) {
        const upgradeType = getVersionUpgrade(current.version, tokenList.version);

        if (upgradeType === VersionUpgrade.NONE) return;
        if (loadingRequestId === null || loadingRequestId === requestId) {
          state.tokenListActiveUrl[url] = {
            ...state.tokenListActiveUrl[url],
            loadingRequestId: null,
            error: null,
            current,
            pendingUpdate: tokenList,
          };
        }
      } else {
        // activate if on default active
        if (DEFAULT_ACTIVE_LIST_URLS.includes(url)) {
          state.activeTokenListUrls?.push(url);
        }
        state.tokenListActiveUrl[url] = {
          ...state.tokenListActiveUrl[url],
          loadingRequestId: null,
          error: null,
          current: tokenList,
          pendingUpdate: null,
        };
      }
    })
    .addCase(
      fetchTokenList.rejected,
      (state, { payload: { url, requestId, errorMessage } }) => {
        if (state.tokenListActiveUrl[url]?.loadingRequestId !== requestId) {
          // no-op since it's not the latest request
          return;
        }

        state.tokenListActiveUrl[url] = {
          ...state.tokenListActiveUrl[url],
          loadingRequestId: null,
          error: errorMessage,
          current: null,
          pendingUpdate: null,
        };
      },
    )
    .addCase(addList, (state, { payload: url }) => {
      if (!state.tokenListActiveUrl[url]) {
        state.tokenListActiveUrl[url] = null;
      }
    })
    .addCase(removeList, (state, { payload: url }) => {
      if (state.tokenListActiveUrl[url]) {
        delete state.tokenListActiveUrl[url];
      }
      // remove list from active urls if needed
      if (state.activeTokenListUrls && state.activeTokenListUrls.includes(url)) {
        state.activeTokenListUrls = state.activeTokenListUrls.filter((u) => u !== url);
      }
    })
    .addCase(enableList, (state, { payload: url }) => {
      if (!state.tokenListActiveUrl[url]) {
        state.tokenListActiveUrl[url] = null;
      }

      if (state.activeTokenListUrls && !state.activeTokenListUrls.includes(url)) {
        state.activeTokenListUrls.push(url);
      }

      if (!state.activeTokenListUrls) {
        state.activeTokenListUrls = [url];
      }
    })
    .addCase(disableList, (state, { payload: url }) => {
      if (state.activeTokenListUrls && state.activeTokenListUrls.includes(url)) {
        state.activeTokenListUrls = state.activeTokenListUrls.filter((u) => u !== url);
      }
    })
    .addCase(acceptListUpdate, (state, { payload: url }) => {
      if (!state.tokenListActiveUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update');
      }
      state.tokenListActiveUrl[url] = {
        ...state.tokenListActiveUrl[url],
        pendingUpdate: null,
        current: state.tokenListActiveUrl[url].pendingUpdate,
      };
    })
    .addCase(initLists, (state) => {
      state.tokenListActiveUrl = reduce(
        DEFAULT_LIST_OF_LISTS,
        function (memo, listUrl) {
          memo[listUrl] = null;
          return memo;
        },
        {},
      );
      if (!state.activeTokenListUrls) {
        state.activeTokenListUrls = DEFAULT_ACTIVE_LIST_URLS;
      }
    })
    .addCase(updateGasPriceOption, (state, action) => {
      state.setting = {
        ...state.setting,
        gasPriceOption: action.payload.gasPriceOption,
      };
    })
    .addCase(updateExpertMode, (state, action) => {
      state.setting = {
        ...state.setting,
        expertMode: action.payload.expertMode,
      };
    })
    .addCase(updateSingleHopOnly, (state, action) => {
      state.setting = {
        ...state.setting,
        singleHopOnly: !state?.setting?.singleHopOnly,
      };
    })
    .addCase(
      updateHideExpertModeAcknowledgement,
      (state, { payload: { hideExpertModeAcknowledgement } }) => {
        state.setting = {
          ...state.setting,
          hideExpertModeAcknowledgement,
        };
      },
    )
    .addCase(updateGasPrices, (state, { payload: { gasPrices } }) => {
      state.setting = {
        ...state.setting,
        gasPrices,
      };
    }),
);
