import { createReducer } from '@reduxjs/toolkit';
import zipObject from 'lodash/zipObject';
import { ChainId, ConnectorName } from '../../config';
import {
  allowanceChanged,
  balanceChanged,
  connectToAccount,
  disconnectAccount,
  multipleTokenBalanceFetched,
  multipleTokenAllowancesFetched,
  watchToken,
  unwatchToken,
  changeChain,
} from './actions';

type State = {
  savedAccount: string;
  currentAccount: string;
  connector: ConnectorName;
  chainId: ChainId;
  balances: Record<string, string>;
  allowances: Record<string, Record<string, string>>;
  observedTokens: Record<string, number>;
};

export const initialState = {
  savedAccount: undefined,
  currentAccount: undefined,
  observedTokens: {},
  balances: {},
  allowances: {},
} as State;

const reducer = createReducer(initialState, (builder) => {
  builder.addCase(connectToAccount, (state, { payload }) => {
    return {
      ...initialState,
      savedAccount: payload.account,
      currentAccount: payload.account,
      connector: payload.connector,
      chainId: payload.chainId,
      observedTokens: state.observedTokens,
    };
  });

  builder.addCase(disconnectAccount, (state) => {
    return {
      ...initialState,
      observedTokens: state.observedTokens,
    };
  });

  builder.addCase(changeChain, (state) => {
    state.currentAccount = undefined;
  });

  builder.addCase(balanceChanged, (state, { payload }) => {
    state.balances[payload.token] = payload.amount;
  });

  builder.addCase(allowanceChanged, (state, { payload }) => {
    state.allowances[payload.token] = {
      ...(state.allowances[payload.token] || {}),
      [payload.spender]: payload.amount,
    };
  });

  builder.addCase(multipleTokenBalanceFetched, (state, { payload }) => {
    state.balances = Object.assign({}, state.balances, payload);
  });

  builder.addCase(multipleTokenAllowancesFetched, (state, { payload }) => {
    payload.symbols.forEach((t, idx) => {
      if (!state.allowances[t]) {
        state.allowances[t] = {};
      }
      state.allowances[t][payload.spender] = payload.allowances[idx];
    });
  });

  builder.addCase(watchToken, (state, { payload }) => {
    const updated = zipObject(
      payload,
      payload.map((t) =>
        !state.observedTokens[t] || state.observedTokens[t] < 0
          ? 1
          : state.observedTokens[t] + 1,
      ),
    );

    state.observedTokens = {
      ...state.observedTokens,
      ...updated,
    };
  });

  builder.addCase(unwatchToken, (state, { payload }) => {
    const updated = zipObject(
      payload,
      payload.map((t) => (state.observedTokens[t] ? state.observedTokens[t] - 1 : 0)),
    );

    state.observedTokens = {
      ...state.observedTokens,
      ...updated,
    };
  });
});

export default reducer;
