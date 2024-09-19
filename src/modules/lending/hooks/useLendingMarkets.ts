import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import { createSelector } from '@reduxjs/toolkit';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getLendingRewardSymbol } from '../../../config';
import { AppState } from '../../../state';
import { MarketSelectors, MarketState } from '../../../state/markets/reducer';
import { useTokenPrice } from '../../../state/tokens/hooks';
import { BlocksPerDay } from '../../../utils/constants';
import { toBigNumber } from '../../../utils/numbers';
import { Market } from '../models/Lending';

const keys = [
  'exchangeRate',
  'cash',
  'totalSupply',
  'totalUnderlyingSupply',
  'totalSupplyValue',
  'totalBorrows',
  'totalBorrowValue',
  'supplyRatePerBlock',
  'supplyRatePerYear',
  'borrowRatePerBlock',
  'borrowRatePerYear',
  'totalReserves',
  'underlyingPrice',
  'collateralFactor',
  'compSpeed',
  'reserveFactor',
  'borrowCap',
  'marketLiquidity',
  'liquidationThreshold',
  'liquidationIncentive',
];
const selectMarket = (state: MarketState) => {
  const ret = { ...state } as any;
  keys.forEach((key) => {
    ret[key] = toBigNumber(state[key]);
  });

  return ret as Market;
};

const calculateDistributionApy = (market: Market, rewardPrice: BigNumber) => {
  if (market.compSpeed && market.compSpeed?.eq(Zero)) {
    return {
      supplyDistributionApy: 0,
      borrowDistributionApy: 0,
    };
  }
  if (!rewardPrice) {
    return {
      supplyDistributionApy: null,
      borrowDistributionApy: null,
    };
  }
  const supplyDistributionDaily = market.totalSupplyValue.eq(0)
    ? Zero
    : market.compSpeed.mul(BlocksPerDay).mul(rewardPrice).div(market.totalSupplyValue);

  const supplyDistributionApy =
    Math.pow(1 + +formatUnits(supplyDistributionDaily, 18), 365) - 1;

  const borrowDistributionDaily = market.totalBorrowValue.eq(0)
    ? Zero
    : market.compSpeed.mul(rewardPrice).mul(BlocksPerDay).div(market.totalBorrowValue);

  const borrowDistributionApy =
    Math.pow(1 + +formatUnits(borrowDistributionDaily, 18), 365) - 1;

  return {
    supplyDistributionApy,
    borrowDistributionApy,
  };
};

export const selectAllMarkets = createSelector(
  [MarketSelectors.selectAll, (s: AppState) => s.tokens.priceInUsd.MOJI],
  (markets, rewardPrice) => {
    return markets.map((x) => {
      const market = selectMarket(x);
      return {
        ...market,
        ...calculateDistributionApy(market, toBigNumber(rewardPrice)),
      };
    });
  },
);

export const useAllMarkets = (): Market[] => {
  return useSelector(selectAllMarkets);
};

export const useAllMarketIds = () => {
  return useSelector<AppState, string[]>(
    (state) => MarketSelectors.selectIds(state) as string[],
  );
};

export const useMarket = (asset: string): Market => {
  const { chainId } = useWeb3React();
  const rewardSymbol = getLendingRewardSymbol(chainId);
  const marketState = useSelector((state: AppState) =>
    MarketSelectors.selectById(state, asset),
  );
  const rewardPrice = useTokenPrice(rewardSymbol);
  return useMemo(() => {
    if (!marketState) {
      return;
    }

    const market = selectMarket(marketState);
    return {
      ...market,
      ...calculateDistributionApy(market, rewardPrice),
    };
  }, [marketState, rewardPrice]);
};

export const useMarketByAddress = (marketAddress: string): Market => {
  const { chainId } = useWeb3React();
  const rewardSymbol = getLendingRewardSymbol(chainId);
  const marketState = useSelector((state: AppState) =>
    MarketSelectors.selectById(state, marketAddress),
  );
  const rewardPrice = useTokenPrice(rewardSymbol);
  return useMemo(() => {
    if (!marketState) {
      return;
    }

    const market = selectMarket(marketState);
    return {
      ...market,
      ...calculateDistributionApy(market, rewardPrice),
    };
  }, [marketState, rewardPrice]);
};

export const useMarketEntities = () => {
  return useSelector(MarketSelectors.selectEntities);
};
