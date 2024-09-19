import { JsonRpcProvider } from '@ethersproject/providers';
import { createWeb3ReactRoot, useWeb3React } from '@web3-react/core';

export const Web3ReactUserWalletProvider = createWeb3ReactRoot('User');

export const useUserWallet = () => useWeb3React<JsonRpcProvider>('User');
