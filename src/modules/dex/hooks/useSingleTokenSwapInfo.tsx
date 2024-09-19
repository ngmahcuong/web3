import { Currency } from '@uniswap/sdk-core';
import parseCurrencyAmount from '../utils/parseCurrencyAmount';
import { useTradeExactIn } from './useTrades';

export function useSingleTokenSwapInfo(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
): { [key: string]: number } {
  const token0Address = inputCurrency?.wrapped.address;
  const token1Address = outputCurrency?.wrapped.address;

  const parsedAmount = parseCurrencyAmount('1', inputCurrency ?? undefined);

  const bestTradeExactIn = useTradeExactIn(parsedAmount, outputCurrency ?? undefined);
  if (!inputCurrency || !outputCurrency || !bestTradeExactIn) {
    return null;
  }

  const inputTokenPrice = parseFloat(bestTradeExactIn?.executionPrice?.toSignificant(6));
  const outputTokenPrice = 1 / inputTokenPrice;

  return {
    [token0Address]: inputTokenPrice,
    [token1Address]: outputTokenPrice,
  };
}
