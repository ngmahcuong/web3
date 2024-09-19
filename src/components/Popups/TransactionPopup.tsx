import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { getExplorerUrl } from '../../config';
import { useGetTransaction } from '../../state/transactions/hooks';
import { Message, StyledContent, StyledIcon, Title } from './Share';

export type TransactionPopupProps = {
  hash: string;
};

export const TransactionPopup: React.FC<TransactionPopupProps> = ({ hash }) => {
  const { chainId } = useWeb3React();
  const transaction = useGetTransaction(hash);
  const theme = useTheme();

  const url = useMemo(() => {
    return [getExplorerUrl(chainId), 'tx', transaction?.hash].join('/');
  }, [chainId, transaction?.hash]);

  const status = useMemo(() => {
    if (!transaction) {
      return 'error';
    }
    if (transaction && !transaction.receipt) {
      return 'submitted';
    }

    if (transaction.receipt && transaction.receipt.status === 1) {
      // add lending error report logic
      return 'success';
    }

    return 'error';
  }, [transaction]);

  return (
    <Container target="_blank" href={url}>
      <CustomStyledIcon
        bg={
          status === 'success'
            ? theme.success
            : status === 'submitted'
            ? theme.warning
            : theme.danger
        }
      >
        {status === 'success' ? (
          <i className="fal fa-check-circle"></i>
        ) : status === 'submitted' ? (
          <i className="fal fa-hourglass"></i>
        ) : (
          <i className="fal fa-exclamation-triangle"></i>
        )}
      </CustomStyledIcon>
      <StyledContent>
        {status === 'submitted' ? (
          <Title>Transaction is pending</Title>
        ) : status === 'success' ? (
          <Title>Transaction completed</Title>
        ) : (
          <Title>Transaction failed</Title>
        )}
        <Message>{transaction?.summary}</Message>
      </StyledContent>
    </Container>
  );
};

const Container = styled.a`
  position: relative;
  display: flex;
  align-items: center;
`;

const CustomStyledIcon = styled(StyledIcon)<{ bg?: string }>`
  background-color: ${({ bg, theme }) => bg || '#5490e3'};
  i {
    &.fa-hourglass {
      animation: spin 2s linear infinite;
    }
  }
`;
