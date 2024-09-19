import { useMemo, useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { useContract } from '../../../../../hooks/useContract';
import { Precision } from '../../../../../utils/constants';
import { Zero } from '@ethersproject/constants';
import { sum } from '../../../../../utils/numbers';
import { parseUnits } from 'ethers/lib/utils';
import { useGetExchangeRateStoredAsset } from './useGetExchangeRateStoredAsset';
import { StablePool } from '../../../../stablepool/models/StablePool';
import { useAssetsInfo } from './useAssetsInfo';

export const useCalculateRemoveEstimateAmount = (
  amount: BigNumber,
  basepool: string,
  zapBasepool: string,
  usingZap: boolean,
  poolInfo: StablePool,
  assets: string[],
  chAssets?: string[],
) => {
  const basepoolContract = useContract('basePool', basepool);
  const zapContract = useContract('stableSwapZap', zapBasepool);
  const [outputAmounts, setOutputAmounts] = useState<BigNumber[]>();
  const [bonus, setBonus] = useState<BigNumber>();
  const [impact, setImpact] = useState<BigNumber>();
  const { exchangeRates } = useGetExchangeRateStoredAsset(chAssets);
  const assetsInfo = useAssetsInfo(assets);

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
                  .mul(exchangeRates[i])
                  .mul(parseUnits('1', 18 - assetsInfo[i]?.decimals))
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
    if (!basepoolContract || !zapContract || !amount) {
      setOutputAmounts(undefined);
      setBonus(bonus);
      setImpact(impact);
      return;
    }
    let mount = true;
    try {
      const call = usingZap
        ? zapContract.calculateRemoveLiquidity(basepool, amount)
        : basepoolContract.calculateRemoveLiquidity(amount);
      call?.then((data) => {
        if (!mount) {
          return;
        }
        const { bonus, impact } = calculateImpact(data, amount);
        setBonus(bonus);
        setImpact(impact);
        setOutputAmounts(data);
      });
    } catch (ex) {
      setOutputAmounts(undefined);
      setBonus(undefined);
      setImpact(undefined);
    }
    return () => {
      mount = false;
    };
  }, [
    amount,
    basepool,
    basepoolContract,
    bonus,
    calculateImpact,
    impact,
    usingZap,
    zapContract,
  ]);

  return useMemo(() => {
    return {
      outputAmounts,
      impact,
      bonus,
    };
  }, [bonus, impact, outputAmounts]);
};
