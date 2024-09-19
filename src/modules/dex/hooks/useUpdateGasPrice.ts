import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLastUpdated } from '../../../state/application/hooks';
import { updateGasPrices } from '../../../state/dex/actions';
import { GasOption } from '../../../state/dex/reducer';

export function calculateGasPriceMargin(value: BigNumber, percent = 1000): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(percent)))
    .div(BigNumber.from(10000));
}

export const useUpdateGasPrice = () => {
  const { library: provider } = useWeb3React();
  const dispatch = useDispatch();
  const lastUpdated = useLastUpdated();

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
};
