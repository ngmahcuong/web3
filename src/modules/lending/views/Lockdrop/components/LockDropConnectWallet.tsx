import styled from 'styled-components';
import imgWallet from '../../../../../assets/images/lockdrop-wallet.png';
import { Button } from '../../../../../components/Buttons';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
export const LockDropConnectWallet: React.FC = () => {
  const [connect] = useModalConnectWallet();
  return (
    <StyleContainer>
      <StyleImageWallet src={imgWallet} />
      <StyleDescription>
        {'To see your lockdrop asset, you need to connect your wallet'}
      </StyleDescription>
      <StyleButtonConnectWallet onClick={connect}>{'Connect wallet'}</StyleButtonConnectWallet>
    </StyleContainer>
  );
};

const StyleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin-top: 140px;
`;

const StyleDescription = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.gray3};
  text-align: center;
  margin-top: 18px;
`;

const StyleButtonConnectWallet = styled(Button)`
  margin-top: 24px;
  padding-left: 20px;
  padding-right: 20px;
`;

const StyleImageWallet = styled.img`
  width: 57px;
  margin: auto;
`;
