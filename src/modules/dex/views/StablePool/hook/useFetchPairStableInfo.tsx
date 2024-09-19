import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { constants } from 'ethers';
import { Zero } from '@ethersproject/constants';
import { StablePool, StablePoolConfig } from '../../../../stablepool/models/StablePool';
import { useWatchTokenBalance } from '../../../../../state/user/hooks';
import { useLastUpdated } from '../../../../../state/application/hooks';
import { useMulticall } from '@reddotlabs/multicall-react';
import { ContractInterfaces } from '../../../../../abis';

export const useFetchPairStableInfo = (poolConfig: StablePoolConfig) => {
  const watchTokens = useWatchTokenBalance();
  const [liquidityToken, setLiquidityToken] = useState<string | undefined>();
  const [reserves, setReserves] = useState<BigNumber[] | undefined>([]);
  const [tokenSupply, setTokenSupply] = useState<BigNumber | undefined>();
  const [virtualPrice, setVirtualPrice] = useState<BigNumber | undefined>();
  const [adminFee, setAdminFee] = useState<BigNumber | undefined>();
  const [fee, setFee] = useState<BigNumber | undefined>();
  const [a, setA] = useState<BigNumber | undefined>();
  const [loading, setLoading] = useState(true);
  const multicall = useMulticall();
  const lastUpdate = useLastUpdated();

  useEffect(() => {
    setLoading(true);
  }, [poolConfig]);

  const getPairInfo = useCallback(async () => {
    if (!poolConfig || !multicall) {
      return;
    }
    if (poolConfig.address === constants.AddressZero) {
      return;
    }
    const multicallResults = await multicall([
      {
        target: poolConfig.basePool,
        abi: ContractInterfaces.basePool.functions['getTokenBalances()'],
      },
      {
        target: poolConfig.address,
        abi: ContractInterfaces.pairInterface.functions['totalSupply()'],
      },
      {
        target: poolConfig.basePool,
        abi: ContractInterfaces.basePool.functions['adminFee()'],
      },
      {
        target: poolConfig.basePool,
        abi: ContractInterfaces.basePool.functions['getVirtualPrice()'],
      },
      {
        target: poolConfig.basePool,
        abi: ContractInterfaces.basePool.functions['getA()'],
      },
      {
        target: poolConfig.basePool,
        abi: ContractInterfaces.basePool.functions['fee()'],
      },
    ]);
    return {
      liquidityToken: poolConfig.address,
      lpSupply: multicallResults[1][0],
      reserves: multicallResults[0][0],
      adminFee: multicallResults[2][0],
      virtualPrice: multicallResults[3][0],
      a: multicallResults[4][0],
      fee: multicallResults[5][0],
    };
  }, [multicall, poolConfig]);

  useEffect(() => {
    getPairInfo()
      .then((data) => {
        setLoading(false);
        if (data) {
          setReserves(data.reserves);
          setLiquidityToken(data.liquidityToken);
          setTokenSupply(data.lpSupply);
          setVirtualPrice(data.virtualPrice);
          setA(data.a);
          setAdminFee(data.adminFee);
          watchTokens([data.liquidityToken]);
          setFee(data.fee);
        } else {
          setTokenSupply(Zero);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [getPairInfo, watchTokens, lastUpdate]);

  return useMemo(() => {
    return {
      loading: loading,
      lpToken: liquidityToken,
      totalSupply: tokenSupply,
      reserves,
      virtualPrice,
      a,
      adminFee,
      fee,
      id: poolConfig?.basePool,
    } as StablePool;
  }, [
    a,
    adminFee,
    fee,
    liquidityToken,
    loading,
    poolConfig?.basePool,
    reserves,
    tokenSupply,
    virtualPrice,
  ]);
};
