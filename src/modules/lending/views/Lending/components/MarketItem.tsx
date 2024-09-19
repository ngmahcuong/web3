import { Zero } from '@ethersproject/constants';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { ButtonOutline } from '../../../../../components/Buttons';
import {
  StyledColumn,
  StyledValue,
  StyledSubValue,
  StyledAprContainer,
} from '../../../components/MarketItemShared';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { getStableCoinSymbol } from '../../../../../config';
import {
  CurrencyThreshold,
  PercentageThreshold,
  TokenThreshold,
} from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import {
  StyledActions,
  StyledAsset,
  StyledRow,
  StyledRowNoMargin,
  StyledTitle,
} from './MarketRowShare';
import { useMarket } from '../../../hooks/useLendingMarkets';

type MarketItemProps = {
  asset: string;
};

const MarketItem: React.FC<MarketItemProps> = ({ asset }) => {
  const { chainId } = useWeb3React();
  const market = useMarket(asset);
  const stablecoinSymbol = getStableCoinSymbol(chainId);

  return (
    <StyledContainer>
      <StyledLink to={`/lending/market/${market?.asset?.toLowerCase()}`}>
        <StyledContainerWrap>
          <StyledAsset>
            <TokenSymbol symbol={`${market?.asset}`} size={36} />
            <div className="content">
              <StyledValue>{market?.asset}</StyledValue>
              <StyledRowNoMargin>
                <StyledSubValue>{market?.marketName}</StyledSubValue>
              </StyledRowNoMargin>
            </div>
          </StyledAsset>
          <StyledColumn>
            <StyledRow>
              <StyledTitle>Total Supply</StyledTitle>
              <StyledValue>
                <BigNumberValue
                  value={market?.totalUnderlyingSupply}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                  compact={market?.asset === stablecoinSymbol}
                />
                <span>{market?.asset}</span>
              </StyledValue>
            </StyledRow>
            {market?.totalSupplyValue && market.totalSupplyValue.gt(Zero) && (
              <StyledRowNoMargin>
                <StyledTitle></StyledTitle>
                <StyledSubValue>
                  ~
                  <BigNumberValue
                    fractionDigits={0}
                    value={market?.totalSupplyValue}
                    decimals={18}
                    currency="USD"
                    threshold={CurrencyThreshold}
                    compact
                  />
                </StyledSubValue>
              </StyledRowNoMargin>
            )}
          </StyledColumn>
          <StyledColumn>
            <StyledRow>
              <StyledTitle>Supply APY</StyledTitle>
              <StyledValue variant="success">
                <StyledAprContainer>
                  <div>
                    <StyledValue variant="success">
                      <BigNumberValue
                        value={market?.supplyRatePerYear}
                        decimals={18}
                        percentage
                        fractionDigits={2}
                        threshold={PercentageThreshold}
                      />
                    </StyledValue>
                  </div>
                  {/* <StyledValue>
                    <StyledApr>
                      <TokenSymbol symbol={rewardSymbol} size={15} />
                      <FormatNumber
                        value={market?.supplyDistributionApy || 0}
                        percentage
                        fractionDigits={2}
                        threshold={PercentageThreshold}
                      />
                      &nbsp;APY
                    </StyledApr>
                  </StyledValue> */}
                </StyledAprContainer>
              </StyledValue>
            </StyledRow>
          </StyledColumn>
          <StyledColumn>
            <StyledRow>
              <StyledTitle>Total Borrow</StyledTitle>
              <StyledValue>
                {market?.disableBorrow ? (
                  'N/A'
                ) : (
                  <>
                    <BigNumberValue
                      value={market?.totalBorrows}
                      decimals={market?.assetDecimals}
                      fractionDigits={market?.significantDigits}
                      threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                    />
                    <span>{market?.asset}</span>
                  </>
                )}
              </StyledValue>
            </StyledRow>
            {market?.totalBorrowValue && market.totalBorrowValue.gt(Zero) && (
              <StyledRowNoMargin>
                <StyledTitle></StyledTitle>
                <StyledSubValue>
                  {!market?.disableBorrow && (
                    <>
                      ~
                      <BigNumberValue
                        value={market?.totalBorrowValue}
                        decimals={18}
                        fractionDigits={0}
                        currency="USD"
                        threshold={CurrencyThreshold}
                      />
                    </>
                  )}
                </StyledSubValue>
              </StyledRowNoMargin>
            )}
          </StyledColumn>
          <StyledColumn>
            <StyledRow>
              <StyledTitle>Borrow APY</StyledTitle>
              <StyledValue variant="success">
                <StyledAprContainer>
                  <div>
                    <StyledValue variant="warning">
                      <BigNumberValue
                        value={market?.borrowRatePerYear}
                        decimals={18}
                        percentage
                        fractionDigits={2}
                        threshold={PercentageThreshold}
                      />
                    </StyledValue>
                  </div>
                  {/* <StyledValue>
                    <StyledApr>
                      <TokenSymbol symbol={rewardSymbol} size={15} />
                      <FormatNumber
                        value={market?.borrowDistributionApy | 0}
                        percentage
                        fractionDigits={2}
                        threshold={PercentageThreshold}
                      />
                      &nbsp;APY
                    </StyledApr>
                  </StyledValue> */}
                </StyledAprContainer>
              </StyledValue>
            </StyledRow>
          </StyledColumn>
          <StyledActions>
            <ButtonOutline size="sm">Details</ButtonOutline>
          </StyledActions>
        </StyledContainerWrap>
      </StyledLink>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  /* :not(:last-child) {
    border-bottom: 1px solid ${(p) => p.theme.box.border};
  } */
  margin-bottom: 15px;
  ${screenUp('lg')`
    margin-bottom: 0px ;
  `}
`;

const StyledContainerWrap = styled.div`
  padding: 0 0 15px 0;
  background-color: ${({ theme }) => theme.box.itemBackground};
  :not(:last-child) {
    border-bottom: 1px solid ${(p) => p.theme.box.border};
  }
  :hover {
    background-color: ${({ theme }) => theme.box.itemBackgroundHover};
  }
  ${screenUp('lg')`
    padding: 14px 16px;
    display: grid;
    grid-template-columns: 5fr 4fr 4fr 4fr 4fr 80px;
  `}
`;

const StyledLink = styled(NavLink)``;

export default MarketItem;
