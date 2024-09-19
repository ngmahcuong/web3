import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { Currency } from '@uniswap/sdk-core';
import { TokenList, Version } from '@uniswap/token-lists';
import { BigNumber } from 'ethers';
import { ImportPair, SerializedToken } from '../../modules/dex/models/Pair';
import { GasPrices } from './reducer';

export enum Route {
  FROM = 'FROM',
  TO = 'TO',
}

export type Path = {
  id: string;
  poolId: string;
  source: string;
  target: string;
  type: 'stableswap' | 'uniswapv2';
  meta: any;
};

export type Trade = {
  amountOut?: BigNumber;
  minAmountOut?: BigNumber;
  priceImpact?: number;
  path: Path[];
  priceInputPerOutput?: BigNumber;
  priceOutputPerInput?: BigNumber;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
};

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum LimitOrderField {
  INPUT = 'LIMIT_ORDER_INPUT',
  OUTPUT = 'LIMIT_ORDER_OUTPUT',
}

// SWAP

export const selectCurrency =
  createAction<{ field: Field; currencyId: string }>('amm/selectCurrency');

export const updateCurrency = createAction<{
  inputCurrencyId: string;
  outputCurrencyId: string;
}>('dex/updateCurrency');
export const setRecipient = createAction<{ recipient: string | null }>('amm/setRecipient');

export const setLastPairSwap = createAction<{
  inputCurrencyId: string;
  outputCurrencyId: string;
}>('dex/setLastPairSwap');

export const addSerializedToken =
  createAction<{ serializedToken: SerializedToken }>('dex/addSerializedToken');
export const removeSerializedToken = createAction<{ chainId: number; address: string }>(
  'dex/removeSerializedToken',
);

// POOL

export const loadedPairsEmpty = createAction('user/loadedTrackPairs');

export const pairImported = createAction<{
  chainId: number;
  pairs: ImportPair[];
}>('dex/pairImported');

/* ========== TOKEN LIST ========== */

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string }>;
  rejected: ActionCreatorWithPayload<{ url: string; errorMessage: string; requestId: string }>;
}> = {
  pending: createAction('dex/tokenLists/fetchTokenList/pending'),
  fulfilled: createAction('dex/tokenLists/fetchTokenList/fulfilled'),
  rejected: createAction('dex/tokenLists/fetchTokenList/rejected'),
};

// init lists
export const initLists = createAction<string>('dex/tokenLists/initLists');
// add and remove from list options
export const addList = createAction<string>('tokenLists/addList');
export const removeList = createAction<string>('dex/tokenLists/removeList');

// select which lists to search across from loaded lists
export const enableList = createAction<string>('dex/tokenLists/enableList');
export const disableList = createAction<string>('dex/tokenLists/disableList');

// versioning
export const acceptListUpdate = createAction<string>('dex/tokenLists/acceptListUpdate');
export const rejectVersionUpdate = createAction<Version>('dex/tokenLists/rejectVersionUpdate');

/* ========== SETTING ========== */

export const updateExpertMode = createAction<{ expertMode: boolean }>('dex/updateExpertMode');

export const updateSingleHopOnly = createAction('dex/updateSingleHopOnly');

export const updateGasPriceOption = createAction<{ gasPriceOption: string }>(
  'dex/updateGasPriceOption',
);

export const updateHideExpertModeAcknowledgement = createAction<{
  hideExpertModeAcknowledgement: boolean;
}>('dex/hideExpertModeAcknowledgement');

export const updateGasPrices = createAction<{
  gasPrices: GasPrices;
}>('dex/updateGasPrices');

// LIMIT ORDER

export const selectLimitOrderCurrency = createAction<{
  field: Field;
  currencyId: string;
}>('limitorder/selectCurrency');

export const updateLimitOrderCurrency = createAction<{
  inputCurrencyId: string;
  outputCurrencyId: string;
}>('limitorder/updateCurrency');

export const setLimitOrderLastPairSwap = createAction<{
  inputCurrencyId: string;
  outputCurrencyId: string;
}>('limitorder/setLastPairSwap');
