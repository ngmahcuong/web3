import { Zero } from '@ethersproject/constants';
import { useMemo } from 'react';
import { Precision } from '../../../../../utils/constants';
import { safeParseUnits } from '../../../../../utils/numbers';
import { LockPoolInfo } from '../../../models/Lockdrop';
import { useLockDropMarketAsset } from './useLockDropMarketAsset';

export const useLockDropItem = (pool?: LockPoolInfo) => {
  //todo
  const rewardPrice = useMemo(() => {
    return safeParseUnits('1000', 18);
  }, []);
  const { market } = useLockDropMarketAsset(pool?.token);

  const totalValueLock = useMemo(() => {
    if (!pool || !market) {
      return;
    }
    return pool?.totalAmount
      .mul(market?.underlyingPrice)
      .mul(market.exchangeRate)
      .div(Precision)
      .div(Precision);
  }, [market, pool]);

  const apr = useMemo(() => {
    if (!totalValueLock || !rewardPrice || !pool?.rewards) {
      return;
    }
    if (pool.rewards.eq(Zero)) {
      return Zero;
    }
    return totalValueLock.mul(Precision).mul(Precision).div(pool?.rewards).div(rewardPrice);
  }, [pool?.rewards, rewardPrice, totalValueLock]);

  return {
    apr,
    totalValueLock,
  };
};
