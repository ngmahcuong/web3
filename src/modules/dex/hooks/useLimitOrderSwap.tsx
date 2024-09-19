import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { ETH_ADDRESS, LimitOrderExpireType } from '../../../utils/constants';
import { formatBigNumber } from '../../../utils/numbers';
import { useLimitOrderContract } from './useLimitOrderContract';

export const useLimitOrderSwap = (
  inputAmount?: BigNumber,
  outputAmount?: BigNumber,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  recipient?: string,
  expireTimeType?: LimitOrderExpireType,
) => {
  const { account } = useUserWallet();
  const { estimate } = useLimitOrderContract();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const expiredTime = useMemo(() => {
    let ret = 0;
    const currentTimestamp = Math.trunc(new Date().getTime() / 1000);
    switch (expireTimeType) {
      case '1_hour':
        ret = currentTimestamp + 3600;
        break;
      case '24_hour':
        ret = currentTimestamp + 3600 * 24;
        break;
      case '1_week':
        ret = currentTimestamp + 3600 * 24 * 7;
        break;
      case '30_day':
        ret = currentTimestamp + 3600 * 24 * 30;
        break;
      case 'never':
        ret = 0;
        break;
      default:
        ret = 0;
        break;
    }
    return BigNumber.from(ret);
  }, [expireTimeType]);

  const realRecipient = useMemo(() => {
    return recipient ?? account;
  }, [recipient, account]);

  const inputAddress = useMemo(() => {
    return inputCurrency?.isNative ? ETH_ADDRESS : inputCurrency?.wrapped?.address;
  }, [inputCurrency]);

  const outputAddress = useMemo(() => {
    return outputCurrency?.isNative ? ETH_ADDRESS : outputCurrency?.wrapped?.address;
  }, [outputCurrency]);

  const ethValue = useMemo(() => {
    return inputCurrency?.isNative ? inputAmount : undefined;
  }, [inputAmount, inputCurrency]);

  const execute = useCallback(async () => {
    if (inputCurrency?.isNative) {
      return estimate(
        'placeOrderETH',
        [outputAddress, outputAmount, expiredTime, realRecipient],
        ethValue,
      );
    } else {
      return estimate('placeOrder', [
        inputAddress,
        outputAddress,
        inputAmount,
        outputAmount,
        expiredTime,
        realRecipient,
      ]);
    }
  }, [
    estimate,
    ethValue,
    expiredTime,
    inputAddress,
    inputAmount,
    inputCurrency?.isNative,
    outputAddress,
    outputAmount,
    realRecipient,
  ]);

  return useCallback(async () => {
    try {
      const summary = `Order submission ${formatBigNumber(
        inputAmount,
        inputCurrency?.decimals,
        {
          fractionDigits: 3,
          significantDigits: 2,
          compact: false,
        },
      )} ${inputCurrency?.symbol} to ${formatBigNumber(outputAmount, outputCurrency?.decimals, {
        fractionDigits: 3,
        significantDigits: 0,
        compact: false,
      })} ${outputCurrency?.symbol}`;
      const tx = await handleTransactionReceipt(summary, execute);
      return Promise.resolve({
        tx: tx,
        outputCurrency: outputCurrency,
      });
    } catch (error) {
      return Promise.reject();
    }
  }, [
    execute,
    handleTransactionReceipt,
    inputAmount,
    inputCurrency?.decimals,
    inputCurrency?.symbol,
    outputAmount,
    outputCurrency,
  ]);
};
