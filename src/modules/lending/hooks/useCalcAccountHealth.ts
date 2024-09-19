import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useMemo } from 'react';

export const useCalcAccountHealth = (borrowLimit: BigNumber, borrowBalance: BigNumber) => {
  return useMemo(() => {
    if (!borrowLimit || !borrowBalance) {
      return 999;
    }
    if (borrowBalance.eq(Zero)) {
      return 999;
    }
    const accountHealth = +formatUnits(
      borrowLimit?.mul(parseUnits('1', 10)).div(borrowBalance),
      10,
    );
    return accountHealth < 999 ? accountHealth : 999;
  }, [borrowBalance, borrowLimit]);
};
