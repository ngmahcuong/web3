import { useMemo } from 'react';
import styled from 'styled-components';
import icLock from '../../../../../assets/icons/ic-lock.svg';
import { LockPoolInfo } from '../../../models/Lockdrop';
import LockDropButtonWithdraw from './LockDropButtonWithdraw';
import { LockDropItem } from './LockDropItem';

export type LockDropWithdrawItemProps = {
  pool: LockPoolInfo;
};

export const LockDropWithdrawItem: React.FC<LockDropWithdrawItemProps> = ({ pool }) => {
  const lockStarted = useMemo(() => {
    return pool?.unlockTime * 1000 < Date.now();
  }, [pool]);

  return (
    <LockDropItem
      pool={pool}
      footer={
        <>
          <StyledActions>
            {lockStarted ? (
              <LockDropButtonWithdraw
                poolId={pool?.index}
                balance={pool?.depositedValue}
                tokenAddress={pool?.token}
              />
            ) : (
              <StyleLockedContainer>
                <StyleImageLocked src={icLock} />
                <StyleLockText>Locked for withdraw</StyleLockText>
              </StyleLockedContainer>
            )}
          </StyledActions>
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
