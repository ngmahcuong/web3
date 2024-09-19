import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, Route, Trade } from '../../../state/dex/actions';
import {
  useLimitOrderCurrencies,
  useRecipient,
  useSingleHopOnly,
} from '../../../state/dex/hooks';
import { useUniswapToken } from './useUniswapToken';
import { useWrapType, WrapType } from './useWrap';
import { getRouterApi } from '../../../config';
import { useWeb3React } from '@web3-react/core';
import useDebounce from '../../../hooks/useDebounce';
import { parseUnits } from 'ethers/lib/utils';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { isAddress } from '../../../utils/addresses';
import { Zero } from '@ethersproject/constants';
import { safeParseUnits } from '../../../utils/numbers';

export const useLimitOrderEstimateSwap = (
  input?: BigNumber,
  independentField?: Field,
  limitPrice?: BigNumber,
) => {
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const debouncedInput = useDebounce(input, 200);
  const [trade, setTrade] = useState({} as Trade);
  const [loading, setLoading] = useState(false);
  const [singleHopOnly] = useSingleHopOnly();

  const routerApi = getRouterApi(chainId);

  const { inputCurrencyId, outputCurrencyId } = useLimitOrderCurrencies();

  const inputCurrency = useUniswapToken(inputCurrencyId);
  const outputCurrency = useUniswapToken(outputCurrencyId);
  const recipient = useRecipient();

  const wrapType = useWrapType();

  const showWrap = useMemo(() => {
    return wrapType !== WrapType.NOT_APPLICABLE;
  }, [wrapType]);

  const isExactIn: boolean = independentField === Field.INPUT;

  const route = useMemo(() => {
    return {
      [Route.FROM]: isExactIn
        ? inputCurrency?.wrapped.address
        : outputCurrency?.wrapped.address,
      [Route.TO]: isExactIn ? outputCurrency?.wrapped.address : inputCurrency?.wrapped.address,
    };
  }, [inputCurrency?.wrapped.address, isExactIn, outputCurrency?.wrapped.address]);

  const reset = useCallback(() => {
    setTrade({
      path: [],
    });
  }, []);

  useEffect(() => {
    reset();
  }, [input, reset, inputCurrency, outputCurrency]);

  useEffect(() => {
    if (input && input.gt(Zero) && (!debouncedInput || debouncedInput?.eq(0))) {
      setLoading(true);
      return;
    }
    if (showWrap || !route || !inputCurrency || !outputCurrency || !routerApi) {
      setLoading(false);
      reset();
      return;
    }
    let mounted = true;

    const amountIn =
      debouncedInput && debouncedInput.gt(Zero)
        ? debouncedInput
        : safeParseUnits('1', isExactIn ? inputCurrency?.decimals : outputCurrency?.decimals);

    const url = new URL(routerApi);
    url.searchParams.set('from', route.FROM);
    url.searchParams.set('to', route.TO);
    url.searchParams.set('amountIn', amountIn.toString());
    if (singleHopOnly) {
      url.searchParams.set('maxHop', '1');
    }

    fetch(url.toString())
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        reset();
      })
      .then((data) => {
        if (!mounted) {
          return;
        }
        if (!data?.amountOut || BigNumber.from(data?.amountOut).eq(0)) {
          reset();
          return;
        }
        const commonDecimals = Math.max(inputCurrency?.decimals, outputCurrency?.decimals) + 18;
        const priceInputPerOutput = (isExactIn ? amountIn : BigNumber.from(data?.amountOut))
          .mul(parseUnits('1', commonDecimals - inputCurrency?.decimals))
          .div(isExactIn ? BigNumber.from(data?.amountOut) : amountIn)
          .div(parseUnits('1', commonDecimals - outputCurrency?.decimals - 18));

        const priceOutputPerInput = (isExactIn ? BigNumber.from(data?.amountOut) : amountIn)
          .mul(parseUnits('1', commonDecimals - outputCurrency?.decimals))
          .div(isExactIn ? amountIn : BigNumber.from(data?.amountOut))
          .div(parseUnits('1', commonDecimals - inputCurrency?.decimals - 18));

        const amountOut =
          debouncedInput && debouncedInput.gt(Zero)
            ? limitPrice && limitPrice.gt(Zero)
              ? isExactIn
                ? limitPrice
                    .mul(parseUnits('1', commonDecimals - inputCurrency?.decimals - 18))
                    .mul(debouncedInput)
                    .div(parseUnits('1', commonDecimals - outputCurrency?.decimals))
                : debouncedInput
                    .mul(parseUnits('1', commonDecimals - outputCurrency?.decimals))
                    .div(parseUnits('1', commonDecimals - inputCurrency?.decimals - 18))
                    .div(limitPrice)
              : BigNumber.from(data?.amountOut)
            : undefined;

        setTrade({
          amountOut,
          path: data?.path,
          priceInputPerOutput,
          priceOutputPerInput,
          inputCurrency,
          outputCurrency,
        });
      })
      .catch(() => reset())
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [
    isExactIn,
    reset,
    routerApi,
    showWrap,
    debouncedInput,
    route,
    inputCurrency?.decimals,
    outputCurrency?.decimals,
    inputCurrency,
    outputCurrency,
    input,
    limitPrice,
    singleHopOnly,
  ]);

  const parsedAmounts = useMemo(() => {
    return showWrap
      ? {
          [Field.INPUT]: input,
          [Field.OUTPUT]: input,
        }
      : {
          [Field.INPUT]: independentField === Field.INPUT ? input : trade?.amountOut,
          [Field.OUTPUT]: independentField === Field.OUTPUT ? input : trade?.amountOut,
        };
  }, [independentField, input, trade?.amountOut, showWrap]);

  const dependentField = useMemo(() => {
    return independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;
  }, [independentField]);

  const formattedAmounts = useMemo(() => {
    const amounts = {
      [independentField]: input,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]
        : parsedAmounts[dependentField],
    };
    let inputAmount: BigNumber;
    let outputAmount: BigNumber;
    if (inputCurrency && amounts[Field.INPUT]) {
      inputAmount = amounts[Field.INPUT];
    }
    if (outputCurrency && amounts[Field.OUTPUT]) {
      outputAmount = amounts[Field.OUTPUT];
    }
    return {
      input: inputAmount,
      output: outputAmount,
    };
  }, [
    dependentField,
    independentField,
    inputCurrency,
    outputCurrency,
    parsedAmounts,
    showWrap,
    input,
  ]);

  const recipientError = useMemo(() => {
    const to = (recipient === null || recipient === undefined ? account : recipient) ?? null;
    const formattedTo = isAddress(to);
    let ret: string | undefined;
    if (!to || !formattedTo) {
      ret = 'Enter a recipient';
    } else if (
      trade?.path?.some((p) => p.source.toLowerCase() === to.toLowerCase()) ||
      trade?.path?.some((p) => p.target.toLowerCase() === to.toLowerCase())
    ) {
      ret = 'Invalid recipient';
    }
    return ret;
  }, [account, trade?.path, recipient]);

  const userHasSpecifiedInputOutput = useMemo(() => {
    return Boolean(
      inputCurrency && outputCurrency && parsedAmounts[independentField]?.gt(Zero),
    );
  }, [independentField, inputCurrency, outputCurrency, parsedAmounts]);

  return useMemo(() => {
    return {
      inputCurrencyId,
      outputCurrencyId,
      inputCurrency,
      outputCurrency,
      inputAmount: formattedAmounts?.input,
      outputAmount: formattedAmounts?.output,
      trade,
      wrapType,
      recipientError,
      userHasSpecifiedInputOutput,
      loading,
      isExactIn,
    };
  }, [
    inputCurrencyId,
    outputCurrencyId,
    inputCurrency,
    outputCurrency,
    formattedAmounts?.input,
    formattedAmounts?.output,
    trade,
    wrapType,
    recipientError,
    userHasSpecifiedInputOutput,
    loading,
    isExactIn,
  ]);
};
