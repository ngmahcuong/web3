import { createReducer } from '@reduxjs/toolkit';
import {
  enterMarket,
  exitMarket,
  fetchEnteredMarkets,
  userMarketPositionFetched,
  userCompAccruedFetched,
  reset,
  fetchCompleted,
} from './actions';

export type State = {
  enteredMarkets: string[];
  supplying: Record<string, string>;
  borrowing: Record<string, string>;
  liquidity: string;
  shortfall: string;
  loading?: boolean;
};

const initialState = {
  supplying: {},
  borrowing: {},
  enteredMarkets: [],
  loading: true,
} as State;

export default createReducer(initialState, (builder) => {
  builder.addCase(reset, (state, { payload }) => {
    return initialState;
  });
  builder.addCase(fetchCompleted, (state) => {
    return {
      ...state,
      loading: false,
    };
  });
  builder.addCase(fetchEnteredMarkets, (state, { payload }) => {
    const { markets } = payload;
    return { ...state, enteredMarkets: markets };
  });

  builder.addCase(userMarketPositionFetched, (state, { payload }) => {
    const { borrowing, supplying } = payload;
    return {
      ...state,
      supplying,
      borrowing,
    };
  });

  builder.addCase(enterMarket, (state, { payload: { market } }) => {
    if (state) {
      return {
        ...state,
        enteredMarkets: state.enteredMarkets.concat([market]),
      };
    }
  });

  builder.addCase(exitMarket, (state, { payload: { market } }) => {
    if (state) {
      return {
        ...state,
        enteredMarkets: state.enteredMarkets.filter((x) => x !== market),
      };
    }
  });
  builder.addCase(userCompAccruedFetched, (state, { payload: { compAccrued } }) => {
    if (state) {
      return {
        ...state,
        rewardAccrued: compAccrued,
      };
    }
  });
});
