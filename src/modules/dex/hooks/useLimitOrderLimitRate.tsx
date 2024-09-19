import { Currency, Price } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import parseCurrencyAmount from '../utils/parseCurrencyAmount';

export const useLimitOrderLimitRate = (
  price?: string,
  inverted?: boolean,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
) => {
  return useMemo(() => {
    const baseAmount = parseCurrencyAmount(inverted ? price : '1', inputCurrency);
    const quoteAmount = parseCurrencyAmount(inverted ? '1' : price, outputCurrency);

    return baseAmount && quoteAmount && inputCurrency && outputCurrency
      ? new Price({ baseAmount, quoteAmount })
      : undefined;
  }, [inputCurrency, inverted, outputCurrency, price]);
};
