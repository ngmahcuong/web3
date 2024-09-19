import React from 'react';
import useModal from '../../hooks/useModal';
import { Button } from './Button';
import { ModalSelectWallet } from '../AccountModal/ModalSelectWallet';
import styled from 'styled-components';

const ButtonConnect: React.FC = () => {
  const [connect] = useModal(<ModalSelectWallet />);

  return (
    <StyledButton size="lg" onClick={connect}>
      Connect wallet
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  background: ${({ theme }) => theme.button.connect.background};
  border-radius: 5px;
  color: ${({ theme }) => theme.button.connect.color};
  border: 1px solid ${({ theme }) => theme.button.connect.borderColor};
  padding: 0 20px;
  margin-left: 15px;
  height: 42px;
  :not(:disabled) {
    :hover {
      background-color: ${({ theme }) => theme.button.connect.hover};
      border-color: ${({ theme }) => theme.button.connect.hover};
    }
  }
`;

export default ButtonConnect;
