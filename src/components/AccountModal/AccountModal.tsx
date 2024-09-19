import React, { useCallback } from 'react';
import Modal, { ModalProps } from '../Modal/ModalStyles';
import { useDisconnectAccount } from '../../state/user/hooks';
import styled from 'styled-components';
import AccountTransactions from './AccountTransactions';
import { shortenAddress } from '../../utils/addresses';
import { ExplorerLink } from '../ExplorerLink';
import Spacer from '../Spacer';
import imgAccount from '../../assets/images/account.png';
import bg from '../../assets/images/bg-account-modal.png';
import iconDisconnect from '../../assets/icons/ic-disconnect.svg';
import { useUserWallet } from '../../providers/UserWalletProvider';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, deactivate } = useUserWallet();
  const shortAccount = shortenAddress(account);
  const disconnectAccount = useDisconnectAccount();

  const disconnect = useCallback(() => {
    deactivate();
    disconnectAccount();
    onDismiss && onDismiss();
  }, [deactivate, disconnectAccount, onDismiss]);

  return (
    <StyledModal size="xs" bg={bg}>
      <StyledAccountInfo>
        <StyledCloseButton onClick={onDismiss}>
          <i className="fal fa-times"></i>
        </StyledCloseButton>
        <StyledImage src={imgAccount}></StyledImage>
        <StyledAddress>{shortAccount}</StyledAddress>
        <StyledButtons>
          <StyledLink>
            <ExplorerLink address={account}>
              <i className="far fa-external-link"></i>
              Explorer
            </ExplorerLink>
          </StyledLink>
          <Spacer size="sm" />
          <StyledDisconnect onClick={disconnect}>
            <img src={iconDisconnect} alt="Disconnect" />
            Disconnect
          </StyledDisconnect>
        </StyledButtons>
      </StyledAccountInfo>
      <AccountTransactions />
    </StyledModal>
  );
};

const StyledModal = styled(Modal)<{ bg: string }>`
  padding: 0px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    width: 115px;
    height: 103px;
    right: 0;
    bottom: 0;
    background: url(${(p) => p.bg}) no-repeat;
    background-size: contain;
    z-index: -1;
  }
`;

const StyledCloseButton = styled.div`
  position: absolute;
  top: 6px;
  right: 12px;
  cursor: pointer;
  opacity: 0.6;
  font-size: 20px;

  :hover {
    opacity: 1;
  }
`;

const StyledAccountInfo = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 20px 15px 20px;
  background-color: ${(p) => p.theme.box.innerBackground};
`;

const StyledImage = styled.img`
  width: 55px;
`;

const StyledAddress = styled.div`
  padding-top: 5px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
`;

const StyledButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
`;

const StyledDisconnect = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 5px;
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.red};
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.red};
  img {
    width: 14px;
    margin-right: 5px;
  }
  :hover {
    background-color: ${({ theme }) => theme.danger};
    color: ${({ theme }) => theme.white};
    img {
      filter: brightness(0) invert(1);
    }
  }
`;

const StyledLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 5px;
  border-radius: 3px;
  border: 1px solid ${(p) => p.theme.text.primary};
  a {
    font-size: 14px;
    font-weight: normal;
    line-height: 1;
    i {
      font-size: 11px;
      margin-right: 5px;
    }
  }
  :hover {
    border: 1px solid ${(p) => p.theme.button.primary.background};
    background-color: ${(p) => p.theme.button.primary.background};
    a {
      color: ${(p) => p.theme.white};
    }
  }
`;

export default AccountModal;
