import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import useDebounce from '../../hooks/useDebounce';
import useIsWindowVisible from '../../hooks/useIsWindowVisible';
import { updateGasPrices } from '../dex/actions';
import { GasOption } from '../dex/reducer';
import { usePendingTransactionCount } from '../transactions/hooks';
import { updateBlockNumber } from './actions';
import { useLastUpdated, useUpdateAppData } from './hooks';

export function calculateGasPriceMargin(value: BigNumber, percent = 1000): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(percent)))
    .div(BigNumber.from(10000));
}

export default function Updater(): null {
  const { library: provider, chainId } = useWeb3React();
  const dispatch = useDispatch();
  const [state, setState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
  }>({
    chainId,
    blockNumber: null,
  });
  const updateAppData = useUpdateAppData();
  const isWindowVisible = useIsWindowVisible();
  const lastCheckedBlockNumber = useRef<number>(0);
  const numberOfBlockNumberToSkip = 10;
  const pendingTx = usePendingTransactionCount();
  const lastUpdated = useLastUpdated();

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (typeof state.blockNumber !== 'number') return { chainId, blockNumber };
        return {
          chainId,
          blockNumber:
            chainId === state.chainId ? Math.max(blockNumber, state.blockNumber) : blockNumber,
        };
      });
    },
    [chainId],
  );

  useEffect(() => {
    if (!provider) return;
    provider
      .getFeeData()
      .then((data) => {
        dispatch(
          updateGasPrices({
            gasPrices: {
              [GasOption.Normal]: data.gasPrice,
              [GasOption.Fast]: calculateGasPriceMargin(data.gasPrice, 1000),
              [GasOption.VeryFast]: calculateGasPriceMargin(data.gasPrice, 2000),
            },
          }),
        );
      })
      .catch((e) => {
        console.error('Gas price retrieval from Web3 provider failed.', e);
      });
  }, [dispatch, provider, lastUpdated]);

  // attach/detach listeners
  useEffect(() => {
    if (!provider) {
      return undefined;
    }

    provider.on('block', blockNumberCallback);
    return () => {
      provider.removeListener('block', blockNumberCallback);
    };
  }, [blockNumberCallback, provider]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber) return;
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber,
      }),
    );
  }, [dispatch, debouncedState.blockNumber, debouncedState.chainId]);

  useEffect(() => {
    if (isWindowVisible) {
      updateAppData();
    }
  }, [isWindowVisible, updateAppData]);

  useEffect(() => {
    updateAppData();
  }, [pendingTx, updateAppData]);

  useEffect(() => {
    if (
      !isWindowVisible ||
      !debouncedState.chainId ||
      !debouncedState.blockNumber ||
      !lastCheckedBlockNumber.current ||
      lastCheckedBlockNumber.current > debouncedState.blockNumber - numberOfBlockNumberToSkip
    ) {
      return;
    }

    updateAppData();
    lastCheckedBlockNumber.current = debouncedState.blockNumber;
  }, [
    debouncedState.blockNumber,
    debouncedState.chainId,
    dispatch,
    isWindowVisible,
    updateAppData,
  ]);

  return null;
}
