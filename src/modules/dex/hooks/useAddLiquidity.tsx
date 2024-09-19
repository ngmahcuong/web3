import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Zero } from '@ethersproject/constants';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useGetDeadline } from '../../../state/application/hooks';
import { formatBigNumber } from '../../../utils/numbers';
import { Field } from '../views/AddLiquidity/hook/useEstimateDependentAmount';
import { useUniswapRouter } from './useUniswapRouter';

export const useAddLiquidity = (
  currencyA: Currency,
  currencyB: Currency,
  amountA: BigNumber,
  amountB: BigNumber,
  formattedMinAmounts: { [x: string]: BigNumber },
) => {
  const { account } = useUserWallet();
  const getDeadline = useGetDeadline();
  const [, estimate] = useUniswapRouter();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const add = useCallback(async () => {
    const tokenAIsETH = currencyA.isNative;
    const tokenBIsETH = currencyB.isNative;
    if (tokenAIsETH || tokenBIsETH) {
      return await estimate(
        'addLiquidityETH',
        [
          (tokenBIsETH ? currencyA : currencyB)?.wrapped?.address,
          tokenBIsETH ? amountA : amountB,
          (tokenBIsETH
            ? formattedMinAmounts[Field.CURRENCY_A]
            : formattedMinAmounts[Field.CURRENCY_B]) || Zero,
          (tokenBIsETH
            ? formattedMinAmounts[Field.CURRENCY_B]
            : formattedMinAmounts[Field.CURRENCY_A]) || Zero,
          account,
          getDeadline(),
        ],
        tokenBIsETH ? amountB : amountA,
      );
    } else {
      return await estimate('addLiquidity', [
        currencyA?.wrapped.address,
        currencyB?.wrapped.address,
        amountA,
        amountB,
        formattedMinAmounts[Field.CURRENCY_A] || Zero,
        formattedMinAmounts[Field.CURRENCY_B] || Zero,
        account,
        getDeadline(),
      ]);
    }
  }, [
    currencyA,
    currencyB,
    estimate,
    amountA,
    amountB,
    formattedMinAmounts,
    account,
    getDeadline,
  ]);

  return useCallback(async (): Promise<{
    tx?: TransactionResponse;
  }> => {
    if (!amountA || !amountB) {
      return;
    }
    try {
      const summary = `Add liquidity ${formatBigNumber(amountA, currencyA.decimals, {
        fractionDigits: 3,
        significantDigits: 0,
        compact: false,
      })} ${currencyA?.symbol} and ${formatBigNumber(amountB, currencyB.decimals, {
        fractionDigits: 3,
        significantDigits: 0,
        compact: false,
      })} ${currencyB?.symbol}`;
      const tx = await handleTransactionReceipt(summary, add);
      return Promise.resolve({
        tx: tx,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }, [amountA, amountB, currencyA, currencyB, handleTransactionReceipt, add]);
};
