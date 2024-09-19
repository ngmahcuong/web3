import { Currency, Price } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { LimitOrderField } from '../../../state/dex/actions';
import { safeParseUnits } from '../../../utils/numbers';
import parseCurrencyAmount from '../utils/parseCurrencyAmount';

export const useLimitOrderEstimateAmount = (
  field?: LimitOrderField,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  typedValue?: string,
  limitPrice?: Price<Currency, Currency>,
  marketPrice?: Price<Currency, Currency>,
) => {
  const price = useMemo(() => {
    return limitPrice ?? marketPrice;
  }, [limitPrice, marketPrice]);

  const isExactIn = useMemo(() => {
    return field === LimitOrderField.INPUT;
  }, [field]);

  return useMemo(() => {
    const typedAmountCurrency = isExactIn ? inputCurrency : outputCurrency;
    const typedAmount = parseCurrencyAmount(typedValue, typedAmountCurrency ?? undefined);

    const otherAmount =
      inputCurrency && outputCurrency && price && typedAmount
        ? isExactIn
          ? price.quote(typedAmount)
          : price.invert().quote(typedAmount)
        : undefined;
    return {
      inputAmount: safeParseUnits(
        isExactIn ? typedValue : otherAmount?.toSignificant(6),
        inputCurrency?.decimals,
      ),
      outputAmount: safeParseUnits(
        isExactIn ? otherAmount?.toSignificant(6) : typedValue,
        outputCurrency?.decimals,
      ),
    };
  }, [inputCurrency, isExactIn, outputCurrency, price, typedValue]);
};
