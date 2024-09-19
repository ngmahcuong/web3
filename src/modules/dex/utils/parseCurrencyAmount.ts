import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { safeParseUnits } from '../../../utils/numbers';

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export default function parseCurrencyAmount<T extends Currency>(
  value?: string,
  currency?: T,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = safeParseUnits(value, currency.decimals)?.toString();
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  return undefined;
}
