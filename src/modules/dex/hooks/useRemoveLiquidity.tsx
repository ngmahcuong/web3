import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useGetDeadline } from '../../../state/application/hooks';
import { formatBigNumber } from '../../../utils/numbers';
import { useUniswapRouter } from './useUniswapRouter';

export const useRemoveLiquidity = (
  currencyA: Currency,
  currencyB: Currency,
  liquidity: BigNumber,
  amountAMin: BigNumber,
  amountBMin: BigNumber,
  signatureData: { v: number; r: string; s: string; deadline: number } | null,
  isApproved: boolean,
) => {
  const { account } = useUserWallet();
  const getDeadline = useGetDeadline();
  const [, estimate] = useUniswapRouter();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const removeLiquidityETH = useCallback(async () => {
    return await estimate('removeLiquidityETH', [
      (currencyB?.isNative ? currencyA : currencyB)?.wrapped?.address,
      liquidity,
      currencyB?.isNative ? amountAMin : amountBMin,
      currencyB?.isNative ? amountBMin : amountAMin,
      account,
      getDeadline(),
    ]);
  }, [account, amountAMin, amountBMin, currencyA, currencyB, estimate, getDeadline, liquidity]);

  const removeLiquidityETHSupportingFeeOnTransferTokens = useCallback(async () => {
    return await estimate('removeLiquidityETHSupportingFeeOnTransferTokens', [
      (currencyB?.isNative ? currencyA : currencyB)?.wrapped?.address,
      liquidity,
      currencyB?.isNative ? amountAMin : amountBMin,
      currencyB?.isNative ? amountBMin : amountAMin,
      account,
      getDeadline(),
    ]);
  }, [account, amountAMin, amountBMin, currencyA, currencyB, estimate, getDeadline, liquidity]);

  const removeLiquidity = useCallback(async () => {
    return await estimate('removeLiquidity', [
      currencyA?.wrapped.address,
      currencyB?.wrapped.address,
      liquidity,
      amountAMin,
      amountBMin,
      account,
      getDeadline(),
    ]);
  }, [account, amountAMin, amountBMin, currencyA, currencyB, estimate, getDeadline, liquidity]);

  const removeLiquidityETHWithPermit = useCallback(async () => {
    return await estimate('removeLiquidityETHWithPermit', [
      (currencyB?.isNative ? currencyA : currencyB)?.wrapped?.address,
      liquidity,
      currencyB?.isNative ? amountAMin : amountBMin,
      currencyB?.isNative ? amountBMin : amountAMin,
      account,
      signatureData?.deadline,
      false,
      signatureData?.v,
      signatureData?.r,
      signatureData?.s,
    ]);
  }, [
    account,
    amountAMin,
    amountBMin,
    currencyA,
    currencyB,
    estimate,
    liquidity,
    signatureData?.deadline,
    signatureData?.r,
    signatureData?.s,
    signatureData?.v,
  ]);

  const removeLiquidityETHWithPermitSupportingFeeOnTransferTokens = useCallback(async () => {
    return await estimate('removeLiquidityETHWithPermitSupportingFeeOnTransferTokens', [
      (currencyB?.isNative ? currencyA : currencyB)?.wrapped?.address,
      liquidity,
      currencyB?.isNative ? amountAMin : amountBMin,
      currencyB?.isNative ? amountBMin : amountAMin,
      account,
      signatureData?.deadline,
      false,
      signatureData?.v,
      signatureData?.r,
      signatureData?.s,
    ]);
  }, [
    account,
    amountAMin,
    amountBMin,
    currencyA,
    currencyB,
    estimate,
    liquidity,
    signatureData?.deadline,
    signatureData?.r,
    signatureData?.s,
    signatureData?.v,
  ]);

  const removeLiquidityWithPermit = useCallback(async () => {
    return await estimate('removeLiquidityWithPermit', [
      currencyA?.wrapped.address,
      currencyB?.wrapped.address,
      liquidity,
      amountAMin,
      amountBMin,
      account,
      signatureData?.deadline,
      false,
      signatureData?.v,
      signatureData?.r,
      signatureData?.s,
    ]);
  }, [
    account,
    amountAMin,
    amountBMin,
    currencyA?.wrapped.address,
    currencyB?.wrapped.address,
    estimate,
    liquidity,
    signatureData?.deadline,
    signatureData?.r,
    signatureData?.s,
    signatureData?.v,
  ]);

  const remove = useCallback(async () => {
    const tokenAIsETH = currencyA?.isNative;
    const tokenBIsETH = currencyB?.isNative;
    const summary = `Remove liquidity ${formatBigNumber(liquidity, 18, {
      fractionDigits: 3,
      significantDigits: 1,
      compact: false,
    })} ${currencyA?.symbol}/${currencyB?.symbol} LP`;
    if (isApproved) {
      if (tokenAIsETH || tokenBIsETH) {
        try {
          return await handleTransactionReceipt(summary, removeLiquidityETH);
        } catch (e) {
          if (e?.code !== 4001) {
            return await handleTransactionReceipt(
              summary,
              removeLiquidityETHSupportingFeeOnTransferTokens,
            );
          }
        }
      } else {
        return await handleTransactionReceipt(summary, removeLiquidity);
      }
    } else if (signatureData !== null) {
      if (tokenAIsETH || tokenBIsETH) {
        try {
          return await handleTransactionReceipt(summary, removeLiquidityETHWithPermit);
        } catch (e) {
          if (e?.code !== 4001) {
            return await handleTransactionReceipt(
              summary,
              removeLiquidityETHWithPermitSupportingFeeOnTransferTokens,
            );
          }
        }
      } else {
        return await handleTransactionReceipt(summary, removeLiquidityWithPermit);
      }
    }
  }, [
    currencyA?.isNative,
    currencyA?.symbol,
    currencyB?.isNative,
    currencyB?.symbol,
    handleTransactionReceipt,
    isApproved,
    liquidity,
    removeLiquidity,
    removeLiquidityETH,
    removeLiquidityETHSupportingFeeOnTransferTokens,
    removeLiquidityETHWithPermit,
    removeLiquidityETHWithPermitSupportingFeeOnTransferTokens,
    removeLiquidityWithPermit,
    signatureData,
  ]);

  return useCallback(async (): Promise<{
    tx?: TransactionResponse;
  }> => {
    if (!liquidity) {
      return;
    }
    try {
      const tx = await remove();
      return Promise.resolve({
        tx: tx,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }, [liquidity, remove]);
};
