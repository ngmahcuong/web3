import { createAction } from '@reduxjs/toolkit';
import { UserPositionInMarket } from '../../modules/lending/models/Lending';

export const userMarketPositionFetched = createAction(
  'user-lending/userMarketPositionFetched',
  (data: Array<UserPositionInMarket>) => {
    const borrowing: Record<string, string> = {};
    const supplying: Record<string, string> = {};

    data.forEach((item) => {
      borrowing[item.underlyingSymbol] = item.borrowBalance.toString();
      supplying[item.underlyingSymbol] = item.xTokenBalance.toString();
    });

    return {
      payload: {
        borrowing,
        supplying,
      },
    };
  },
);

export const fetchEnteredMarkets = createAction<{ markets: string[] }>(
  'user-lending/fetchAssets',
);

export const reset = createAction('user-lending/reset');

export const fetchCompleted = createAction('user-lending/fetchCompleted');

export const enterMarket = createAction<{ market: string }>('user-lending/enterMarket');

export const exitMarket = createAction<{ market: string }>('user-lending/exitMarket');

export const userLiquidityFetched = createAction<{
  liquidity: string;
  shortfall: string;
}>('user-lending/liquidityFetched');

export const userCompAccruedFetched = createAction<{ compAccrued: string }>(
  'user-lending/userCompAccruedFetched',
);
