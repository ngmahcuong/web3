import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { useMemo, useState } from 'react';
import useDebounce from '../../../../../hooks/useDebounce';
import useInterval from '../../../../../hooks/useInterval';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { PriceUpdateInterval, SlippagePrecision } from '../../../../../utils/constants';
import { getLiquidityValue } from '../../../utils/liquidity';

type EstimateReceive = {
  tokenAmountA: BigNumber;
  tokenAmountB: BigNumber;
  tokenAmountAMin: BigNumber;
  tokenAmountBMin: BigNumber;
};

export const useEstimateReceiveAmount = (
  inputAmount: BigNumber,
  reserveA: BigNumber,
  reserveB: BigNumber,
  userLiquidity: BigNumber,
  totalSupply: BigNumber,
): EstimateReceive => {
  const debouncedInput = useDebounce(inputAmount, 200);
  const slippage = useGetSlippagePrecise();
  const [lastRefresh, setLastRefresh] = useState(0);

  const tokenAmountA = useMemo(() => {
    if (
      !debouncedInput ||
      debouncedInput?.eq(0) ||
      !userLiquidity ||
      userLiquidity?.eq(Zero) ||
      !lastRefresh
    ) {
      return;
    }
    const liquidityValueA = getLiquidityValue(totalSupply, userLiquidity, reserveA);
    return debouncedInput.mul(liquidityValueA).div(userLiquidity);
  }, [totalSupply, reserveA, debouncedInput, userLiquidity, lastRefresh]);

  const tokenAmountB = useMemo(() => {
    if (
      !debouncedInput ||
      debouncedInput?.eq(0) ||
      !userLiquidity ||
      userLiquidity?.eq(Zero) ||
      !lastRefresh
    ) {
      return;
    }
    const liquidityValueB = getLiquidityValue(totalSupply, userLiquidity, reserveB);
    return debouncedInput.mul(liquidityValueB).div(userLiquidity);
  }, [totalSupply, reserveB, debouncedInput, userLiquidity, lastRefresh]);

  const tokenAmountAMin = useMemo(() => {
    if (!tokenAmountA) {
      return;
    }
    return tokenAmountA.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision);
  }, [tokenAmountA, slippage]);

  const tokenAmountBMin = useMemo(() => {
    if (!tokenAmountB) {
      return;
    }
    return tokenAmountB.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision);
  }, [tokenAmountB, slippage]);

  useInterval(() => {
    setLastRefresh(Date.now());
  }, PriceUpdateInterval * 1000);

  return { tokenAmountA, tokenAmountB, tokenAmountAMin, tokenAmountBMin };
};
