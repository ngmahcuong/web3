import { Currency } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import { useMemo } from 'react';
import { PairState } from '../models/Pair';
import { useCombinationPairs } from './useCombinationPairs';
import { useOfficialPairs } from './useOfficialPairs';

export const useTradePairs = (currencyA?: Currency, currencyB?: Currency): Pair[] => {
  const officialPairs = useOfficialPairs();
  const allCombinationPairs = useCombinationPairs(currencyA, currencyB);

  const allPairs = useMemo(() => {
    return officialPairs.concat(allCombinationPairs);
  }, [allCombinationPairs, officialPairs]);

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      allPairs
        ? Object.values(
            allPairs
              .map<[PairState, Pair]>((i) => [i.pairState, i.pair])
              // filter out invalid pairs
              .filter((result): result is [PairState.EXISTS, Pair] =>
                Boolean(result[0] === PairState.EXISTS && result[1]),
              )
              // filter out duplicated pairs
              .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
                memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr;
                return memo;
              }, {}),
          )
        : [],
    [allPairs],
  );
};
