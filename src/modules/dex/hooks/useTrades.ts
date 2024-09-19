import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v2-sdk';
import { useMemo } from 'react';
import { useLastUpdated } from '../../../state/application/hooks';
import { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOPS } from '../../../utils/constants';
import { useTradeBetter } from './useTradeBetter';
import { useTradePairs } from './useTradePairs';

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  currencyAmountIn?: CurrencyAmount<Currency>,
  currencyIn?: Currency,
  currencyOut?: Currency,
  { maxHops = MAX_HOPS } = {},
): Trade<Currency, Currency, TradeType.EXACT_INPUT> | null {
  const allowedPairs = useTradePairs(currencyAmountIn?.currency ?? currencyIn, currencyOut);
  const isTradeBetter = useTradeBetter();
  const lastUpdated = useLastUpdated();
  return useMemo(() => {
    if (!lastUpdated) {
      return;
    }
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      if (maxHops === 1) {
        return (
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: 1,
            maxNumResults: 1,
          })[0] ?? null
        );
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null = null;
      for (let i = 1; i <= maxHops; i++) {
        const currentTrade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: i,
            maxNumResults: 1,
          })[0] ?? null;
        // if current trade is best yet, save it
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade;
        }
      }
      return bestTradeSoFar;
    }

    return null;
  }, [allowedPairs, currencyAmountIn, currencyOut, isTradeBetter, maxHops, lastUpdated]);
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  currencyIn?: Currency,
  currencyOut?: Currency,
  currencyAmountOut?: CurrencyAmount<Currency>,
  { maxHops = MAX_HOPS } = {},
): Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null {
  const allowedPairs = useTradePairs(currencyIn, currencyAmountOut?.currency ?? currencyOut);

  const isTradeBetter = useTradeBetter();
  const lastUpdated = useLastUpdated();

  return useMemo(() => {
    if (!lastUpdated) {
      return;
    }
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      if (maxHops === 1) {
        return (
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
            maxHops: 1,
            maxNumResults: 1,
          })[0] ?? null
        );
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null = null;
      for (let i = 1; i <= maxHops; i++) {
        const currentTrade =
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
            maxHops: i,
            maxNumResults: 1,
          })[0] ?? null;
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade;
        }
      }
      return bestTradeSoFar;
    }
    return null;
  }, [lastUpdated, currencyIn, currencyAmountOut, allowedPairs, maxHops, isTradeBetter]);
}
