import { Currency, Token } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo, useState } from 'react';
import { getBaseTokensToCheckTrades, getCustomBaseToken } from '../../../config';
import { PairInfo, PairTokens } from '../models/Pair';
import { useLastUpdated } from '../../../state/application/hooks';
import { useFetchMultiplePairInfos } from './useFetchMultiplePairInfos';
import { useGetValidPairs } from './useGetValidPairs';

export const useCombinationPairs = (currencyA?: Currency, currencyB?: Currency): PairInfo[] => {
  const { chainId } = useWeb3React();
  const fetchMultiplePairInfos = useFetchMultiplePairInfos();
  const lastUpdated = useLastUpdated();
  const [infos, setInfos] = useState<PairInfo[]>([]);

  const [tokenA, tokenB] = useMemo(() => {
    return chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined];
  }, [chainId, currencyA, currencyB]);

  const bases: Token[] = useMemo(() => {
    if (!chainId) return [];
    return getBaseTokensToCheckTrades(chainId) ?? [];
  }, [chainId]);

  const baseAddresses = useMemo(() => {
    return bases.map((item) => item.address?.toLowerCase());
  }, [bases]);

  const basePairs = useMemo(() => {
    const tokenAWithBase =
      tokenA && !baseAddresses.includes(tokenA.address?.toLowerCase())
        ? bases.map((base) => [base, tokenA])
        : [];
    const tokenBWithBase =
      tokenB && !baseAddresses.includes(tokenB.address?.toLowerCase())
        ? bases.map((base) => [base, tokenB])
        : [];
    return tokenAWithBase.concat(tokenBWithBase);
  }, [baseAddresses, bases, tokenA, tokenB]);

  const allCombinationPairs = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            basePairs.length ? [tokenA, tokenB] : [],
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true;
              const customBases = getCustomBaseToken(chainId);

              const customBasesA: Token[] | undefined = customBases?.[tokenA.address];
              const customBasesB: Token[] | undefined = customBases?.[tokenB.address];

              if (!customBasesA && !customBasesB) return true;

              if (customBasesA && !customBasesA.find((base) => tokenB.equals(base)))
                return false;
              if (customBasesB && !customBasesB.find((base) => tokenA.equals(base)))
                return false;

              return true;
            })
        : [],
    [tokenA, tokenB, basePairs, chainId],
  );

  const allCurrencyCombinationsMapping = useMemo(() => {
    return allCombinationPairs.map((item) => {
      return {
        currencyA: item[0].sortsBefore(item[1]) ? item[0] : item[1],
        currencyB: item[0].sortsBefore(item[1]) ? item[1] : item[0],
      } as PairTokens;
    });
  }, [allCombinationPairs]);

  const trackedPairs = useGetValidPairs(allCurrencyCombinationsMapping);

  useEffect(() => {
    fetchMultiplePairInfos(trackedPairs).then((data) => {
      setInfos(data);
    });
  }, [fetchMultiplePairInfos, trackedPairs, lastUpdated]);

  return useMemo(() => {
    return infos;
  }, [infos]);
};
