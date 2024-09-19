import { createAction } from '@reduxjs/toolkit';

export type PopupContent =
  | {
      type: 'error';
      message: string;
      title: string;
    }
  | {
      type: 'waiting';
      title?: string;
      message: string;
    }
  | {
      type: 'transaction';
      hash: string;
    };

export const updateBlockNumber = createAction<{
  chainId: number;
  blockNumber: number;
}>('app/updateBlockNumber');

export const addPopup = createAction<{
  key?: string;
  removeAfterMs?: number | null;
  content: PopupContent;
}>('app/addPopup');

export const removePopup = createAction<{ key: string }>('app/removePopup');

export const setSlippageTolerance = createAction<{ slippage: number }>(
  'app/setSlippageTolerance',
);

export const setTransactionDeadline = createAction<{ deadline: number }>(
  'app/setTransactionDeadline',
);

export const toggleMainNav =
  createAction<{ isOpen: boolean | null | undefined }>('app/toggleMainNav');

export const toggleTheme = createAction('app/toggleTheme');

export const toggleShowZeroBalance = createAction('app/toggleShowZeroBalance');

export const updateAppData = createAction(
  'app/updateAppData',
  (timestamp: number, chainId: number) => {
    return {
      payload: {
        timestamp,
        chainId,
      },
    };
  },
);
