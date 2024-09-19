import { createAction } from '@reduxjs/toolkit';
import { zipObject } from 'lodash';
import { ChainId, ConnectorName } from '../../config';

export const connectToAccount =
  createAction<{ account: string; connector: ConnectorName; chainId: ChainId }>('user/connect');

export const disconnectAccount = createAction('user/disconnect');

export const changeChain = createAction('user/changeChain');

export const watchToken = createAction('user/watchToken', (tokens: string[]) => ({
  payload: tokens?.filter((t) => !!t),
}));

export const unwatchToken = createAction('user/unwatchToken', (tokens: string[]) => ({
  payload: tokens?.filter((t) => !!t),
}));

export const balanceChanged =
  createAction<{ token: string; amount: string }>('user/balanceChanged');

export const allowanceChanged =
  createAction<{ token: string; spender: string; amount: string }>('user/approve/success');

export const multipleTokenBalanceFetched = createAction(
  'user/multipleTokenBalanceFetched',
  (symbols: string[], balances: string[]) => {
    return {
      payload: zipObject(symbols, balances),
    };
  },
);

export const multipleTokenAllowancesFetched = createAction(
  'user/multipleTokenAllowancesFetched',
  (spender: string, symbols: string[], allowances: string[]) => {
    return {
      payload: {
        symbols,
        allowances,
        spender,
      },
    };
  },
);
