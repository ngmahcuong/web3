import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Currency } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { getWrappedToken } from '../../../config';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useGetDeadline } from '../../../state/application/hooks';
import { Path } from '../../../state/dex/actions';
import { useGasPrice, useRecipient } from '../../../state/dex/hooks';
import { SWAP_FEE, SWAP_FEE_PRECISION } from '../../../utils/constants';
import { formatBigNumber } from '../../../utils/numbers';
import { AdapterType, SwapStep } from '../types/SwapExecutor';
import { useAggregationRouter } from './useAggregationRouter';
import { useSwapExecutor } from './useSwapExecutor';

export const useSwap = (
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  inputAmount?: BigNumber,
  outputAmount?: BigNumber,
  minOutputAmount?: BigNumber,
  route?: Path[],
) => {
  const { account } = useUserWallet();
  const getDeadline = useGetDeadline();
  const gasPrice = useGasPrice();
  const recipientAddressOrName = useRecipient();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const aggregationRouter = useAggregationRouter();
  const swapExecutor = useSwapExecutor();
  const { chainId } = useWeb3React();
  const weth = useMemo(() => getWrappedToken(chainId)?.address, [chainId]);

  const recipient = useMemo(() => {
    return recipientAddressOrName ? recipientAddressOrName : account;
  }, [account, recipientAddressOrName]);

  const steps: SwapStep[] = useMemo(() => {
    const _steps: SwapStep[] = route?.map((r) => {
      switch (r.type) {
        case 'stableswap':
          const [fromIndex, toIndex] = r.meta;
          return {
            adapter: AdapterType.chaiStableSwap,
            market: r.poolId,
            fromToken: r.source,
            toToken: r.target,
            fromIndex,
            toIndex,
          };
        case 'uniswapv2':
          return {
            adapter: AdapterType.uniswapV2,
            pair: r.poolId,
            fromToken: r.source,
            toToken: r.target,
            fee: SWAP_FEE,
            feeDenom: SWAP_FEE_PRECISION,
          };
        default: {
          throw new Error('Invalid step');
        }
      }
    });

    if (inputCurrency?.isNative) {
      _steps?.unshift({
        adapter: AdapterType.depositETH,
        weth,
      });
    }
    if (outputCurrency?.isNative) {
      _steps?.push({
        adapter: AdapterType.withdrawETH,
        weth,
      });
    }

    return _steps;
  }, [inputCurrency?.isNative, outputCurrency?.isNative, route, weth]);

  const swap = useCallback(async () => {
    return aggregationRouter.swap(
      swapExecutor.address,
      inputAmount,
      steps,
      minOutputAmount,
      recipient,
      getDeadline(),
      gasPrice,
    ) as TransactionResponse;
  }, [
    aggregationRouter,
    gasPrice,
    getDeadline,
    inputAmount,
    minOutputAmount,
    recipient,
    steps,
    swapExecutor.address,
  ]);

  return useCallback(async (): Promise<{
    tx?: TransactionResponse;
    outputCurrency?: Currency;
  }> => {
    if (
      !inputAmount ||
      !outputAmount ||
      !inputCurrency ||
      !outputCurrency ||
      !aggregationRouter ||
      !swapExecutor
    ) {
      return;
    }
    try {
      const summary = `Swap ${formatBigNumber(inputAmount, inputCurrency?.decimals, {
        fractionDigits: 3,
        significantDigits: 0,
        compact: false,
      })} ${inputCurrency?.symbol} to ${formatBigNumber(
        outputAmount,
        outputCurrency?.decimals,
        {
          fractionDigits: 3,
          significantDigits: 0,
          compact: false,
        },
      )} ${outputCurrency?.symbol}`;
      const tx = await handleTransactionReceipt(summary, swap);
      return Promise.resolve({
        tx: tx,
        outputCurrency: outputCurrency,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }, [
    aggregationRouter,
    handleTransactionReceipt,
    inputAmount,
    inputCurrency,
    outputAmount,
    outputCurrency,
    swap,
    swapExecutor,
  ]);
};
