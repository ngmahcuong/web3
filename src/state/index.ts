import { configureStore } from '@reduxjs/toolkit';
import { load, save } from 'redux-localstorage-simple';
import application, { initialState } from './application/reducer';
import transactions from './transactions/reducer';
import user, { initialState as userInitialState } from './user/reducer';
import tokens, { initialState as tokensInitialState } from './tokens/reducer';
import markets from './markets/reducer';
import userLending from './lending/reducer';
import dex, { initialState as dexInitialState } from './dex/reducer';
import analytic, { initialState as analyticInitialState } from './analytic/reducer';

const PERSISTED_KEYS: string[] = [
  'user.savedAccount',
  'user.currentAccount',
  'user.connector',
  'transactions',
  'application.theme',
  'application.showZeroBalance',
  'application.transactionDeadline',
  'application.slippageTolerance',
  'dex.lastInputCurrencyIdSwap',
  'dex.lastOutputCurrencyIdSwap',
  'dex.importTokens',
  'dex.importPairs',
  'dex.tokenListActiveUrl',
  'dex.activeTokenListUrls',
  'dex.setting',
];
const PERSISTED_NAMESPACE = '__chai_protocol';

export const store = configureStore({
  reducer: {
    application,
    transactions,
    user,
    tokens,
    markets,
    userLending,
    dex,
    analytic,
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }),
    save({
      states: PERSISTED_KEYS,
      namespace: PERSISTED_NAMESPACE,
    }),
  ],
  preloadedState: load({
    states: PERSISTED_KEYS,
    disableWarnings: true,
    namespace: PERSISTED_NAMESPACE,
    preloadedState: {
      application: { ...initialState },
      user: { ...userInitialState },
      tokens: { ...tokensInitialState },
      dex: { ...dexInitialState },
      analytic: { ...analyticInitialState },
    },
  }),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
