import { useMulticall } from '@reddotlabs/multicall-react';
import { constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { PairTokens } from '../models/Pair';
import { useUniswapFactory } from './useUniswapFactory';

export const useGetValidPairs = (trackedPairs: PairTokens[]) => {
  const factory = useUniswapFactory();
  const multicall = useMulticall();
  const [currencies, setCurrencies] = useState([]);
  const uniswapFactory = useUniswapFactory();

  const trackedPairsFilter = useMemo(() => {
    return trackedPairs.filter((p) => p.currencyA && p.currencyB);
  }, [trackedPairs]);

  useEffect(() => {
    if (!multicall || !trackedPairsFilter.length || !factory) {
      return;
    }
    let mounted = true;
    multicall(
      trackedPairsFilter.map((pair) => {
        return {
          target: factory.address,
          abi: uniswapFactory?.interface?.functions['getPair(address,address)'],
          params: [pair.currencyA.wrapped.address, pair.currencyB.wrapped.address],
        };
      }),
    ).then((results) => {
      if (!mounted || !results.length) {
        return;
      }

      const validIndex = [];

      for (let i = 0; i < results.length; i++) {
        if (results[i][0] !== constants.AddressZero) {
          validIndex.push(i);
        }
      }

      setCurrencies(trackedPairsFilter.filter((i, index) => validIndex.includes(index)));
    });
    return () => {
      mounted = false;
    };
  }, [multicall, trackedPairsFilter, factory, uniswapFactory]);

  return currencies;
};
