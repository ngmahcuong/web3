import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUniswapFactory } from './useUniswapFactory';
import { constants } from 'ethers';
import { useMulticall } from '@reddotlabs/multicall-react';
import { Zero } from '@ethersproject/constants';
import { useWatchTokenBalance } from '../../../state/user/hooks';
import { useLastUpdated } from '../../../state/application/hooks';
import { ContractInterfaces } from '../../../abis';
import { PairInfo, PairState } from '../models/Pair';
import { useWeb3React } from '@web3-react/core';
import { getAllStablePools } from '../../../config';

export const useFetchPairInfo = (currencyA?: Currency, currencyB?: Currency) => {
  const { chainId } = useWeb3React();
  const factory = useUniswapFactory();
  const watchTokens = useWatchTokenBalance();
  const [liquidityToken, setLiquidityToken] = useState<string | undefined>();
  const [reserveA, setReserveA] = useState<BigNumber | undefined>();
  const [reserveB, setReserveB] = useState<BigNumber | undefined>();
  const [isStablePool, setIsStablePool] = useState<boolean>(false);
  const [liquidityTokenSupply, setLiquidityTokenSupply] = useState<BigNumber | undefined>();
  const [loading, setLoading] = useState(true);
  const multicall = useMulticall();
  const lastUpdate = useLastUpdated();
  const stablePools = getAllStablePools(chainId);
  const stablePool = stablePools.find(
    (p) =>
      p.chAssetAddresses?.includes(currencyA?.wrapped.address) &&
      p.chAssetAddresses?.includes(currencyB?.wrapped.address),
  );

  useEffect(() => {
    setLoading(true);
    setReserveA(undefined);
    setReserveB(undefined);
  }, [currencyA?.wrapped?.address, currencyB?.wrapped?.address]);

  const pairState = useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      currencyA?.wrapped?.address === currencyB?.wrapped?.address
    ) {
      return PairState.INVALID;
    } else if (loading) {
      return PairState.LOADING;
    } else if (reserveA && reserveB) {
      return PairState.EXISTS;
    }
    return PairState.NOT_EXISTS;
  }, [loading, currencyA, currencyB, reserveA, reserveB]);

  const getPairInfo = useCallback(async () => {
    if (
      !factory ||
      !currencyA?.wrapped?.address ||
      !currencyB?.wrapped?.address ||
      !multicall
    ) {
      return;
    }
    const pairAddress = await factory.getPair(
      currencyA.wrapped.address,
      currencyB.wrapped.address,
    );
    if (pairAddress === constants.AddressZero && !stablePool) {
      return;
    }
    if (!stablePool) {
      const multicallResults = await multicall([
        {
          target: pairAddress,
          abi: ContractInterfaces.pairInterface.functions['getReserves()'],
        },
        {
          target: pairAddress,
          abi: ContractInterfaces.pairInterface.functions['totalSupply()'],
        },
      ]);
      const reserves = multicallResults[0];
      const lpSupply = multicallResults[1][0];
      return {
        liquidityToken: pairAddress,
        lpSupply,
        reserves,
        stable: false,
      };
    } else {
      const multicallResults = await multicall([
        {
          target: stablePool.basePool,
          abi: ContractInterfaces.basePool.functions['getTokenBalances()'],
        },
        {
          target: stablePool.address,
          abi: ContractInterfaces.pairInterface.functions['totalSupply()'],
        },
      ]);
      const reserves = multicallResults[0][0];
      const lpSupply = multicallResults[1][0];
      return {
        liquidityToken: stablePool.address,
        lpSupply,
        reserves,
        stable: true,
      };
    }
  }, [currencyA?.wrapped.address, currencyB?.wrapped.address, factory, multicall, stablePool]);

  useEffect(() => {
    getPairInfo()
      .then((data) => {
        setLoading(false);
        if (data) {
          setReserveA(data.reserves[0]);
          setReserveB(data.reserves[1]);
          setLiquidityToken(data.liquidityToken);
          setLiquidityTokenSupply(data.lpSupply);
          setIsStablePool(data.stable);
          watchTokens([data.liquidityToken]);
        } else {
          setLiquidityTokenSupply(Zero);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [getPairInfo, watchTokens, lastUpdate]);

  return useMemo(() => {
    return {
      pairState,
      liquidityToken,
      liquidityTokenSupply,
      reserveA:
        currencyA?.wrapped &&
        currencyB?.wrapped &&
        currencyA?.wrapped.address !== currencyB?.wrapped.address
          ? stablePool || currencyA.wrapped.sortsBefore(currencyB.wrapped)
            ? reserveA
            : reserveB
          : undefined,
      reserveB:
        currencyA?.wrapped &&
        currencyB?.wrapped &&
        currencyA?.wrapped.address !== currencyB?.wrapped.address
          ? stablePool || currencyA.wrapped.sortsBefore(currencyB.wrapped)
            ? reserveB
            : reserveA
          : undefined,
      currencyA,
      currencyB,
      isStablePool,
    } as PairInfo;
  }, [
    pairState,
    liquidityToken,
    liquidityTokenSupply,
    currencyA,
    currencyB,
    stablePool,
    reserveA,
    reserveB,
    isStablePool,
  ]);
};
