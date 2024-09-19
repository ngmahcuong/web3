import React, { useCallback } from 'react';
import styled from 'styled-components';
import imgSuccess from '../assets/images/lending-confirm-success.png';
import { useAddTokenMetamask } from '../hooks/useAddTokenToMetamask';
import { useNativeToken } from '../hooks/useNativeToken';
import { Button } from './Buttons';
import { ExplorerLink } from './ExplorerLink';
import Modal from './Modal/ModalStyles';

export type ModalSuccessProps = {
  symbol?: string;
  message?: string;
  tx?: string;
  onDismiss?: () => void;
  hideMetamaskButton?: boolean;
  address?: string;
  decimals?: number;
  logo?: string;
  title?: string;
};

export const ModalSuccess: React.FC<ModalSuccessProps> = ({
  onDismiss,
  symbol,
  message,
  tx,
  hideMetamaskButton,
  address,
  decimals,
  logo,
  title,
}) => {
  const addToken = useAddTokenMetamask();
  const nativeToken = useNativeToken();

  const onAddToken = useCallback(() => {
    addToken(symbol, address, decimals, logo);
  }, [addToken, address, decimals, symbol, logo]);

  return (
    <StyledModal>
      <StyledModalContent>
        <StyledModalClose onClick={onDismiss}>
          <i className="fal fa-times" />
        </StyledModalClose>
        <StyledModalImage src={imgSuccess} />
        <StyledModalTitle>{title ?? 'Completed'}</StyledModalTitle>
        {message ? <StyledDes>{message}</StyledDes> : undefined}
        {symbol !== nativeToken?.symbol && !hideMetamaskButton && (
          <StyledButtonAddMetamask onClick={onAddToken}>
            + Add {symbol} to the wallet
          </StyledButtonAddMetamask>
        )}
        <StyledTx>
          <ExplorerLink type="tx" address={tx}>
            Review tx details
            <i className="far fa-external-link"></i>
          </ExplorerLink>
        </StyledTx>
        <StyledButton onClick={onDismiss}>OK, Close</StyledButton>
      </StyledModalContent>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  width: 306px;
`;

const StyledModalClose = styled.button`
  position: absolute;
  top: 10px;
  right: 8px;
  cursor: pointer;
  opacity: 0.6;
  font-size: 20px;

  :hover {
    opacity: 1;
  }
`;

const StyledModalTitle = styled.div`
  padding-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
`;

const StyledModalContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 25px 20px 20px;
`;

const StyledModalImage = styled.img`
  margin: 0 auto;
  width: 130px;
  padding-bottom: 15px;
  width: 65px;
`;

const StyledDes = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.gray3};
`;

const StyledButtonAddMetamask = styled.button`
  margin-top: 14px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.gray3};
  background-color: ${({ theme }) => theme.box.innerBackground};
  border: 1px solid ${({ theme }) => theme.box.border};
  :hover {
    color: ${({ theme }) => theme.success};
  }
`;

const StyledTx = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 25px;
  color: ${({ theme }) => theme.muted};
  font-size: 12px;
  i {
    font-size: 10px;
    margin-left: 3px;
  }
  :hover {
    a {
      color: ${({ theme }) => theme.success};
    }
    color: ${({ theme }) => theme.success};
  }
`;

const StyledButton = styled(Button)`
  margin-top: 8px;
`;
