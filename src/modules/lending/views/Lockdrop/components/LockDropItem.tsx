import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Timestamp } from '../../../../../components/Timestamp';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { getTokenByAddress } from '../../../../../config';
import { CurrencyThreshold, PercentageThreshold } from '../../../../../utils/constants';
import { LockPoolInfo } from '../../../models/Lockdrop';
import { useLockDropItem } from '../hooks/useLockDropItem';

export type LockDropItemProps = {
  pool: LockPoolInfo;
  footer?: React.ReactNode;
};

export const LockDropItem: React.FC<LockDropItemProps> = ({ pool, footer }) => {
  const { chainId } = useWeb3React();
  const tokenInfo = useMemo(() => {
    return getTokenByAddress(chainId, pool?.token);
  }, [chainId, pool]);

  const { apr, totalValueLock } = useLockDropItem(pool);

  return (
    <StyledLockItemWrapper>
      <StyledLockDropHeader>
        <TokenSymbol symbol={tokenInfo?.symbol} size={40} />
        <div className="info">
          {pool?.durationMonth?.toString()} Month
          <div className="time">
            Start at <Timestamp secs={pool?.lockTime} />
          </div>
        </div>
      </StyledLockDropHeader>
      <StyledLockBody>
        <StyledRow>
          <StyledTitle>Unlock time</StyledTitle>
          <StyledValue>
            <Timestamp secs={pool?.unlockTime} />
          </StyledValue>
        </StyledRow>
        <StyledRow>
          <StyledTitle>Total reward</StyledTitle>
          <StyledValue>
            <BigNumberValue value={pool?.rewards} decimals={18} /> CHAI
          </StyledValue>
        </StyledRow>
        <StyledRow>
          <StyledTitle>Total value lock</StyledTitle>
          <StyledValue>
            <BigNumberValue
              value={totalValueLock}
              decimals={18}
              currency={'USD'}
              threshold={CurrencyThreshold}
            />
          </StyledValue>
        </StyledRow>
        <StyledRow>
          <StyledTitle>APR</StyledTitle>
          <StyledValue>
            <BigNumberValue
              value={apr}
              decimals={18}
              percentage
              threshold={PercentageThreshold}
            />
          </StyledValue>
        </StyledRow>
        <StyledRow>
          <StyledTitle>Deposited</StyledTitle>
          <StyledValue className="highlight">
            {pool?.depositedValue ? (
              <BigNumberValue fractionDigits={6} decimals={8} value={pool?.depositedValue} />
            ) : (
              '-'
            )}{' '}
            {tokenInfo?.name}
          </StyledValue>
        </StyledRow>
        {footer}
      </StyledLockBody>
    </StyledLockItemWrapper>
  );
};

const StyledLockItemWrapper = styled.article`
  position: relative;
  background-color: ${(p) => p.theme.card.body};
  border: 1px solid ${(p) => p.theme.card.border};
  min-height: 275px;
`;

const StyledLockDropHeader = styled.div`
  display: flex;
  padding: 1rem;
  align-items: center;
  background-color: ${({ theme }) => theme.card.header};
  .info {
    font-weight: 500;
    margin-left: 10px;
  }
  .time {
    color: ${(p) => p.theme.text.muted};
    font-size: 14px;
    font-weight: 400;
    margin-top: 2px;
  }
`;

const StyledLockBody = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StyledTitle = styled.div`
  font-size: 14px;
  color: ${(p) => p.theme.text.muted};
`;

const StyledValue = styled.span`
  font-weight: 500;
  &.highlight {
    color: ${(p) => p.theme.text.highlight};
  }
`;
