import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getStakingConfig } from '../../../config';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import { useLastUpdated } from '../../../state/application/hooks';

const useFetchStakingInfo = () => {
  const multicall = useMulticall();
  const { chainId } = useWeb3React();
  const stakingConfig = getStakingConfig(chainId);
  const token = useTokenConfig(stakingConfig?.wantToken);
  const lastUpdated = useLastUpdated();
  const [rate, setRate] = useState<BigNumber | undefined>(undefined);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [totalBalance, setTotalBalance] = useState<BigNumber | undefined>(undefined);

  useEffect(() => {
    if (!multicall || !stakingConfig) {
      return;
    }
    let mounted = true;
    let calls: Call[] = [
      {
        target: stakingConfig.address,
        abi: ContractInterfaces.staking.functions['generationRate()'],
        params: [],
      },
      {
        target: stakingConfig.address,
        abi: ContractInterfaces.staking.functions['totalSupply()'],
        params: [],
      },
      {
        target: token?.address,
        abi: ContractInterfaces.erc20.functions['balanceOf(address)'],
        params: [stakingConfig?.address],
      },
    ];

    multicall(calls)
      .then((result) => {
        if (!mounted) {
          return;
        }
        const [rate, totalSupply, balance] = result;
        setRate(rate[0].mul(3600));
        setTotalSupply(totalSupply[0]);
        setTotalBalance(balance[0]);
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, [stakingConfig, multicall, lastUpdated, token?.address]);

  return {
    totalBalance,
    totalSupply,
    rate,
  };
};

export default useFetchStakingInfo;
