import { useWeb3React } from '@web3-react/core';
import React, { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { getExplorerUrl } from '../../config';
import { TransactionDetails } from '../../state/transactions/reducer';
import { ExplorerLink } from '../ExplorerLink';

interface TransactionProps {
  tx: TransactionDetails;
}

const Transaction: React.FC<TransactionProps> = ({ tx }) => {
  const { chainId } = useWeb3React();
  const theme = useTheme();
  const summary = tx.summary;
  const pending = !tx.receipt;
  const success =
    !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined');

  const url = useMemo(() => {
    return [getExplorerUrl(chainId), 'tx', tx.hash].join('/');
  }, [chainId, tx.hash]);

  return summary ? (
    <StyleContainer>
      {pending ? (
        <i className="far fa-circle-notch fa-spin" />
      ) : (
        <i
          className={success ? 'far fa-check-circle' : 'far fa-exclamation-circle'}
          style={{ color: success ? theme.success : theme.danger }}
        />
      )}
      <ExplorerLink type="tx" address={tx.hash}>
        {summary ?? tx.hash}
      </ExplorerLink>
      <a target="_blank" href={url} rel="noreferrer" className="right">
        <i className="far fa-external-link link"></i>
      </a>
    </StyleContainer>
  ) : null;
};

const StyleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;
  .right {
    margin-left: auto;
  }
  a {
    font-size: 14px;
    font-weight: normal;
    :hover {
      text-decoration: underline;
    }
  }
  span {
    font-size: 12px;
    font-weight: normal;
    margin: 0px 10px 0px auto;
  }
  i {
    font-size: 16px;
    margin-right: 8px;
    :last-child {
      margin-left: auto;
      color: ${({ theme }) => theme.success};
      font-size: 12px;
    }
  }
  .link {
    margin-right: 0;
  }
`;

export default Transaction;
