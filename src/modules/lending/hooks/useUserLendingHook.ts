import { Zero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import { createSelector } from '@reduxjs/toolkit';
import { mapValues } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../state';
import { MarketSelectors } from '../../../state/markets/reducer';
import {
  BlocksPerDay,
  BlocksPerYear,
  LendingPrecision,
  Precision,
} from '../../../utils/constants';
import { sum, toBigNumber } from '../../../utils/numbers';
import { LendingUserInfo } from '../models/Lending';
import { useCalcAccountHealth } from './useCalcAccountHealth';
import { selectAllMarkets } from './useLendingMarkets';

export const useLendingUserInfo = () => {
  const data = useSelector((state: AppState) => state.userLending);

  return useMemo<LendingUserInfo>(() => {
    return {
      ...data,
      borrowing: mapValues(data.borrowing, toBigNumber),
      supplying: mapValues(data.supplying, toBigNumber),
      liquidity: toBigNumber(data.liquidity),
      shortfall: toBigNumber(data.shortfall),
    };
  }, [data]);
};

export const useLendingUserInfoPosition = (asset: string) => {
  const userLending = useLendingUserInfo();

  return useMemo(() => {
    return userLending
      ? {
          supplying: userLending?.supplying ? userLending?.supplying[asset] : null,
          borrowing: userLending?.borrowing ? userLending?.borrowing[asset] : null,
        }
      : {};
  }, [asset, userLending]);
};

export const useIsEnteredMarket = (market: string) => {
  const userLending = useLendingUserInfo();
  return userLending && userLending?.enteredMarkets?.includes(market);
};

const selectUserSupplying = (s: AppState) => mapValues(s.userLending.supplying, toBigNumber);
const selectUserBorrowing = (s: AppState) => mapValues(s.userLending.borrowing, toBigNumber);

const selectUserTotalSupply = createSelector(
  [MarketSelectors.selectAll, selectUserSupplying],
  (markets, balances) => {
    return markets
      .map((market) => {
        const balance = balances[market.asset];

        return balance
          ? balance
              .mul(market.exchangeRate)
              .mul(market.underlyingPrice)
              .div(LendingPrecision)
              .div(LendingPrecision)
          : Zero;
      })
      .reduce(sum, Zero);
  },
);

const selectUserBorrowLimit = createSelector(
  [
    MarketSelectors.selectAll,
    selectUserSupplying,
    (s: AppState) => s.userLending.enteredMarkets,
  ],
  (markets, balances, enteredMarkets) => {
    const borrowLimit = markets
      .map((market) => {
        if (!enteredMarkets.includes(market.marketAddress)) {
          return Zero;
        }

        const balance = balances[market.asset];

        return balance
          ? balance
              .mul(market.underlyingPrice)
              .mul(market.exchangeRate)
              .mul(market.collateralFactor)
              .div(LendingPrecision)
              .div(LendingPrecision)
              .div(LendingPrecision)
          : Zero;
      })
      .reduce(sum, Zero);
    const liquidationThreshold = markets
      .map((market) => {
        if (!enteredMarkets.includes(market.marketAddress)) {
          return Zero;
        }

        const balance = balances[market.asset];

        return balance
          ? balance
              .mul(market.underlyingPrice)
              .mul(market.exchangeRate)
              .mul(market.liquidationThreshold)
              .div(LendingPrecision)
              .div(LendingPrecision)
              .div(LendingPrecision)
          : Zero;
      })
      .reduce(sum, Zero);

    return {
      borrowLimit,
      liquidationThreshold,
    };
  },
);

const selectUserBorrowBalance = createSelector(
  [MarketSelectors.selectAll, selectUserBorrowing],
  (markets, userBorrow) => {
    return markets
      .map((t) => {
        const borrowing = userBorrow[t.asset];
        return borrowing?.mul(t.underlyingPrice).div(LendingPrecision) || Zero;
      })
      .reduce(sum, Zero);
  },
);

const selectUserBorrowBalancePositions = createSelector(
  [MarketSelectors.selectAll, selectUserBorrowing],
  (markets, userBorrow) => {
    return markets.map((t) => {
      const borrowing = userBorrow[t.asset];
      return {
        asset: t.asset,
        borrowBalance: borrowing?.mul(t.underlyingPrice).div(LendingPrecision) || Zero,
      };
    });
  },
);

const selectRewardPrice = createSelector([(t: AppState) => t.tokens.priceInUsd.MOJI], (x) =>
  toBigNumber(x),
);

const selectNetApy = createSelector(
  [
    selectAllMarkets,
    selectUserSupplying,
    selectUserBorrowing,
    selectUserTotalSupply,
    selectRewardPrice,
  ],
  (markets, supplying, borrowing, totalSupply, rewardPrice) => {
    if (totalSupply.eq(0)) {
      return 0;
    }

    // incase of reward price not available
    rewardPrice = rewardPrice || Zero;
    const dailyInterest = markets
      .map((t) => {
        const marketSupply = supplying[t.asset];
        const marketBorrow = borrowing[t.asset];
        const income =
          marketSupply
            ?.mul(t.exchangeRate)
            .mul(t.underlyingPrice)
            .mul(t.supplyRatePerBlock)
            .mul(BlocksPerDay)
            .div(LendingPrecision)
            .div(LendingPrecision)
            .div(LendingPrecision) || Zero;

        const supplyDistribution =
          t.totalSupply.eq(0) || !marketSupply
            ? Zero
            : marketSupply
                ?.mul(t.compSpeed)
                .mul(BlocksPerDay)
                .mul(rewardPrice)
                .div(t.totalSupply)
                .div(Precision);

        const borrowDistribution =
          t.totalBorrows.eq(0) || !marketBorrow
            ? Zero
            : marketBorrow
                ?.mul(t.compSpeed)
                .mul(BlocksPerDay)
                .mul(rewardPrice)
                .div(t.totalBorrows)
                .div(LendingPrecision);

        const outcome =
          marketBorrow
            ?.mul(t.underlyingPrice)
            .mul(t.borrowRatePerBlock)
            .mul(BlocksPerDay)
            .div(LendingPrecision)
            .div(LendingPrecision) || Zero;

        return income.add(supplyDistribution).add(borrowDistribution).sub(outcome);
      })
      .reduce(sum, Zero);

    const dailyEarnRate = +formatUnits(
      dailyInterest.mul(LendingPrecision).div(totalSupply),
      18,
    );
    const netApy = Math.pow(1 + dailyEarnRate, 365) - 1;
    return netApy;
  },
);

const selectSupplyApy = createSelector(
  [selectAllMarkets, selectUserSupplying, selectUserTotalSupply, selectRewardPrice],
  (markets, supplying, totalSupply, rewardPrice) => {
    if (totalSupply.eq(0)) {
      return 0;
    }

    // incase of reward price not available
    rewardPrice = rewardPrice || Zero;
    const dailyInterest = markets
      .map((t) => {
        const marketSupply = supplying[t.asset];
        const income =
          marketSupply
            ?.mul(t.exchangeRate)
            .mul(t.underlyingPrice)
            .mul(t.supplyRatePerBlock)
            .mul(BlocksPerYear)
            .div(LendingPrecision)
            .div(LendingPrecision)
            .div(LendingPrecision) || Zero;

        const supplyDistribution =
          t.totalSupply.eq(0) || !marketSupply
            ? Zero
            : marketSupply
                ?.mul(t.compSpeed)
                .mul(BlocksPerYear)
                .mul(rewardPrice)
                .div(t.totalSupply)
                .div(Precision);

        return income.add(supplyDistribution);
      })
      .reduce(sum, Zero);

    return +formatUnits(dailyInterest.mul(LendingPrecision).div(totalSupply), 18);
  },
);

const selectBorrowApy = createSelector(
  [
    selectAllMarkets,
    selectUserSupplying,
    selectUserBorrowing,
    selectRewardPrice,
    selectUserBorrowBalance,
  ],
  (markets, supplying, borrowing, rewardPrice, totalBorrows) => {
    if (totalBorrows.eq(0)) {
      return 0;
    }

    // incase of reward price not available
    rewardPrice = rewardPrice || Zero;
    const dailyInterest = markets
      .map((t) => {
        const marketBorrow = borrowing[t.asset];

        const borrowDistribution =
          t.totalBorrows.eq(0) || !marketBorrow
            ? Zero
            : marketBorrow
                ?.mul(t.compSpeed)
                .mul(BlocksPerYear)
                .mul(rewardPrice)
                .div(t.totalBorrows)
                .div(LendingPrecision);

        const outcome =
          marketBorrow
            ?.mul(t.underlyingPrice)
            .mul(t.borrowRatePerBlock)
            .mul(BlocksPerYear)
            .div(LendingPrecision)
            .div(LendingPrecision) || Zero;

        return outcome.sub(borrowDistribution);
      })
      .reduce(sum, Zero);

    return +formatUnits(dailyInterest.mul(LendingPrecision).div(totalBorrows), 18);
  },
);

const selectApyRatio = createSelector(
  [
    selectAllMarkets,
    selectUserSupplying,
    selectUserBorrowing,
    selectUserTotalSupply,
    selectRewardPrice,
  ],
  (markets, supplying, borrowing, totalSupply, rewardPrice) => {
    if (totalSupply.eq(0)) {
      return 0;
    }

    // incase of reward price not available
    rewardPrice = rewardPrice || Zero;
    const dailyInterest = markets
      .map((t) => {
        const marketSupply = supplying[t.asset];
        const marketBorrow = borrowing[t.asset];
        const income =
          marketSupply
            ?.mul(t.exchangeRate)
            .mul(t.underlyingPrice)
            .mul(t.supplyRatePerBlock)
            .mul(BlocksPerDay)
            .div(LendingPrecision)
            .div(LendingPrecision)
            .div(LendingPrecision) || Zero;

        const supplyDistribution =
          t.totalSupply.eq(0) || !marketSupply
            ? Zero
            : marketSupply
                ?.mul(t.compSpeed)
                .mul(BlocksPerDay)
                .mul(rewardPrice)
                .div(t.totalSupply)
                .div(Precision);

        const borrowDistribution =
          t.totalBorrows.eq(0) || !marketBorrow
            ? Zero
            : marketBorrow
                ?.mul(t.compSpeed)
                .mul(BlocksPerDay)
                .mul(rewardPrice)
                .div(t.totalBorrows)
                .div(LendingPrecision);

        return income.add(supplyDistribution).add(borrowDistribution);
      })
      .reduce(sum, Zero);

    const dailyPayInterest = markets
      .map((t) => {
        const marketBorrow = borrowing[t.asset];

        const outcome =
          marketBorrow
            ?.mul(t.underlyingPrice)
            .mul(t.borrowRatePerBlock)
            .mul(BlocksPerDay)
            .div(LendingPrecision)
            .div(LendingPrecision) || Zero;

        return outcome;
      })
      .reduce(sum, Zero);
    const total = dailyInterest.add(dailyPayInterest);
    return total.eq(0) ? 0 : dailyPayInterest.mul(1e4).div(total).div(1e2).toNumber();
  },
);

export const useLendingUserInfoBalance = () => {
  const { loading } = useSelector((state: AppState) => state.userLending);
  const totalSupply = useSelector(selectUserTotalSupply);
  const { borrowLimit, liquidationThreshold } = useSelector(selectUserBorrowLimit);
  const borrowBalance = useSelector(selectUserBorrowBalance);
  const netApy = useSelector(selectNetApy);
  const supplyApy = useSelector(selectSupplyApy);
  const borrowApy = useSelector(selectBorrowApy);
  const apyRatio = useSelector(selectApyRatio);

  const borrowLimitPercentage = useMemo(() => {
    return borrowLimit.eq(0) ? Zero : borrowBalance.mul(Precision).div(borrowLimit);
  }, [borrowBalance, borrowLimit]);

  const borrowLimitPercentageNumber = useMemo(() => {
    return formatUnits(borrowLimitPercentage, 16);
  }, [borrowLimitPercentage]);

  const accountHealth = useCalcAccountHealth(liquidationThreshold, borrowBalance);

  return useMemo(() => {
    if (loading) {
      return {
        loading: true,
        totalSupply: undefined,
        borrowBalance: undefined,
        borrowLimit: undefined,
        borrowLimitPercentage: undefined,
        borrowLimitPercentageNumber: undefined,
        netApy: undefined,
        supplyApy: undefined,
        borrowApy: undefined,
        apyRatio: undefined,
        accountHealth: undefined,
        liquidationThreshold: undefined,
      };
    }
    return {
      loading: false,
      totalSupply,
      borrowBalance,
      borrowLimit,
      borrowLimitPercentage,
      borrowLimitPercentageNumber,
      netApy,
      supplyApy,
      borrowApy,
      apyRatio,
      accountHealth,
      liquidationThreshold,
    };
  }, [
    loading,
    totalSupply,
    borrowBalance,
    borrowLimit,
    borrowLimitPercentage,
    borrowLimitPercentageNumber,
    netApy,
    supplyApy,
    borrowApy,
    apyRatio,
    accountHealth,
    liquidationThreshold,
  ]);
};

export const useLendingUserInfoBalancePosition = (asset: string) => {
  const totalSupply = useSelector(selectUserTotalSupply);
  const { borrowLimit, liquidationThreshold } = useSelector(selectUserBorrowLimit);
  const borrowBalances = useSelector(selectUserBorrowBalancePositions);
  const borrowBalance = borrowBalances.find((x) => x.asset === asset)?.borrowBalance || Zero;
  const borrowLimitPercentage = useMemo(() => {
    return borrowLimit.eq(0) ? Zero : borrowBalance.mul(Precision).div(borrowLimit);
  }, [borrowBalance, borrowLimit]);

  return useMemo(() => {
    return {
      totalSupply,
      borrowBalance: borrowBalance,
      borrowLimit,
      borrowLimitPercentage,
      liquidationThreshold,
    };
  }, [totalSupply, borrowBalance, borrowLimit, borrowLimitPercentage, liquidationThreshold]);
};
