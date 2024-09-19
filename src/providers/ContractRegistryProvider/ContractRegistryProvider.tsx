import { useMulticallQueue } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import React, { createContext, useMemo } from 'react';
import { ContractRegistry } from '../../types/Factory';
import { useUserWallet } from '../UserWalletProvider';

export const Context = createContext<ContractRegistry>(null);

export const ContractRegistryProvider: React.FC = ({ children }) => {
  const { account, library } = useUserWallet();
  const { chainId } = useWeb3React();
  const multicall = useMulticallQueue();

  const factory = useMemo(() => {
    if (!multicall) {
      return;
    }

    let signer = library && account ? library.getSigner(account) : null;
    return new ContractRegistry(chainId, signer, multicall);
  }, [account, chainId, library, multicall]);

  return <Context.Provider value={factory}>{children}</Context.Provider>;
};
