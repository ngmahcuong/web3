import { Zero } from '@ethersproject/constants';
import React, { useMemo } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import FormatNumber from '../../../../../components/FormatNumber';
import { PercentageThreshold } from '../../../../../utils/constants';
import { ColorVariant, screenUp } from '../../../../../utils/styles';
import imgNetBalance from '../../../../../assets/icons/lending-net-balance.svg';
import imgNetApy from '../../../../../assets/icons/lending-net-apy.svg';
import imgHealthFactor from '../../../../../assets/icons/lending-health-factor.svg';
import imgMarketSize from '../../../../../assets/icons/lending-market-size.svg';
import imgTotalSupply from '../../../../../assets/icons/lending-total-supply.svg';
import imgTotalBorrow from '../../../../../assets/icons/lending-total-borrow.svg';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { getStableCoinSymbol } from '../../../../../config';
import { useWeb3React } from '@web3-react/core';
import { useLendingUserInfoBalance } from '../../../hooks/useUserLendingHook';
import { useAllMarkets } from '../../../hooks/useLendingMarkets';
import PageHeaderContainer, {
  PageHeaderMetaInfo,
  StyledHeaderNavSwitch,
  StyledSwitchItem,
} from '../../../../../components/PageHeaderContainer';

const Info: React.FC = () => {
  const location = useLocation();
  const { chainId } = useWeb3React();
  const { account } = useUserWallet();
  const markets = useAllMarkets();
  const stablecoin = getStableCoinSymbol(chainId);
  const {
    totalSupply,
    borrowBalance,
    netApy,
    accountHealth,
    loading: loadingUserLending,
  } = useLendingUserInfoBalance();

  const isHide = useMemo(() => {
    return location.pathname.includes('/lending/market/');
  }, [location.pathname]);

  const loading = useMemo(() => {
    return loadingUserLending || !markets.length;
  }, [loadingUserLending, markets]);

  const marketFilters = useMemo(() => {
    return markets.filter((m) => !m.disableBorrow);
  }, [markets]);

  const totalMarketSupply = useMemo(() => {
    return markets?.reduce((current, next) => {
      return next?.asset === stablecoin ? current : current.add(next?.totalSupplyValue);
    }, Zero);
  }, [markets, stablecoin]);

  const totalMarketBorrow = useMemo(() => {
    return marketFilters?.reduce((current, next) => {
      return current.add(next?.totalBorrowValue);
    }, Zero);
  }, [marketFilters]);

  const totalMarketSize = useMemo(() => {
    return totalMarketSupply.add(totalMarketBorrow);
  }, [totalMarketBorrow, totalMarketSupply]);

  const netBalance = useMemo(() => {
    return totalSupply?.sub(borrowBalance) || Zero;
  }, [borrowBalance, totalSupply]);

  return (
    <PageHeaderContainer hidden={isHide}>
      <Switch>
        <Route exact path={'/lending'}>
          <StyledInfoTitle>Dashboard</StyledInfoTitle>
        </Route>
        <Route path={`/lending/markets`}>
          <StyledInfoTitle>Markets</StyledInfoTitle>
        </Route>
      </Switch>

      <CustomStyledHeaderNavSwitch>
        <StyledSwitchItem to="/lending" exact>
          Dashboard
        </StyledSwitchItem>
        <StyledSwitchItem to="/lending/markets">Markets</StyledSwitchItem>
      </CustomStyledHeaderNavSwitch>

      <Switch>
        <Route exact path={'/lending'}>
          <StyledUserInfo>
            <PageHeaderMetaInfo>
              <img src={imgNetBalance} alt="net-balance" className="net-balance" />
              <div className="info">
                <div className="title">Net Balance</div>
                <span className="value">
                  <StyledValue variant={'white'}>
                    {account ? (
                      <>
                        {!loading ? (
                          <BigNumberValue
                            value={netBalance}
                            decimals={18}
                            fractionDigits={2}
                            currency="USD"
                          />
                        ) : (
                          <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </StyledValue>
                </span>
              </div>
            </PageHeaderMetaInfo>
            <PageHeaderMetaInfo>
              <img src={imgNetApy} alt="net-apy" />
              <div className="info">
                <div className="title">Net APY</div>
                <span className="value">
                  <StyledValue variant={netApy < 0 ? 'warning' : 'white'}>
                    {account ? (
                      <>
                        {!loading ? (
                          <>
                            <FormatNumber
                              value={Math.abs(netApy)}
                              percentage
                              fractionDigits={2}
                              negative={netApy < 0}
                              threshold={PercentageThreshold}
                            />
                          </>
                        ) : (
                          <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </StyledValue>
                </span>
              </div>
            </PageHeaderMetaInfo>
            <PageHeaderMetaInfo>
              <img src={imgHealthFactor} alt="net-balance" />
              <div className="info">
                <div className="title">Health Factor</div>
                {account ? (
                  <>
                    {!loading ? (
                      <span className="value">
                        <StyledValue
                          variant={
                            accountHealth < 1.1
                              ? 'danger'
                              : accountHealth < 1.5
                              ? 'warning'
                              : 'white'
                          }
                        >
                          {accountHealth?.toFixed(2)}
                        </StyledValue>
                      </span>
                    ) : (
                      <StyledValue variant="white">
                        <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
                      </StyledValue>
                    )}
                  </>
                ) : (
                  <StyledValue variant="white">-</StyledValue>
                )}
              </div>
            </PageHeaderMetaInfo>
          </StyledUserInfo>
        </Route>

        <Route path={`/lending/markets`}>
          <StyledUserInfo>
            <PageHeaderMetaInfo>
              <img src={imgMarketSize} className="market-size" alt="net-balance" />
              <div className="info">
                <div className="title"> Total Market Size</div>
                <span className="value">
                  <StyledValue variant="white">
                    <BigNumberValue
                      value={totalMarketSize}
                      decimals={18}
                      fractionDigits={0}
                      currency="USD"
                    />
                  </StyledValue>
                </span>
              </div>
            </PageHeaderMetaInfo>
            <PageHeaderMetaInfo>
              <img src={imgTotalSupply} alt="net-apy" />
              <div className="info">
                <div className="title"> Total Supply</div>
                <span className="value">
                  <StyledValue variant="white">
                    <BigNumberValue
                      value={totalMarketSupply}
                      decimals={18}
                      fractionDigits={0}
                      currency="USD"
                    />
                  </StyledValue>
                </span>
              </div>
            </PageHeaderMetaInfo>
            <PageHeaderMetaInfo>
              <img src={imgTotalBorrow} alt="net-balance" />
              <div className="info">
                <div className="title">Total Borrows</div>
                <span className="value">
                  <StyledValue variant="white">
                    <BigNumberValue
                      value={totalMarketBorrow}
                      decimals={18}
                      fractionDigits={0}
                      currency="USD"
                    />
                  </StyledValue>
                </span>
              </div>
            </PageHeaderMetaInfo>
          </StyledUserInfo>
        </Route>
      </Switch>
    </PageHeaderContainer>
  );
};

const CustomStyledHeaderNavSwitch = styled(StyledHeaderNavSwitch)`
  display: none;
  ${screenUp('lg')`
    display: flex;
  `}
`;

const StyledInfoTitle = styled.div`
  display: inline;
  font-size: 20px;
  font-weight: 500;
  margin-top: 1rem;
  color: ${({ theme }) => theme.white};
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledUserInfo = styled.div`
  display: flex;
  gap: 14px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 0.6rem 0;
  ${screenUp('lg')`
    margin: 0;
    flex-direction: row;
    width: fit-content;
    gap: 70px;
  `}
`;

const StyledValue = styled.div<{ variant?: ColorVariant }>`
  i {
    font-size: 14px;
  }
  color: ${(p) =>
    p.variant ? (p.variant === 'warning' ? '#d1b91b' : p.theme[p.variant]) : p.theme.black};
`;

export default Info;
