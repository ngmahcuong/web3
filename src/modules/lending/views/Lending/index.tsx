import React, { useMemo, useState } from 'react';
import { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { container, screenUp } from '../../../../utils/styles';
import { useAllMarketIds } from '../../hooks/useLendingMarkets';
import { useUpdateLendingMarketsState } from '../../hooks/useUpdateLendingMarketsState';
import { useUpdateLendingState } from '../../hooks/useUpdateUserLendingState';
import LendingMarketDetail from '../LendingMarketDetail';
import BorrowMarkets from './components/BorrowMarkets';
import Info from './components/Info';
import Markets from './components/Markets';
import { StyledBoxContentLoader } from './components/MarketsShare';
import SupplyMarkets from './components/SupplyMarkets';

const Lending: React.FC = () => {
  useUpdateLendingState();
  useUpdateLendingMarketsState();
  const marketIds = useAllMarketIds();
  const [isTabSupply, setIsTabSupply] = useState(true);

  const isLoading = useMemo(() => {
    return !marketIds?.length;
  }, [marketIds?.length]);

  const onClickSupplyTab = useCallback(() => {
    setIsTabSupply(true);
  }, []);

  const onClickBorrowTab = useCallback(() => {
    setIsTabSupply(false);
  }, []);

  return (
    <StyledContainer>
      <Info />
      <Switch>
        <Route exact path={'/lending'}>
          <StyledSwitchContainer>
            <StyledSwitch>
              <StyledSwitchItem className={isTabSupply && 'active'} onClick={onClickSupplyTab}>
                Supply
              </StyledSwitchItem>
              <StyledSwitchItem className={!isTabSupply && 'active'} onClick={onClickBorrowTab}>
                Borrow
              </StyledSwitchItem>
            </StyledSwitch>
          </StyledSwitchContainer>
        </Route>
      </Switch>
      <StyledContent>
        <Switch>
          <Route exact path={'/lending'}>
            <>
              {isLoading ? (
                <StyledBoxContentLoader>
                  <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
                </StyledBoxContentLoader>
              ) : (
                <StyledMarkets>
                  <StyledTabContent show={isTabSupply}>
                    <SupplyMarkets />
                  </StyledTabContent>
                  <StyledTabContent show={!isTabSupply}>
                    <BorrowMarkets />
                  </StyledTabContent>
                </StyledMarkets>
              )}
            </>
          </Route>
          <Route path={`/lending/markets`} component={Markets} />
          <Route path="/lending/market/:asset" component={LendingMarketDetail} />
        </Switch>
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const StyledSwitchContainer = styled.div`
  display: block;
  background-color: ${({ theme }) => theme.header.background3};
  padding: 0 15px 12px 15px;
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 2px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.header.background2};
  margin-bottom: 20px;
  position: relative;
  z-index: 0;
  .indicator {
    background: white;
    width: calc(100% / 2);
    height: 38px;
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
    border-radius: 4px;
    transition: transform 150ms ease;
  }
`;

const StyledSwitchItem = styled.button`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 38px;
  background-color: transparent;
  color: ${({ theme }) => theme.gray1};
  font-weight: 500;
  border-radius: 4px;

  ${screenUp('lg')`
     width: 138px;

    `}
  &.active {
    color: ${({ theme }) => theme.button.toggle.color};
    background-color: ${({ theme }) => theme.button.toggle.background};
  }
  :hover {
    &:not(.active) {
      color: ${({ theme }) => theme.white};
    }
  }
  &:nth-child(1) {
    &.active {
      & ~ .indicator {
        transform: translateX(0px);
      }
    }
  }

  &:nth-child(2) {
    &.active {
      & ~ .indicator {
        transform: translateX(100%);
      }
    }
  }
`;

const StyledContent = styled.div`
  ${container};
  padding-top: 16px;
  ${screenUp('lg')`
    padding-top: 32px;
  `}
`;

const StyledMarkets = styled.div`
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 30px;
  `}
`;

const StyledTabContent = styled.div<{ show?: boolean }>`
  display: ${(p) => (p.show ? 'block' : 'none')};
  ${screenUp('lg')`
    display: block;
  `}
`;

export default Lending;
