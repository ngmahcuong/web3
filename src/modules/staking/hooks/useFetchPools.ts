import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getChefConfigs } from '../../../config';
import { FarmPool } from '../models/Farm';

const useFetchPools = () => {
  const multicall = useMulticall();
  const { chainId, account } = useWeb3React();
  const chefConfig = getChefConfigs(chainId);
  const [pools, setPools] = useState<FarmPool[]>(undefined);

  useEffect(() => {
    if (!multicall || !chefConfig) {
      return;
    }
    let mounted = true;
    let calls: Call[] = [];

    for (let i = 0; i < chefConfig.totalPool; i++) {
      calls.push({
        target: chefConfig.address,
        abi: ContractInterfaces.masterChef.functions['poolInfo(uint256)'],
        params: [i],
      });
    }

    multicall(calls)
      .then((result) => {
        if (!mounted) {
          return;
        }
        const data: FarmPool[] = result.map((x, i) => {
          return {
            token: x.lpToken,
            index: i,
          };
        });
        setPools(data);
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, [account, chefConfig, multicall]);

  return {
    pools,
  };
};

export default useFetchPools;
