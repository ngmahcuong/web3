import { useMemo } from 'react';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import { useWeb3React } from '@web3-react/core';

export const useDexContract = (abi: Interface | string | any[], address: string) => {
  const { library, account } = useWeb3React();

  return useMemo(() => {
    if (!address || !abi) {
      return;
    }
    if (!account) {
      return new Contract(address, abi, library);
    }
    const provider = library.getSigner(account);
    return new Contract(address, abi, provider);
  }, [abi, account, address, library]);
};
