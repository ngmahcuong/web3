import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { Currency } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useSwapState } from '../../../state/dex/hooks';
import { formatBigNumber } from '../../../utils/numbers';
import { isWrapNativeToken } from '../utils/tokens';
import { useUniswapToken } from './useUniswapToken';
import { useWrapNativeToken } from './useWrapNativeToken';

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

export const useWrap = (inputValue?: BigNumber, wrapType?: WrapType) => {
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const { estimate } = useWrapNativeToken();
  const { swapInputCurrencyId: inputCurrencyId, swapOutputCurrencyId: outputCurrencyId } =
    useSwapState();

  const inputCurrency = useUniswapToken(inputCurrencyId);
  const outputCurrency = useUniswapToken(outputCurrencyId);
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const wrap = useCallback(() => {
    return {
      run: () => {
        return estimate('deposit', [], inputValue);
      },
      summary: `Wrap ${formatBigNumber(inputValue, inputCurrency?.decimals, {
        fractionDigits: 3,
        significantDigits: 1,
        compact: false,
      })} ${inputCurrency?.symbol} to ${outputCurrency?.symbol}`,
    };
  }, [
    estimate,
    inputCurrency?.decimals,
    inputCurrency?.symbol,
    outputCurrency?.symbol,
    inputValue,
  ]);

  const unwrap = useCallback(() => {
    return {
      run: () => {
        return estimate('withdraw', [inputValue]);
      },
      summary: `Unwrap ${formatBigNumber(inputValue, inputCurrency?.decimals, {
        fractionDigits: 3,
        significantDigits: 1,
        compact: false,
      })} ${inputCurrency?.symbol} to ${outputCurrency?.symbol}`,
    };
  }, [
    estimate,
    inputCurrency?.decimals,
    inputCurrency?.symbol,
    outputCurrency?.symbol,
    inputValue,
  ]);

  return useCallback(async (): Promise<{
    tx?: TransactionResponse;
    outputCurrency?: Currency;
  }> => {
    if (
      !chainId ||
      !account ||
      !estimate ||
      !inputCurrency ||
      !outputCurrency ||
      !inputValue ||
      inputValue.eq(Zero)
    ) {
      return;
    }
    let job: {
      run: () => Promise<TransactionResponse>;
      summary: string;
    };
    switch (wrapType) {
      case WrapType.WRAP:
        job = wrap();
        break;
      case WrapType.UNWRAP:
        job = unwrap();
        break;
    }
    if (job) {
      try {
        const tx = await handleTransactionReceipt(job?.summary, job?.run);
        return Promise.resolve({
          tx: tx,
          outputCurrency: outputCurrency,
        });
      } catch (error) {
        return Promise.reject();
      }
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    chainId,
    account,
    estimate,
    inputCurrency,
    outputCurrency,
    inputValue,
    wrapType,
    wrap,
    unwrap,
    handleTransactionReceipt,
  ]);
};

export const useWrapType = () => {
  const { swapInputCurrencyId: inputCurrencyId, swapOutputCurrencyId: outputCurrencyId } =
    useSwapState();
  const { chainId } = useWeb3React();

  const inputCurrency = useUniswapToken(inputCurrencyId);
  const outputCurrency = useUniswapToken(outputCurrencyId);
  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return WrapType.NOT_APPLICABLE;
    }
    if (inputCurrency.isNative && isWrapNativeToken(chainId, outputCurrency)) {
      return WrapType.WRAP;
    } else if (isWrapNativeToken(chainId, inputCurrency) && outputCurrency.isNative) {
      return WrapType.UNWRAP;
    }
    return WrapType.NOT_APPLICABLE;
  }, [chainId, inputCurrency, outputCurrency]);
};
