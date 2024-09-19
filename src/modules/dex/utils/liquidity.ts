import { Zero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { MINIMUM_LIQUIDITY } from '../../../utils/constants';
import { sqrt } from '../../../utils/numbers';

export const getLiquidityMinted = (
  totalSupply: BigNumber,
  tokenAmountA: BigNumber,
  tokenAmountB: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber,
): BigNumber => {
  if (!totalSupply || !tokenAmountA || !tokenAmountB) {
    return;
  }
  if (totalSupply.eq(Zero)) {
    return sqrt(tokenAmountA.mul(tokenAmountB)).sub(MINIMUM_LIQUIDITY);
  } else {
    if (!reserve0 || !reserve1) return;
    const amount0 = tokenAmountA.mul(totalSupply).div(reserve0);
    const amount1 = tokenAmountB.mul(totalSupply).div(reserve1);
    return amount0.gt(amount1) ? amount1 : amount0;
  }
};

export const getLiquidityValue = (
  totalSupply: BigNumber,
  liquidity: BigNumber,
  reserve: BigNumber,
): BigNumber => {
  if (!totalSupply || totalSupply?.eq(Zero) || !liquidity || !reserve) {
    return Zero;
  }
  return reserve.mul(liquidity).div(totalSupply);
};

export const calcPrice = (
  amountA: BigNumber,
  amountB: BigNumber,
  decimalsA: number,
  decimalsB: number,
): BigNumber => {
  const commonDecimals = Math.max(decimalsA, decimalsB) + 6;
  if (!amountA || !amountB || amountB?.eq(Zero) || !decimalsA || !decimalsB) return;
  return amountA
    .mul(parseUnits('1', commonDecimals - decimalsA))
    .div(amountB)
    .div(parseUnits('1', commonDecimals - decimalsB - 6));
};
