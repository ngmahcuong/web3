import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import icLock from '../../../../../assets/icons/ic-lock.svg';
import { Button } from '../../../../../components/Buttons';
import useModal from '../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { LockPoolInfo } from '../../../models/Lockdrop';
import { LockDropItem } from './LockDropItem';
import ModalDeposit from './Modals/LockDropModalDeposit';
export type LockDropDepositItemProps = {
  pool: LockPoolInfo;
};

export const LockDropDepositItem: React.FC<LockDropDepositItemProps> = ({ pool }) => {
  const { account } = useUserWallet();

  const lockStarted = useMemo(() => {
    return pool?.lockTime * 1000 < Date.now();
  }, [pool]);

  const [openDepositModal] = useModal(
    <ModalDeposit poolId={pool?.index} address={pool?.token} />,
    'lockdrop-deposit-modal',
  );

  const handleShowDepositModal = useCallback(() => {
    openDepositModal();
  }, [openDepositModal]);

  return (
    <LockDropItem
      pool={pool}
      footer={
        <>
          {account ? (
            <StyledActions>
              {lockStarted ? (
                <StyleLockedContainer>
                  <StyleImageLocked src={icLock} />
                  <StyleLockText>Locked for deposit</StyleLockText>
                </StyleLockedContainer>
              ) : (
                <Button disabled={lockStarted} onClick={handleShowDepositModal} size="sm">
                  Deposit
                </Button>
              )}
            </StyledActions>
          ) : (
            <></>
          )}
        </>
      }
    />
  );
};

const StyledActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const StyleLockedContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
`;

const StyleImageLocked = styled.img`
  size: 15px;
`;

const StyleLockText = styled.div`
  color: ${({ theme }) => theme.orange};
  margin-left: 10px;
`;
