import { TransactionResponse } from '@ethersproject/providers';
import { nanoid } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useAddPopup } from '../state/application/hooks';
import { TransactionCustomData, useTransactionAdder } from '../state/transactions/hooks';
import { getErrorMessage } from '../utils/transactionError';

type TransactionCreator = () => Promise<TransactionResponse>;

export const useHandleTransactionReceipt = () => {
  const addPopup = useAddPopup();
  const addTransaction = useTransactionAdder();

  return useCallback(
    async (
      summary: string,
      func: TransactionCreator,
      customData?: Omit<TransactionCustomData, 'summary' | 'popupId'>,
      hidePopup?: boolean,
    ) => {
      const popupId = nanoid();

      if (!hidePopup) {
        addPopup(
          {
            type: 'waiting',
            title: 'Waiting for confirmation',
            message: summary,
          },
          popupId,
        );
      }

      try {
        const tx = await func();
        addTransaction(tx, {
          summary,
          popupId,
          hidePopup: hidePopup,
          ...(customData || {}),
        });
        if (!hidePopup) {
          addPopup(
            {
              type: 'transaction',
              hash: tx.hash,
            },
            popupId,
            true,
          );
        }
        return tx;
      } catch (e) {
        if (!hidePopup) {
          addPopup(
            {
              type: 'error',
              title: 'Transaction not submitted',
              message: getErrorMessage(e),
            },
            popupId,
          );
        }

        throw e;
      }
    },
    [addPopup, addTransaction],
  );
};
