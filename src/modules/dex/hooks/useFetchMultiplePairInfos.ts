import { useMulticall } from '@reddotlabs/multicall-react';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import { useWeb3React } from '@web3-react/core';
import { uniq } from 'lodash';
import { useCallback, useMemo } from 'react';
import { ContractInterfaces } from '../../../abis';
import { PairInfo, PairState, PairTokens } from '../models/Pair';
import { computePairAddress } from '../utils/pair';
import { useUniswapFactory } from './useUniswapFactory';

export const useFetchMultiplePairInfos = () => {
  const uniswapFactory = useUniswapFactory();
  const { chainId } = useWeb3React();
  const multicall = useMulticall();

  const factoryAddress = useMemo(() => {
    return uniswapFactory?.address;
  }, [uniswapFactory]);

  const pairInterface = useMemo(() => {
    return ContractInterfaces?.pairInterface;
  }, []);

  return useCallback(
    (watchedPairs: PairTokens[]) => {
      const currencies =
        watchedPairs.map((p) => {
          return [p.currencyA, p.currencyB];
        }) || [];

      const tokens = currencies.map(([currencyA, currencyB]) => {
        const [_currencyA, _currencyB] = [currencyA?.wrapped, currencyB?.wrapped];
        return [
          _currencyA.sortsBefore(_currencyB) ? _currencyA : _currencyB,
          _currencyA.sortsBefore(_currencyB) ? _currencyB : _currencyA,
        ];
      });

      const pairAddresses = factoryAddress
        ? tokens
            .filter(
              (pair) =>
                pair.every((t) => t) && uniq(pair.map((p) => p.address)).length === pair.length,
            )
            .map(([tokenA, tokenB]) => {
              return computePairAddress(chainId, tokenA, tokenB);
            })
        : [];

      if (!multicall || !pairAddresses.length) {
        return Promise.resolve([]);
      }

      return multicall(
        pairAddresses.map((pairAddress) => {
          return {
            target: pairAddress,
            abi: pairInterface.functions['getReserves()'],
            params: [],
          };
        }),
      )
        .then((results) => {
          const pairs = results.map((result, i) => {
            const currencyA = tokens[i][0];
            const currencyB = tokens[i][1];
            if (!currencyA || !currencyB || currencyA.equals(currencyB))
              return {
                currencyA,
                currencyB,
                pairState: PairState.INVALID,
              };
            if (!result?.length)
              return {
                currencyA,
                currencyB,
                pairState: PairState.NOT_EXISTS,
              };
            const { reserve0, reserve1 } = result;
            const [reserveA, reserveB] = currencyA.sortsBefore(currencyB)
              ? [reserve0, reserve1]
              : [reserve1, reserve0];

            return {
              currencyA,
              currencyB,
              pairState: PairState.EXISTS,
              liquidityToken: pairAddresses[i],
              reserveA,
              reserveB,
              pair: new Pair(
                CurrencyAmount.fromRawAmount(currencyA, reserveA.toString()),
                CurrencyAmount.fromRawAmount(currencyB, reserveB.toString()),
              ),
            };
          }) as PairInfo[];

          const infos = pairs.filter((p) => p.pairState === PairState.EXISTS);
          return infos;
        })
        .catch(() => {
          return [];
        });
    },
    [chainId, factoryAddress, multicall, pairInterface],
  );
};
