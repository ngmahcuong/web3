import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, Trade } from '../../../state/dex/actions';
import { useRecipient, useSingleHopOnly, useSwapState } from '../../../state/dex/hooks';
import { useUniswapToken } from './useUniswapToken';
import { useWrapType, WrapType } from './useWrap';
import { getRouterApi } from '../../../config';
import { useWeb3React } from '@web3-react/core';
import useDebounce from '../../../hooks/useDebounce';
import { parseUnits } from 'ethers/lib/utils';
import { PriceUpdateInterval, SlippagePrecision } from '../../../utils/constants';
import { useGetSlippagePrecise } from '../../../state/application/hooks';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { isAddress } from '../../../utils/addresses';
import { Zero } from '@ethersproject/constants';
import useInterval from '../../../hooks/useInterval';

export const useEstimateSwap = (input?: BigNumber, independentField?: Field) => {
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const debouncedInput = useDebounce(input, 200);
  const [trade, setTrade] = useState({} as Trade);
  const [loading, setLoading] = useState(false);
  const [singleHopOnly] = useSingleHopOnly();
  const [lastRefresh, setLastRefresh] = useState(0);

  const routerApi = getRouterApi(chainId);

  const { swapInputCurrencyId: inputCurrencyId, swapOutputCurrencyId: outputCurrencyId } =
    useSwapState();

  const inputCurrency = useUniswapToken(inputCurrencyId);
  const outputCurrency = useUniswapToken(outputCurrencyId);
  const allowedSlippage = useGetSlippagePrecise();
  const recipient = useRecipient();

  const wrapType = useWrapType();

  const showWrap = useMemo(() => {
    return wrapType !== WrapType.NOT_APPLICABLE;
  }, [wrapType]);

  const isExactIn: boolean = independentField === Field.INPUT;

  const route = useMemo(() => {
    return {
      from: isExactIn ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address,
      to: isExactIn ? outputCurrency?.wrapped.address : inputCurrency?.wrapped.address,
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
    if (
      !input ||
      input?.eq(0) ||
      !debouncedInput ||
      debouncedInput?.eq(0) ||
      showWrap ||
      !route ||
      !inputCurrency ||
      !outputCurrency ||
      !routerApi
    ) {
      setLoading(false);
      setLastRefresh(0);
      reset();
      return;
    }
    if (!lastRefresh) {
      setLoading(true);
    }
    let mounted = true;

    const url = new URL(routerApi);
    url.searchParams.set('from', route.from);
    url.searchParams.set('to', route.to);
    url.searchParams.set('amountIn', debouncedInput.toString());
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
        if (
          !data?.amountOut ||
          BigNumber.from(data?.amountOut).eq(0) ||
          (data?.path?.length > 1 && singleHopOnly)
        ) {
          reset();
          return;
        }
        const commonDecimals = Math.max(inputCurrency?.decimals, outputCurrency.decimals) + 18;
        const priceInputPerOutput = (
          isExactIn ? debouncedInput : BigNumber.from(data?.amountOut)
        )
          .mul(parseUnits('1', commonDecimals - inputCurrency?.decimals))
          .div(isExactIn ? BigNumber.from(data?.amountOut) : debouncedInput)
          .div(parseUnits('1', commonDecimals - outputCurrency.decimals - 18));

        const priceOutputPerInput = (
          isExactIn ? BigNumber.from(data?.amountOut) : debouncedInput
        )
          .mul(parseUnits('1', commonDecimals - outputCurrency.decimals))
          .div(isExactIn ? debouncedInput : BigNumber.from(data?.amountOut))
          .div(parseUnits('1', commonDecimals - inputCurrency?.decimals - 18));

        const minAmountOut = isExactIn
          ? BigNumber.from(data?.amountOut)
              .mul(SlippagePrecision.sub(allowedSlippage))
              .div(SlippagePrecision)
          : debouncedInput;

        setTrade({
          amountOut: BigNumber.from(data?.amountOut),
          minAmountOut,
          priceImpact: +data?.priceImpact,
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
    allowedSlippage,
    singleHopOnly,
    input,
    lastRefresh,
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

  useInterval(() => {
    setLastRefresh(Date.now());
  }, PriceUpdateInterval * 1000);

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
  ]);
};
