import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import { useLimitOrderHistory } from '../../../hooks/useLimitOrderHistory';
import { useLimitOrderListOrder } from '../../../hooks/useLimitOrderListOrder';
import { LimitOrderOpenOrderTable } from './LimitOrderOpenOrderTable';
import { LimitOrderOrderHistoryTable } from './LimitOrderOrderHistory';

type LimitOrderMyOrderTab = 'OpenOrder' | 'OrderHistory';

export type LimitOrderMyOrderProps = {};

export const LimitOrderMyOrder: React.FC<LimitOrderMyOrderProps> = () => {
  const [currentTab, setCurrentTab] = useState<LimitOrderMyOrderTab>('OpenOrder');

  const { data: orders, loading, onLoad } = useLimitOrderListOrder();
  const {
    data: orderHistories,
    loading: loadingHistory,
    onLoad: onLoadHistory,
  } = useLimitOrderHistory();

  const onOpenOrderClick = useCallback(() => {
    onLoad?.();
    setCurrentTab('OpenOrder');
  }, [onLoad]);

  const onOrderHistoryClick = useCallback(() => {
    setCurrentTab('OrderHistory');
    onLoadHistory?.();
  }, [onLoadHistory]);

  return (
    <StyledContainer>
      <StyledSwitch>
        <StyledSwitchItem onClick={onOpenOrderClick} active={currentTab === 'OpenOrder'}>
          Open Orders
        </StyledSwitchItem>
        <StyledSwitchItem onClick={onOrderHistoryClick} active={currentTab === 'OrderHistory'}>
          Order History
        </StyledSwitchItem>
      </StyledSwitch>
      {currentTab === 'OpenOrder' ? (
        <LimitOrderOpenOrderTable
          data={orders}
          loading={loading}
          onLoad={() => {
            onLoadHistory?.();
            onLoad?.();
          }}
        />
      ) : currentTab === 'OrderHistory' ? (
        <LimitOrderOrderHistoryTable data={orderHistories} loading={loadingHistory} />
      ) : null}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding-top: 16px;
  ${screenUp('lg')`
      padding-top: 0;
    `}
`;

const StyledSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 48px;
  margin-bottom: -1px;
`;

const StyledSwitchItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  background-color: ${({ theme, active }) =>
    active ? theme.box.background : theme.background};
  color: ${({ theme, active }) => (active ? theme.success : theme.gray3)};
  font-weight: 500;
  border: solid 1px ${({ theme }) => theme.box.border};
  border-bottom: none;
  height: 100%;
  cursor: pointer;
  :hover {
    color: ${({ theme, active }) => (active ? theme.button.primary.hover : theme.success)};
  }
  &:last-child {
    border-left: none;
  }
`;
