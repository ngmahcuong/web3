import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';
import { getLaunchpadConfigs } from '../../../config';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { MerkleTreeClaimAccount } from '../models';

export const useMerkleTreeInfo = () => {
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const launchpadConfigs = getLaunchpadConfigs(chainId);
  const [merkleTreeClaimAccount, setMerkleTreeClaimAccount] =
    useState<MerkleTreeClaimAccount>();

  const fetchDataFromFile = useCallback(async () => {
    const merkleTreeResponse = await fetch(`ropsten/${launchpadConfigs[0]?.fileName}`);
    const merkleTreeData = await merkleTreeResponse.json();
    const merkleTreeAccount = merkleTreeData?.claims[account];
    return {
      merkleTreeAccount,
    };
  }, [account, launchpadConfigs]);

  useEffect(() => {
    let mount = true;
    fetchDataFromFile().then((data) => {
      if (!mount) {
        return;
      }
      setMerkleTreeClaimAccount(data?.merkleTreeAccount);
    });
    return () => {
      mount = false;
    };
  }, [fetchDataFromFile]);

  return merkleTreeClaimAccount;
};
