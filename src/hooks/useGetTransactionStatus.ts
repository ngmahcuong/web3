import { JsonRpcProvider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../state';
import { getFailure, reportErrorMessage } from '../state/transactions/updater';

export enum TransactionStatus {
  ERROR,
  SUCCESS,
  WAITING,
}

export const useGetTransactionStatus = () => {
  const { library: provider, chainId } = useWeb3React<JsonRpcProvider>();
  const state = useSelector<AppState>((state) => state.transactions);

  const transactions = useMemo(() => {
    return chainId ? state[chainId] ?? {} : {};
  }, [chainId, state]);

  return useCallback(
    (hash: string) => {
      if (!chainId || !hash) {
        return {
          status: TransactionStatus.WAITING,
          message: '',
        };
      }
      const tx = transactions[hash];
      return provider?.getTransactionReceipt(hash).then((receipt) => {
        if (receipt) {
          const failure = getFailure(receipt);
          if (failure) {
            return {
              status: TransactionStatus.ERROR,
              message: reportErrorMessage(tx?.errorReporter, failure)?.info,
            };
          }
          return {
            status: TransactionStatus.SUCCESS,
            message: '',
          };
        }
      });
    },
    [chainId, provider, transactions],
  );
};
