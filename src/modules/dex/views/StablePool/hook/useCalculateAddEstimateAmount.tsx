import { useMemo, useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useContract } from '../../../../../hooks/useContract';
import { useAssetsInfo } from './useAssetsInfo';
import { parseUnits } from 'ethers/lib/utils';
import { sum } from '../../../../../utils/numbers';
import { Zero } from '@ethersproject/constants';
import { StablePool, StablePoolConfig } from '../../../../stablepool/models/StablePool';
import { Precision } from '../../../../../utils/constants';
import { useGetExchangeRateStoredAsset } from './useGetExchangeRateStoredAsset';

export const useCalculateAddEstimateAmount = (
  poolConfig: StablePoolConfig,
  poolInfo: StablePool,
  assets: string[],
  chAssets: string[],
  amounts: BigNumber[],
  usingZap: boolean,
) => {
  const basepoolContract = useContract('basePool', poolConfig?.basePool);
  const zapContract = useContract('stableSwapZap', poolConfig?.zap);
  const [outputAmount, setOutputAmount] = useState<BigNumber>();
  const [bonus, setBonus] = useState<BigNumber>();
  const [impact, setImpact] = useState<BigNumber>();
  const multicall = useMulticall();
  const assetsInfo = useAssetsInfo(assets);
  const { exchangeRates } = useGetExchangeRateStoredAsset(chAssets);
  const newTotalSupply = useMemo(() => {
    return poolInfo?.totalSupply?.add(outputAmount || Zero);
  }, [outputAmount, poolInfo]);

  const poolShare = useMemo(() => {
    return poolInfo ? outputAmount?.mul(1e6).div(newTotalSupply) : null;
  }, [outputAmount, newTotalSupply, poolInfo]);

  const calculateImpact = useCallback(
    (amounts: BigNumber[], output: BigNumber) => {
      if (!poolInfo || !poolInfo?.totalSupply) {
        return;
      }
      const totalInput = assetsInfo
        .map((t, i) => {
          if (usingZap) {
            return amounts[i]?.mul(parseUnits('1', 18 - t.decimals)) || Zero;
          } else {
            if (exchangeRates && exchangeRates[i]?.gt(0)) {
              return (
                amounts[i]
                  ?.mul(exchangeRates[i])
                  .mul(parseUnits('1', 18 - assetsInfo[i].decimals))
                  .div(Precision) || Zero
              );
            }
            return Zero;
          }
        })
        .reduce(sum, Zero);
      if (poolInfo?.totalSupply.eq(0)) {
        return {
          impact: Zero,
          bonus: Zero,
        };
      }

      const totalOutput = output.mul(poolInfo?.virtualPrice).div(parseUnits('1', 18));

      const impact = totalInput.gt(totalOutput)
        ? totalInput.sub(totalOutput).mul(Precision).div(totalInput)
        : null;
      const bonus = totalOutput.gt(totalInput)
        ? totalOutput.sub(totalInput).mul(Precision).div(totalInput)
        : null;
      return {
        output,
        impact,
        bonus,
      };
    },
    [poolInfo, assetsInfo, usingZap, exchangeRates],
  );

  useEffect(() => {
    if (!basepoolContract || !zapContract || !amounts || !amounts?.some((t) => t?.gt(0))) {
      setOutputAmount(undefined);
      setBonus(undefined);
      setImpact(undefined);
      return;
    }
    let mount = true;
    const amountDatas = amounts.map((t) => {
      if (t === undefined) {
        t = Zero;
      }
      return t;
    });
    try {
      if (usingZap) {
        zapContract?.calculateDeposit(poolConfig?.basePool, amountDatas).then((outputData) => {
          if (!mount) {
            return;
          }
          const { bonus, impact } = calculateImpact(amountDatas, outputData);
          setOutputAmount(outputData);
          setBonus(bonus);
          setImpact(impact);
        });
      } else {
        basepoolContract?.calculateTokenAmount(amountDatas, true).then((data) => {
          if (!mount) {
            return;
          }
          const { bonus, impact } = calculateImpact(amountDatas, data);
          setOutputAmount(data);
          setBonus(bonus);
          setImpact(impact);
        });
      }
    } catch (ex) {
      setOutputAmount(undefined);
      setBonus(undefined);
      setImpact(undefined);
    }
    return () => {
      mount = false;
    };
  }, [
    amounts,
    assets?.length,
    assetsInfo,
    basepoolContract,
    calculateImpact,
    exchangeRates,
    multicall,
    poolConfig?.basePool,
    usingZap,
    zapContract,
  ]);

  return useMemo(() => {
    return {
      outputAmount,
      bonus,
      impact,
      poolShare,
    };
  }, [bonus, outputAmount, impact, poolShare]);
};
