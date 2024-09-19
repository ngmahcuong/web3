import { useContext } from 'react';
import { Context } from '../providers/ContractRegistryProvider';

const useContractRegistry = () => {
  return useContext(Context);
};

export default useContractRegistry;
