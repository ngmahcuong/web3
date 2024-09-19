import { useEffect, useState } from 'react';
import { useMulticall } from '@reddotlabs/multicall-react';
import { Call } from '@reddotlabs/multicall';
import { ContractInterfaces } from '../../../../../abis';
import { getLockdropConfig } from '../../../../../config';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { useLastUpdated } from '../../../../../state/application/hooks';
import { UserLockPoolInfo } from '../../../models/Lockdrop';

const useFetchUserLockdropPool = () => {
  const multicall = useMulticall();
  const { chainId, account } = useUserWallet();
  const lockDropConfig = getLockdropConfig(chainId);
  const [userPools, setUserPools] = useState<UserLockPoolInfo[]>([]);
  const lastUpdated = useLastUpdated();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!multicall || !lockDropConfig || !account) {
      return;
    }

    let mounted = true;

    let calls: Call[] = [];
    for (let i = 0; i < lockDropConfig.totalPool; i++) {
      calls.push({
        target: lockDropConfig.address,
        abi: ContractInterfaces.lockdrop.functions['userInfo(uint256,address)'],
        params: [i, account],
      });
    }
    multicall(calls)
      .then((result) => {
        if (!mounted) {
          return;
        }

        const data = result.map((x, i) => {
          return {
            index: i,
            depositedValue: x[0],
          };
        });

        setUserPools(data);
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [account, lockDropConfig, multicall, lastUpdated]);

  return {
    userPools,
    isLoading,
  };
};

export default useFetchUserLockdropPool;
