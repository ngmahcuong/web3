import { Currency } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { Field } from '../../../state/dex/actions';
import { useRecipient, useSingleHopOnly } from '../../../state/dex/hooks';
import { useCurrencyBalances } from '../../../state/user/hooks';
import { isAddress } from '../../../utils/addresses';
import { involvesAddress } from '../utils/addresses';
import parseCurrencyAmount from '../utils/parseCurrencyAmount';
import { useTradeExactIn, useTradeExactOut } from './useTrades';

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(
  independentField: Field,
  typedValue: string,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  isWrap?: boolean,
) {
  const [singleHopOnly] = useSingleHopOnly();
  const recipient = useRecipient();
  const { account } = useUserWallet();

  const relevantTokenBalances = useCurrencyBalances(
    useMemo(
      () => [inputCurrency ?? undefined, outputCurrency ?? undefined],
      [inputCurrency, outputCurrency],
    ),
  );
  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = useMemo(
    () =>
      parseCurrencyAmount(
        typedValue,
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined,
      ),
    [inputCurrency, isExactIn, outputCurrency, typedValue],
  );
  const bestTradeExactIn = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    inputCurrency,
    outputCurrency ?? undefined,
    {
      maxHops: singleHopOnly ? 1 : undefined,
    },
  );

  const bestTradeExactOut = useTradeExactOut(
    inputCurrency ?? undefined,
    outputCurrency,
    !isExactIn ? parsedAmount : undefined,
    {
      maxHops: singleHopOnly ? 1 : undefined,
    },
  );
  const trade = useMemo(() => {
    return isWrap ? undefined : isExactIn ? bestTradeExactIn : bestTradeExactOut;
  }, [bestTradeExactIn, bestTradeExactOut, isExactIn, isWrap]);

  const currencyBalances = useMemo(() => {
    return {
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    };
  }, [relevantTokenBalances]);

  const currencies: { [field in Field]?: Currency } = useMemo(() => {
    return {
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined,
    };
  }, [inputCurrency, outputCurrency]);

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

  return useMemo(() => {
    return {
      currencies,
      currencyBalances,
      parsedAmount,
      trade: trade ?? undefined,
      recipientError,
    };
  }, [currencies, currencyBalances, parsedAmount, trade, recipientError]);
}
