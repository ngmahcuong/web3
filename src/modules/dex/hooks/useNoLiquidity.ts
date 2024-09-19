import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { PairState } from '../models/Pair';

export const useNoLiquidity = (
  pairState: PairState,
  reserve0: BigNumber,
  reserve1: BigNumber,
): boolean => {
  return useMemo(() => {
    return (
      pairState !== PairState.EXISTS ||
      !reserve0 ||
      reserve0.eq(Zero) ||
      !reserve1 ||
      reserve1.eq(Zero)
    );
  }, [pairState, reserve0, reserve1]);
};
