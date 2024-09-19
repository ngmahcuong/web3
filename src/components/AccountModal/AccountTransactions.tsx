import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useUserWallet } from '../../providers/UserWalletProvider';
import {
  isTransactionRecent,
  useAllTransactions,
  useClearAllTransactions,
} from '../../state/transactions/hooks';
import { TransactionDetails } from '../../state/transactions/reducer';
import Transaction from './Transaction';
const MAX_TRANSACTION_HISTORY = 5;

const AccountTransactions: React.FC = () => {
  const allTransactions = useAllTransactions();
  const clearAllTransactions = useClearAllTransactions();

  const newTransactionsFirst = useCallback((a: TransactionDetails, b: TransactionDetails) => {
    return b.addedTime - a.addedTime;
  }, []);

  const { account } = useUserWallet();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions).filter((t) => t.from === account);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [account, allTransactions, newTransactionsFirst]);

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt);
  const confirmed = sortedRecentTransactions
    .filter((tx) => tx.receipt)
    .slice(0, MAX_TRANSACTION_HISTORY);

  const isEmpty = confirmed?.length + pending?.length === 0;
  return (
    <StyledTransactions>
      {isEmpty && <div>Your transactions will appear here...</div>}
      {!isEmpty && (
        <>
          <StyledTransactionsHeader>
            History
            <button onClick={clearAllTransactions}>
              <i className="far fa-trash-alt" />
              Clear
            </button>
          </StyledTransactionsHeader>

          <StyledTransactionList>
            {pending?.length > 0 && pending.map((tx) => <Transaction key={tx.hash} tx={tx} />)}
            {confirmed?.length > 0 &&
              confirmed.map((tx) => <Transaction key={tx.hash} tx={tx} />)}
          </StyledTransactionList>
        </>
      )}
    </StyledTransactions>
  );
};

const StyledTransactions = styled.div`
  padding: 15px 20px 15px 20px;
  font-size: 14px;
`;

const StyledTransactionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  button {
    padding: 0;
    margin: 0;
    color: ${({ theme }) => theme.danger};
    font-size: 13px;
    display: flex;
    align-items: center;
    i {
      margin-bottom: 2px;
    }
    &:hover {
      color: ${({ theme }) => theme.red};
    }
  }
  i {
    margin-right: 3px;
  }
`;

const StyledTransactionList = styled.div`
  margin-top: 5px;
`;

export default AccountTransactions;
