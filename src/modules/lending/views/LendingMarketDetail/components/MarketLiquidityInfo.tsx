import { Zero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import FormatNumber from '../../../../../components/FormatNumber';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useMatchMedia } from '../../../../../hooks/useMatchMedia';
import {
  CurrencyThreshold,
  PercentageThreshold,
  TokenThreshold,
} from '../../../../../utils/constants';
import useInterestRateModelData from '../hooks/useInterestRateModelData';
import imgDisable from '../../../../../assets/images/lending-disable-supply.png';
import { useWeb3React } from '@web3-react/core';
import { colorVariant, ColorVariant, screenUp } from '../../../../../utils/styles';
import { getStableCoinSymbol } from '../../../../../config';
import { useMarket } from '../../../hooks/useLendingMarkets';

const MarketLiquidityInfo: React.FC = () => {
  const { chainId } = useWeb3React();
  const { asset } = useParams<{ asset: string }>();
  const market = useMarket(asset?.toUpperCase());
  const utilizationApyStats = useInterestRateModelData(asset?.toUpperCase());
  const lendingStablecoinSymbol = getStableCoinSymbol(chainId);
  const theme = useTheme();

  const netSupplyRate = useMemo(() => {
    if (
      market?.supplyDistributionApy === undefined ||
      market?.supplyRatePerYear === undefined
    ) {
      return 0;
    }
    return market?.supplyDistributionApy + +formatUnits(market?.supplyRatePerYear, 18);
  }, [market?.supplyDistributionApy, market?.supplyRatePerYear]);

  const netBorrowRate = useMemo(() => {
    if (
      market?.borrowDistributionApy === undefined ||
      market?.borrowRatePerYear === undefined
    ) {
      return 0;
    }
    return market?.borrowDistributionApy - +formatUnits(market?.borrowRatePerYear, 18) || 0;
  }, [market?.borrowDistributionApy, market?.borrowRatePerYear]);

  const utilizationRate = useMemo(() => {
    return utilizationApyStats.find((i) => i.current);
  }, [utilizationApyStats]);

  const isSmallScreen = useMatchMedia('(max-width: 768px)');

  const apyRatio = useMemo(() => {
    if (
      !market?.totalBorrows ||
      !market?.totalUnderlyingSupply ||
      market?.totalUnderlyingSupply.eq(Zero)
    ) {
      return 0;
    }
    return +formatUnits(market.totalBorrows.mul(1e4).div(market.totalUnderlyingSupply), 2);
  }, [market]);

  const radius = useMemo(() => {
    return isSmallScreen ? 55 : 65;
  }, [isSmallScreen]);

  const stroke = useMemo(() => {
    return isSmallScreen ? 9 : 10;
  }, [isSmallScreen]);

  const progress = useMemo(() => {
    if (!apyRatio) {
      return 0;
    }
    return apyRatio;
  }, [apyRatio]);

  const normalizedRadius = radius - stroke * 2;

  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset = useMemo(() => {
    return circumference - (progress / 100) * circumference;
  }, [circumference, progress]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledHeaderInfo>
          Available Liquidity:
          <span>
            {market?.disableSupply && market?.asset !== lendingStablecoinSymbol ? (
              'N/A'
            ) : (
              <>
                <BigNumberValue
                  value={market?.cash}
                  fractionDigits={market?.significantDigits}
                  decimals={market?.assetDecimals}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                  compact={market?.asset === lendingStablecoinSymbol}
                />
                &nbsp;{market?.asset}
              </>
            )}
          </span>
        </StyledHeaderInfo>
        {!market?.disableSupply && !market?.disableBorrow ? (
          <StyledHeaderInfo>
            Utilization rate:
            <span>{utilizationRate ? utilizationRate.util : '-'}%</span>
          </StyledHeaderInfo>
        ) : null}
      </StyledHeader>
      <StyledDashboard>
        <StyledLiquidity>
          <StyledTitle align="right">
            {market?.asset !== lendingStablecoinSymbol ? 'Total Supplied' : 'Max cap'}
          </StyledTitle>
          <SuppliedStyledValue align="right">
            {market?.disableSupply && market?.asset !== lendingStablecoinSymbol ? (
              'N/A'
            ) : (
              <>
                <BigNumberValue
                  value={market?.totalUnderlyingSupply}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                  compact={market?.asset === lendingStablecoinSymbol}
                />
              </>
            )}
          </SuppliedStyledValue>
          <StyledSubValue align="right">
            {market?.disableSupply && market?.asset !== lendingStablecoinSymbol ? (
              'N/A'
            ) : (
              <BigNumberValue
                fractionDigits={0}
                value={market?.totalSupplyValue}
                decimals={18}
                currency="USD"
                threshold={CurrencyThreshold}
                compact={market?.asset === lendingStablecoinSymbol}
              />
            )}
          </StyledSubValue>
        </StyledLiquidity>
        <StyledProgressContainer>
          <TokenSymbol symbol={market?.asset} size={60} />
          <StyledCircleProgress
            height={radius * 2}
            width={radius * 2}
            preserveAspectRatio="none"
          >
            <circle
              stroke={theme.success}
              fill="none"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={theme.warning}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              x={90}
              y={0}
              className="progress"
            />
          </StyledCircleProgress>
        </StyledProgressContainer>
        <StyledBorrowed>
          <StyledTitle>Total Borrowed</StyledTitle>
          <BorrowedStyledValue>
            {market?.disableBorrow ? (
              'N/A'
            ) : (
              <BigNumberValue
                value={market?.totalBorrows}
                decimals={market?.assetDecimals}
                fractionDigits={market?.significantDigits}
                threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
              />
            )}
          </BorrowedStyledValue>
          <StyledSubValue>
            {market?.disableBorrow ? (
              'N/A'
            ) : (
              <BigNumberValue
                value={market?.totalBorrowValue}
                decimals={18}
                fractionDigits={0}
                currency="USD"
                threshold={CurrencyThreshold}
              />
            )}
          </StyledSubValue>
        </StyledBorrowed>
      </StyledDashboard>
      <StyledApyContainer>
        <StyledApyItem>
          <div className="header">Supply</div>
          {market?.disableSupply ? (
            <StyledNoData>
              <img src={imgDisable} alt="disabled" />
              <span>Supply is not available for this market</span>
            </StyledNoData>
          ) : (
            <div className="info">
              <StyledApy variant={market?.supplyRatePerYear ? 'success' : undefined}>
                Supply APY
                <span>
                  <BigNumberValue
                    value={market?.supplyRatePerYear}
                    decimals={18}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </span>
              </StyledApy>
              <StyledApy variant={market?.supplyDistributionApy ? 'success' : undefined}>
                Reward APY
                <span>
                  <FormatNumber
                    value={market?.supplyDistributionApy || 0}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </span>
              </StyledApy>
              <StyledLine />
              <StyledApy variant={netSupplyRate >= 0 ? 'success' : undefined}>
                Net Rate
                <span>
                  <FormatNumber
                    value={Math.abs(netSupplyRate)}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </span>
              </StyledApy>
            </div>
          )}
        </StyledApyItem>
        <div className="space" />
        <StyledApyItem isBorrow>
          <div className="header">Borrow</div>
          {market?.disableBorrow ? (
            <StyledNoData>
              <img src={imgDisable} alt="disabled" />
              <span>Borrow is not available for this market</span>
            </StyledNoData>
          ) : (
            <div className="info">
              <StyledApy variant={market?.borrowRatePerYear ? 'warning' : undefined}>
                Borrow APY
                <span>
                  <BigNumberValue
                    value={market?.borrowRatePerYear}
                    decimals={18}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </span>
              </StyledApy>
              <StyledApy variant={market?.borrowDistributionApy ? 'warning' : undefined}>
                Reward APY
                <span>
                  <FormatNumber
                    value={market?.borrowDistributionApy || 0}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </span>
              </StyledApy>
              <StyledLine />
              <StyledApy variant={Math.abs(netBorrowRate) ? 'warning' : undefined}>
                Net Rate
                <span>
                  <FormatNumber
                    value={Math.abs(netBorrowRate)}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </span>
              </StyledApy>
            </div>
          )}
        </StyledApyItem>
      </StyledApyContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 15px 12px 12px 12px;
  background-color: ${(p) => p.theme.box.background};
  border: 1px solid ${(p) => p.theme.box.border};
  ${screenUp('lg')`
    width: auto;
    padding: 16px 20px 20px 20px;
  `}
`;

const StyledNoData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 20px 10px 20px;
  img {
    width: 55px;
  }
  span {
    padding-top: 8px;
    font-size: 14px;
    font-weight: normal;
    text-align: center;
    color: ${(p) => p.theme.muted};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px dashed ${(p) => p.theme.box.border4};
`;

const StyledHeaderInfo = styled.div`
  font-size: 14px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  span {
    margin-left: 5px;
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.text.primary};
  }
  ${screenUp('lg')`
    span {
      font-size: 16px;
    }
  `}
`;

const StyledDashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr 130px 1fr;
  padding: 25px 0 10px;
  ${screenUp('lg')`
    grid-template-columns: 1fr 166px 1fr;
  `}
`;

const StyledLiquidity = styled.div``;

const StyledProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledCircleProgress = styled.svg`
  position: absolute;
  border-radius: 100%;
  circle {
    transition: all 0.5s;
  }
  .progress {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
`;

const StyledBorrowed = styled.div``;

const StyledTitle = styled.div<{ align?: string }>`
  font-size: 14px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  text-align: ${({ align }) => align || 'left'};
  span {
    display: none;
  }
  ${screenUp('lg')`
    font-size: 16px;
    span {
      display: inline;
    }
  `}
`;

const StyledValue = styled.div<{ align?: string }>`
  padding-top: 10px;
  font-size: 18px;
  font-weight: bold;
  text-align: ${({ align }) => align || 'left'};
  ${screenUp('lg')`
    font-size: 20px;
  `}
`;

const SuppliedStyledValue = styled(StyledValue)`
  color: ${({ theme }) => theme.success};
`;

const BorrowedStyledValue = styled(StyledValue)`
  color: ${({ theme }) => theme.warning};
`;

const StyledSubValue = styled.div<{ align?: string }>`
  padding-top: 6px;
  font-size: 13px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  text-align: ${({ align }) => align || 'left'};
`;

const StyledApyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  .space {
    width: 30px;
  }
`;

const StyledApyItem = styled.div<{ isBorrow?: boolean }>`
  width: 280px;
  border: 2px solid ${({ isBorrow, theme }) => (isBorrow ? theme.warning : theme.success)};
  .header {
    padding: 4px 16px;
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.white};
    background-color: ${({ isBorrow, theme }) => (isBorrow ? theme.warning : theme.success)};
  }
  .info {
    padding: 10px;
  }
  ${screenUp('lg')`
    .info {
      padding: 15px;
    }
  `}
`;

const StyledLine = styled.div<{
  variant?: ColorVariant;
}>`
  border-bottom: 1px dashed ${(p) => (p.variant ? p.theme[p.variant] : p.theme.box.border)};
  margin: 2px 0px 10px 0px;
`;

const StyledApy = styled.div<{
  variant?: ColorVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  span {
    margin-left: auto;
    font-size: 14px;
    font-weight: 500;
    ${({ variant }) => variant && colorVariant};
  }
  :not(:last-child) {
    padding-bottom: 8px;
  }
  ${screenUp('lg')`
    font-size: 14px;
    span {
      font-size: 16px;
    }
  `}
`;

export default MarketLiquidityInfo;
