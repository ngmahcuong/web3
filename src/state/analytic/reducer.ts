import { createReducer } from '@reduxjs/toolkit';
import { updatePoolsData } from './actions';

export interface PoolData {
  id: string;
  stable: boolean;
  token0?: {
    id: string;
    symbol: string;
    name: string;
    totalLiquidity: number;
  };
  token1?: {
    id: string;
    symbol: string;
    name: string;
    totalLiquidity: number;
  };
  tokens?: {
    id: string;
    symbol: string;
    name: string;
  }[];
  reserve0?: number;
  reserve1?: number;
  liquidityUSD: number;
  liquidityUSDChange: number;
  totalSupply: number;
  volumeUSD: number;
  volumeUSDChange: number;
  volumeUSDWeek: number;
  token0Price?: number;
  token1Price?: number;
  fee24h?: number;
  lpToken?: string;
  apr?: number;
}

export interface AnalyticState {
  pools?: {
    loading: boolean;
    data: PoolData[];
  };
}

export const initialState: AnalyticState = {
  pools: {
    loading: true,
    data: undefined,
  },
};

export default createReducer(initialState, (builder) =>
  builder.addCase(updatePoolsData, (state, { payload: { poolsData, loading } }) => {
    state.pools = {
      ...state.pools,
      data: poolsData,
      loading,
    };
  }),
);
