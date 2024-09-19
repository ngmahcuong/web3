import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getStakingConfig } from '../../../config';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useLastUpdated } from '../../../state/application/hooks';

const useFetchUserStakingInfo = () => {
  const multicall = useMulticall();
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const stakingConfig = getStakingConfig(chainId);
  const lastUpdated = useLastUpdated();
  const [minedValue, setMinedValue] = useState<BigNumber | undefined>(undefined);
  const [stakedValue, setStakedValue] = useState<BigNumber | undefined>(undefined);
  const [claimableValue, setClaimableValue] = useState<BigNumber | undefined>(undefined);

  useEffect(() => {
    if (!multicall || !stakingConfig || !account) {
      return;
    }
    let mounted = true;
    let calls: Call[] = [
      {
        target: stakingConfig.address,
        abi: ContractInterfaces.staking.functions['getStakedChai(address)'],
        params: [account],
      },
      {
        target: stakingConfig.address,
        abi: ContractInterfaces.staking.functions['balanceOf(address)'],
        params: [account],
      },
      {
        target: stakingConfig.address,
        abi: ContractInterfaces.staking.functions['claimable(address)'],
        params: [account],
      },
    ];

    multicall(calls)
      .then((result) => {
        if (!mounted) {
          return;
        }
        const [stakedValue, minedValue, claimableValue] = result;
        setStakedValue(stakedValue[0]);
        setMinedValue(minedValue[0]);
        setClaimableValue(claimableValue[0]);
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, [account, stakingConfig, multicall, lastUpdated]);

  return {
    stakedValue,
    minedValue,
    claimableValue,
  };
};

export default useFetchUserStakingInfo;
