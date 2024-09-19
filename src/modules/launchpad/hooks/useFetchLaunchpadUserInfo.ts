import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { getLaunchpadConfigs } from '../../../config';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useLastUpdated } from '../../../state/application/hooks';
import { UserInfo } from '../models';

const useFetchLaunchpadUserInfo = (address: string, index: number, proof: any) => {
  const multicall = useMulticall();
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const launchpadConfig = getLaunchpadConfigs(chainId);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const lastUpdated = useLastUpdated();
  useEffect(() => {
    if (!multicall || !launchpadConfig || !account) {
      return;
    }
    let mounted = true;
    multicall([
      {
        target: address,
        signature: 'userInfo(address) view returns(uint256,uint256,bool)',
        params: [account],
      },
      {
        target: address,
        signature:
          'isWhitelist(uint256 _index, address _user, bytes32[] _merkleProof) public view returns (bool)',
        params: [index, account, proof],
      },
    ])
      .then(([[paymentAmount, chaiAmount, claimed], [isWhitelist]]) => {
        if (!mounted) {
          return;
        }
        setUserInfo({ paymentAmount, chaiAmount, claimed, isWhitelist });
      })
      .catch((error) => {
        console.warn(error);
      });
    return () => {
      mounted = false;
    };
  }, [account, address, chainId, index, launchpadConfig, multicall, proof, lastUpdated]);

  return userInfo;
};

export default useFetchLaunchpadUserInfo;
