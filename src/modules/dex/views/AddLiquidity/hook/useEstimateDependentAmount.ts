import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Zero } from '@ethersproject/constants';
import { Currency } from '@uniswap/sdk-core';
import {
  PercentagePrecision,
  PriceUpdateInterval,
  SlippagePrecision,
} from '../../../../../utils/constants';
import useInterval from '../../../../../hooks/useInterval';
import { parseUnits } from 'ethers/lib/utils';
import useDebounce from '../../../../../hooks/useDebounce';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { calcPrice, getLiquidityMinted } from '../../../utils/liquidity';
import { useTokenBalance } from '../../../../../state/user/hooks';

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

type EstimateOutput = {
  dependentAmount?: BigNumber;
  minOutputIndependent?: BigNumber;
  minOutputDependent?: BigNumber;
  liquidityMinted?: BigNumber;
  priceInputPerOutput: BigNumber;
  priceOutputPerInput: BigNumber;
  shareOfPool: BigNumber;
};

export const useEstimateDependentAmount = (
  independentField: Field,
  tokenA: Currency,
  tokenB: Currency,
  valueA: BigNumber,
  valueB: BigNumber,
  noLiquidity: boolean,
  reserve0: BigNumber,
  reserve1: BigNumber,
  totalSupply: BigNumber,
  liquidityToken: string,
): EstimateOutput => {
  const [typedValue, otherTypedValue] =
    independentField === Field.CURRENCY_A ? [valueA, valueB] : [valueB, valueA];
  const debouncedInput = useDebounce(typedValue, 200);
  const slippage = useGetSlippagePrecise();
  const [lastRefresh, setLastRefresh] = useState(0);
  const [output, setOutput] = useState({} as EstimateOutput);

  const reset = useCallback(() => {
    setOutput({} as EstimateOutput);
  }, []);

  useEffect(() => {
    reset();
  }, [typedValue, reset, tokenB]);

  const dependentField =
    independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  const independentAmount = debouncedInput;

  const dependentAmount = useMemo(() => {
    if (noLiquidity) {
      return otherTypedValue || Zero;
    }
    if (independentAmount) {
      return dependentField === Field.CURRENCY_B
        ? independentAmount.mul(reserve1).div(reserve0)
        : independentAmount.mul(reserve0).div(reserve1);
    }
  }, [dependentField, independentAmount, noLiquidity, otherTypedValue, reserve0, reserve1]);

  const lpBalance = useTokenBalance(liquidityToken);

  useEffect(() => {
    if (!debouncedInput || debouncedInput?.eq(0)) {
      if (noLiquidity) {
        reset();
      } else {
        const priceInputPerOutput = calcPrice(
          reserve0,
          reserve1,
          tokenA?.decimals,
          tokenB?.decimals,
        );
        const priceOutputPerInput = calcPrice(
          reserve1,
          reserve0,
          tokenB?.decimals,
          tokenA?.decimals,
        );
        const shareOfPool = totalSupply?.gt(Zero)
          ? lpBalance?.mul(PercentagePrecision).div(totalSupply)
          : Zero;
        setOutput({ priceInputPerOutput, priceOutputPerInput, shareOfPool });
      }
      return;
    }
    if (!dependentAmount || dependentAmount.eq(0)) {
      setOutput({} as EstimateOutput);
      return;
    }

    const minOutputDependent = noLiquidity
      ? dependentAmount
      : dependentAmount.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision);

    const minOutputIndependent = noLiquidity
      ? independentAmount
      : independentAmount.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision);

    const [amountA, amountB] = noLiquidity
      ? independentField === Field.CURRENCY_A
        ? [debouncedInput, dependentAmount]
        : [dependentAmount, debouncedInput]
      : [reserve0, reserve1];
    const priceInputPerOutput = calcPrice(amountA, amountB, tokenA?.decimals, tokenB?.decimals);
    const priceOutputPerInput = calcPrice(amountB, amountA, tokenB?.decimals, tokenA?.decimals);
    const [tokenAmountA, tokenAmountB] =
      independentField === Field.CURRENCY_A
        ? [debouncedInput, dependentAmount]
        : [dependentAmount, debouncedInput];
    const liquidityMinted = getLiquidityMinted(
      totalSupply,
      tokenAmountA,
      tokenAmountB,
      reserve0,
      reserve1,
    );
    const shareOfPool =
      noLiquidity || !liquidityMinted
        ? parseUnits('100', 6)
        : liquidityMinted.mul(PercentagePrecision).div(totalSupply.add(liquidityMinted));

    setOutput({
      dependentAmount,
      minOutputDependent,
      minOutputIndependent,
      priceInputPerOutput,
      priceOutputPerInput,
      shareOfPool,
      liquidityMinted,
    });
  }, [
    debouncedInput,
    tokenA,
    reset,
    slippage,
    tokenB,
    lastRefresh,
    independentField,
    noLiquidity,
    otherTypedValue,
    reserve0,
    reserve1,
    totalSupply,
    dependentAmount,
    independentAmount,
    lpBalance,
  ]);

  useInterval(() => {
    setLastRefresh(Date.now());
  }, PriceUpdateInterval * 1000);

  return output;
};
