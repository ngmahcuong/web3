import { Zero } from '@ethersproject/constants';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useEffect, useMemo, useState } from 'react';
import useContractRegistry from '../../../../../hooks/useContractRegistry';
import { useMulticall } from '@reddotlabs/multicall-react';
import { BlocksPerDay, LendingPrecision, Precision } from '../../../../../utils/constants';
import { useMarket } from '../../../hooks/useLendingMarkets';

export type UtilizationApyInfo = {
  util: number;
  supplyApy: number;
  borrowApy: number;
  current?: boolean;
};

const useInterestRateModelData = (asset: string) => {
  const market = useMarket(asset);
  const registry = useContractRegistry();
  const multicall = useMulticall();
  const [interestRateModelAddress, setInterestRateModelAddress] = useState<string | undefined>(
    undefined,
  );
  const [data, setData] = useState<UtilizationApyInfo[]>([]);

  const marketToken = useMemo(() => {
    return registry?.getMarketByAddress(market?.marketAddress);
  }, [registry, market?.marketAddress]);

  useEffect(() => {
    if (!marketToken) {
      return;
    }
    marketToken?.interestRateModel()?.then((address) => {
      setInterestRateModelAddress(address);
    });
  }, [marketToken]);

  const totalSupplyUnderlying = useMemo(() => {
    return market?.totalSupply.mul(market?.exchangeRate).div(Precision);
  }, [market]);

  const currentUtil = useMemo(() => {
    if (!totalSupplyUnderlying || totalSupplyUnderlying.eq(0)) {
      return Zero;
    }
    return market?.totalBorrows?.mul(1e4).div(totalSupplyUnderlying)?.div(1e2).toNumber();
  }, [market?.totalBorrows, totalSupplyUnderlying]);

  useEffect(() => {
    let mounted = true;
    if (!interestRateModelAddress || !multicall) {
      return;
    }
    multicall([
      {
        target: interestRateModelAddress,
        signature: 'baseRatePerBlock() returns (uint256)',
        params: [],
      },
      {
        target: interestRateModelAddress,
        signature: 'multiplierPerBlock() returns (uint256)',
        params: [],
      },
      {
        target: interestRateModelAddress,
        signature: 'jumpMultiplierPerBlock() returns (uint256)',
        params: [],
      },
      {
        target: interestRateModelAddress,
        signature: 'kink() returns (uint256)',
        params: [],
      },
    ]).then((response) => {
      if (mounted && response) {
        const baseRatePerBlock = response[0][0];
        const multiplierPerBlock = response[1][0];
        const jumpMultiplierPerBlock = response[2][0];
        const kink = response[3][0];
        const reserveFactor = market?.reserveFactor;
        const interestModalData = Array.from(Array(101).keys()).map((r) => {
          let borrowRate = Zero;
          let supplyRate = Zero;
          const ratio = r * 0.01;
          const util = parseUnits(ratio.toString(), 18);
          const current = currentUtil >= r && currentUtil < r + 1;
          if (util.lte(kink)) {
            borrowRate = util
              .mul(multiplierPerBlock)
              .div(LendingPrecision)
              .add(baseRatePerBlock);
          } else {
            const normalRate = kink
              .mul(multiplierPerBlock)
              .div(LendingPrecision)
              .add(baseRatePerBlock);
            const excessUtil = util.sub(kink);
            borrowRate = excessUtil
              .mul(jumpMultiplierPerBlock)
              .div(LendingPrecision)
              .add(normalRate);
          }
          const rateToPool = LendingPrecision.sub(reserveFactor)
            .mul(borrowRate)
            .div(LendingPrecision);
          supplyRate = util.mul(rateToPool).div(LendingPrecision);
          return {
            util: r,
            supplyApy:
              100 * (Math.pow(+formatUnits(supplyRate, 18) * BlocksPerDay + 1, 365) - 1),
            borrowApy:
              100 * (Math.pow(+formatUnits(borrowRate, 18) * BlocksPerDay + 1, 365) - 1),
            current,
          };
        });
        setData(interestModalData);
      }
    });
    return () => {
      mounted = false;
    };
  }, [currentUtil, interestRateModelAddress, market?.reserveFactor, multicall]);

  return data;
};

export default useInterestRateModelData;
