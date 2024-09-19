import { useMemo } from 'react';
import { ContractType } from '../abis';
import useContractRegistry from './useContractRegistry';

export const useContract = (type: ContractType, address: string) => {
  const registry = useContractRegistry();

  return useMemo(() => {
    return registry && address ? registry.getContract(type, address) : null;
  }, [address, registry, type]);
};
