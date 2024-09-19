import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getChefConfigs } from '../../../config';
import { useUserWallet } from '../../../providers/UserWalletProvider';

export const useFetchUserPoolInfo = (index: number) => {
  const multicall = useMulticall();
  const { account } = useUserWallet();
  const [deposited, setDeposited] = useState<BigNumber>(undefined);
  const [userFactor, setUserFactor] = useState<BigNumber>(undefined);

  const { chainId } = useWeb3React();
  const chefConfig = getChefConfigs(chainId);

  useEffect(() => {
    if (!chefConfig || !account || index === undefined) {
      return;
    }
    let calls: Call[] = [
      {
        target: chefConfig.address,
        abi: ContractInterfaces.masterChef.functions['userInfo(uint256,address)'],
        params: [index, account],
      },
    ];

    multicall(calls)
      .then((result) => {
        setUserFactor(result[0].factor);
        setDeposited(result[0].amount);
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {});
  }, [account, chefConfig, index, multicall]);

  return useMemo(() => {
    return {
      deposited,
      userFactor,
    };
  }, [deposited, userFactor]);
};

export default useFetchUserPoolInfo;
