import { Zero } from '@ethersproject/constants';
import { useMemo } from 'react';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { useAllMarkets } from '../../../hooks/useLendingMarkets';
import { LockPoolInfo } from '../../../models/Lockdrop';

export const useLockDropTVL = (pools?: LockPoolInfo[]) => {
  const { account } = useUserWallet();
  const allMarket = useAllMarkets();

  const totalValueLockdrop = useMemo(() => {
    const tvl = pools?.reduce((p, c) => {
      const market = allMarket.find((m) => m.marketAddress === c.token);
      return c?.totalAmount && market?.exchangeRate && market?.underlyingPrice
        ? p.add(c.totalAmount.mul(market.exchangeRate).mul(market.underlyingPrice))
        : p;
    }, Zero);
    return tvl;
  }, [allMarket, pools]);

  const totalValueLockdropMine = useMemo(() => {
    if (account) {
      const tvl = pools
        ?.filter((p) => p.depositedValue?.gt(Zero))
        .reduce((p, c) => {
          const market = allMarket.find((m) => m.marketAddress === c.token);
          return c?.totalAmount && market?.exchangeRate && market?.underlyingPrice
            ? p.add(c.totalAmount.mul(market.exchangeRate).mul(market.underlyingPrice))
            : p;
        }, Zero);
      return tvl;
    }
    return undefined;
  }, [allMarket, pools, account]);

  return {
    totalValueLockdrop,
    totalValueLockdropMine,
  };
};
