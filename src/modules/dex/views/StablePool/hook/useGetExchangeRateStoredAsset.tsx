import { useMemo, useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useAssetsInfo } from './useAssetsInfo';

export const useGetExchangeRateStoredAsset = (assets: string[]) => {
  const [exchangeRates, setExchangeRates] = useState<BigNumber[]>();
  const multicall = useMulticall();
  const assetsInfo = useAssetsInfo(assets);

  const onExchangeRatesChain = useCallback((index: number, value: BigNumber) => {
    setExchangeRates((t) => {
      t[index] = value;
      return [...t];
    });
  }, []);

  useEffect(() => {
    if (!assets || assets?.length === 0) {
      setExchangeRates([]);
      return;
    }
    let mount = true;
    let calls: Call[] = [];
    try {
      for (let i = 0; i < assetsInfo?.length; i++) {
        calls.push({
          target: assetsInfo[i].address,
          signature: 'exchangeRateStored() returns (uint256)',
        });
      }
      multicall(calls).then((data) => {
        if (!mount) {
          return;
        }
        const result = data.map((x, i) => {
          return x[0];
        });
        setExchangeRates(result);
      });
    } catch (ex) {
      setExchangeRates([]);
    }
    return () => {
      mount = false;
    };
  }, [assets, assets?.length, assetsInfo, multicall, onExchangeRatesChain]);

  return useMemo(() => {
    return {
      exchangeRates,
    };
  }, [exchangeRates]);
};
