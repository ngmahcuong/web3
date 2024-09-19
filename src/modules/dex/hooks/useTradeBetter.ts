import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v2-sdk';
import { useCallback } from 'react';
import { ONE_HUNDRED_PERCENT, ZERO_PERCENT } from '../../../utils/constants';
export const useTradeBetter = () => {
  return useCallback(
    (
      tradeA: Trade<Currency, Currency, TradeType> | undefined | null,
      tradeB: Trade<Currency, Currency, TradeType> | undefined | null,
      minimumDelta: Percent = ZERO_PERCENT,
    ) => {
      if (tradeA && !tradeB) return false;
      if (tradeB && !tradeA) return true;
      if (!tradeA || !tradeB) return undefined;

      if (
        tradeA.tradeType !== tradeB.tradeType ||
        !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
        !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)
      ) {
        throw new Error('Comparing incomparable trades');
      }

      if (minimumDelta.equalTo(ZERO_PERCENT)) {
        return tradeA?.executionPrice?.lessThan(tradeB.executionPrice);
      } else {
        return tradeA?.executionPrice?.asFraction
          .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
          .lessThan(tradeB.executionPrice);
      }
    },
    [],
  );
};
