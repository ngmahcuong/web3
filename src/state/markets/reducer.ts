import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';
import { AppState } from '..';
import { listMarket } from './actions';

export type MarketState = {
  marketName: string;
  asset: string;
  assetAddress: string;
  assetDecimals: number;
  marketAddress: string;
  significantDigits: number;
  isNativeToken: boolean;
  exchangeRate: string;
  cash: string;
  totalSupply: string;
  totalUnderlyingSupply: string;
  totalSupplyValue: string;
  totalBorrows: string;
  totalBorrowValue: string;
  supplyRatePerBlock: string;
  supplyRatePerYear: string;
  supplyApy: number;
  borrowRatePerBlock: string;
  borrowRatePerYear: string;
  borrowApy: number;
  totalReserves: string;
  underlyingPrice: string;
  collateralFactor: string;
  compSpeed: string;
  reserveFactor: string;
  borrowCap: string;
  supplyDistributionApy?: number;
  borrowDistributionApy?: number;
  marketLiquidity: string;
  disableSupply?: boolean;
  disableBorrow?: boolean;
  liquidationThreshold: string;
  liquidationIncentive: string;
  mintPaused: boolean;
  borrowPaused: boolean;
};

const adapter = createEntityAdapter<MarketState>({
  selectId: (t) => t.asset,
});

const initialState = adapter.getInitialState();

export default createReducer(initialState, (builder) => {
  builder.addCase(listMarket, (state, action) => {
    return adapter.setAll(state, action.payload);
  });
});

export const MarketSelectors = adapter.getSelectors((state: AppState) => state.markets);
