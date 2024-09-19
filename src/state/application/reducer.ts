import { createReducer, nanoid } from '@reduxjs/toolkit';
import {
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  setSlippageTolerance,
  setTransactionDeadline,
  toggleMainNav,
  toggleTheme,
  updateAppData,
  toggleShowZeroBalance,
} from './actions';

type PopupList = Array<{
  key: string;
  show: boolean;
  content: PopupContent;
  removeAfterMs: number | null;
}>;

export interface ApplicationState {
  blockNumber: { [chainId: number]: number };
  popupList: PopupList;
  slippageTolerance: number;
  transactionDeadline: number; // in minutes
  showZeroBalance?: boolean;
  mainNavOpen?: boolean;
  theme: 'dark' | 'light';
  lastUpdated?: { [chainId: number]: number | undefined };
}

export const initialState: ApplicationState = {
  blockNumber: {},
  lastUpdated: {},
  popupList: [],
  slippageTolerance: 0.005,
  transactionDeadline: 10,
  showZeroBalance: false,
  theme: 'light',
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload;
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber;
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId]);
      }
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs } }) => {
      state.popupList = (
        key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList
      ).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ]);
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false;
        }
      });
    })
    .addCase(setSlippageTolerance, (state, { payload: { slippage } }) => {
      state.slippageTolerance = slippage;
    })
    .addCase(setTransactionDeadline, (state, { payload: { deadline } }) => {
      state.transactionDeadline = deadline;
    })
    .addCase(toggleMainNav, (state, { payload }) => {
      if (payload.isOpen == null) {
        state.mainNavOpen = !state.mainNavOpen;
      } else {
        state.mainNavOpen = payload.isOpen;
      }
    })
    .addCase(toggleTheme, (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark';
      } else {
        state.theme = 'light';
      }
    })
    .addCase(toggleShowZeroBalance, (state) => {
      if (state.showZeroBalance) {
        state.showZeroBalance = false;
      } else {
        state.showZeroBalance = true;
      }
    })
    .addCase(updateAppData, (state, { payload }) => {
      const { chainId, timestamp } = payload;
      state.lastUpdated[chainId] = timestamp;
    }),
);
