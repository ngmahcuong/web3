import { useCallback } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { ContractType } from '../../../abis';
import { useContract } from '../../../hooks/useContract';
import { useGasPrice } from '../../../state/dex/hooks';
import { Zero } from '@ethersproject/constants';

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(3000))).div(BigNumber.from(10000));
}

export const useEstimateContract = (abi: ContractType, address: string) => {
  const contract = useContract(abi, address);
  const gasPrice = useGasPrice();

  const estimate = useCallback(
    (
      method: string,
      args: Array<string | string[] | number | BigNumber | boolean>,
      value?: BigNumber | null,
    ): Promise<TransactionResponse> => {
      return contract?.estimateGas?.[method](...args, value ? { value } : {}).then(
        (estimatedGasLimit) => {
          return contract?.[method]?.(
            ...args,
            gasPrice && gasPrice.gt(Zero)
              ? {
                  ...(value ? { value } : {}),
                  gasLimit: calculateGasMargin(estimatedGasLimit),
                  gasPrice,
                }
              : { ...(value ? { value } : {}) },
          );
        },
      );
    },
    [contract, gasPrice],
  );

  return estimate;
};
