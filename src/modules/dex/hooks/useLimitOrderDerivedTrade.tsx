import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { useMemo } from 'react';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { LimitOrderField } from '../../../state/dex/actions';
import { useSingleHopOnly } from '../../../state/dex/hooks';
import { isAddress } from '../../../utils/addresses';
import { involvesAddress } from '../utils/addresses';
import parseCurrencyAmount from '../utils/parseCurrencyAmount';
import { useTradeExactIn, useTradeExactOut } from './useTrades';

export const useLimitOrderDerivedTrade = (
  field?: LimitOrderField,
  typedValue?: string,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  recipient?: string,
) => {
  const [singleHopOnly] = useSingleHopOnly();
  const { account } = useUserWallet();
  const isExactIn = useMemo(() => {
    return field === LimitOrderField.INPUT;
  }, [field]);

  const parsedAmount = useMemo(
    () =>
      parseCurrencyAmount(
        typedValue,
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined,
      ),
    [inputCurrency, isExactIn, outputCurrency, typedValue],
  );

  // To get the initial rate we need to enter a default value
  const inputAmount = inputCurrency
    ? parsedAmount ||
      CurrencyAmount.fromRawAmount(
        inputCurrency,
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(inputCurrency?.decimals)),
      )
    : undefined;

  const bestTradeExactIn = useTradeExactIn(
    isExactIn ? inputAmount : undefined,
    inputCurrency,
    outputCurrency ?? undefined,
    {
      maxHops: singleHopOnly ? 1 : undefined,
    },
  );

  const bestTradeExactOut = useTradeExactOut(
    inputCurrency ?? undefined,
    outputCurrency,
    !isExactIn ? inputAmount : undefined,
    {
      maxHops: singleHopOnly ? 1 : undefined,
    },
  );

  const recipientError = useMemo(() => {
    const to = (recipient === null || recipient === undefined ? account : recipient) ?? null;
    const formattedTo = isAddress(to);
    let ret: string | undefined;
    if (!to || !formattedTo) {
      ret = 'Enter a recipient';
    } else if (
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      ret = 'Invalid recipient';
    }
    return ret;
  }, [account, bestTradeExactIn, bestTradeExactOut, recipient]);

  const trade = useMemo(() => {
    return isExactIn ? bestTradeExactIn : bestTradeExactOut;
  }, [bestTradeExactIn, bestTradeExactOut, isExactIn]);
  return {
    trade,
    recipientError,
  };
};
