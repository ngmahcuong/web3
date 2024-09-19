import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { differenceInMonths } from 'date-fns';
import { useEffect, useState } from 'react';
import { ContractInterfaces } from '../../../../../abis';
import { getLockdropConfig } from '../../../../../config';
import { LockPoolInfo } from '../../../models/Lockdrop';

const useFetchLockdropPool = () => {
  const multicall = useMulticall();
  const { chainId, account } = useWeb3React();
  const lockDropConfig = getLockdropConfig(chainId);
  const [pools, setPools] = useState<LockPoolInfo[]>([]);
  const [isLoading, setPoolLoading] = useState(false);

  useEffect(() => {
    if (!multicall || !lockDropConfig) {
      return;
    }

    let mounted = true;

    let calls: Call[] = [];
    for (let i = 0; i < lockDropConfig.totalPool; i++) {
      calls.push({
        target: lockDropConfig.address,
        abi: ContractInterfaces.lockdrop.functions['poolInfo(uint256)'],
        params: [i],
      });
    }
    setPoolLoading(true);
    multicall(calls)
      .then((result) => {
        if (!mounted) {
          return;
        }

        setPools(
          result.map((x, i) => {
            return {
              ...x,
              index: i,
              durationMonth: differenceInMonths(
                new Date(x?.unlockTime * 1000),
                new Date(x?.lockTime * 1000),
              ),
            };
          }),
        );
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {
        setPoolLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [account, lockDropConfig, multicall]);

  return {
    pools,
    isLoading,
  };
};

export default useFetchLockdropPool;
