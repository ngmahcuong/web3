import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useCallback, useState } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getChefConfigs } from '../../../config';

export const useFetchPoolInfo = () => {
  const multicall = useMulticall();
  const [liquidity, setLiquidity] = useState<BigNumber>(undefined);
  const [chaiPerSec, setChaiPerSec] = useState<BigNumber>(undefined);
  const [dialutingRepartition, setDialutingRepartition] = useState<BigNumber>(undefined);
  const [nonDialutingRepartition, setNonDialutingRepartition] = useState<BigNumber>(undefined);
  const [sumOfFactors, setSumOfFactors] = useState<BigNumber>(undefined);

  const { chainId } = useWeb3React();
  const chefConfig = getChefConfigs(chainId);

  const fetchData = useCallback(
    (address: string, index: number) => {
      if (!chefConfig) {
        return;
      }
      let calls: Call[] = [
        {
          target: address,
          abi: ContractInterfaces.erc20.functions['balanceOf(address)'],
          params: [chefConfig.address],
        },
        {
          target: chefConfig.address,
          abi: ContractInterfaces.masterChef.functions['chaiPerSec()'],
          params: [],
        },
        {
          target: chefConfig.address,
          abi: ContractInterfaces.masterChef.functions['dialutingRepartition()'],
          params: [],
        },
        {
          target: chefConfig.address,
          abi: ContractInterfaces.masterChef.functions['nonDialutingRepartition()'],
          params: [],
        },
        {
          target: chefConfig.address,
          abi: ContractInterfaces.masterChef.functions['poolInfo(uint256)'],
          params: [index],
        },
      ];

      multicall(calls)
        .then((result) => {
          setLiquidity(result[0][0]);
          setChaiPerSec(result[1][0]);
          setDialutingRepartition(result[2][0]);
          setNonDialutingRepartition(result[3][0]);
          setSumOfFactors(result[4].sumOfFactors);
        })
        .catch((error) => {
          console.warn(error);
        })
        .finally(() => {});
    },
    [chefConfig, multicall],
  );

  return {
    liquidity,
    chaiPerSec,
    dialutingRepartition,
    nonDialutingRepartition,
    sumOfFactors,
    fetchData,
  };
};

export default useFetchPoolInfo;
