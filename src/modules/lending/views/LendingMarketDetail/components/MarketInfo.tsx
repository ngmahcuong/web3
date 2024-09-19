import { useWeb3React } from '@web3-react/core';
import { parseUnits } from 'ethers/lib/utils';
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { getLendingRewardSymbol, getStableCoinSymbol } from '../../../../../config';
import { BlocksPerDay, MarketDecimal, TokenThreshold } from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import { useMarket } from '../../../hooks/useLendingMarkets';

const MarketInfo: React.FC = () => {
  const { asset } = useParams<{ asset: string }>();
  const market = useMarket(asset?.toUpperCase());
  const { chainId } = useWeb3React();
  const rewardSymbol = getLendingRewardSymbol(chainId);
  const stablecoinSymbol = getStableCoinSymbol(chainId);

  return (
    <StyledContainer>
      <StyledItem>
        Asset price:
        <span>
          <BigNumberValue
            value={market?.underlyingPrice}
            decimals={36 - market?.assetDecimals}
            currency="USD"
          />
        </span>
      </StyledItem>
      <StyledItem>
        Loan to value:
        <span>
          <BigNumberValue
            value={market?.collateralFactor}
            decimals={18}
            fractionDigits={2}
            percentage
          />
        </span>
      </StyledItem>
      <StyledItem>
        Reserve factor:
        <span>
          {market?.disableBorrow ? (
            'N/A'
          ) : (
            <BigNumberValue
              value={market?.reserveFactor}
              decimals={18}
              percentage
              fractionDigits={2}
            />
          )}
        </span>
      </StyledItem>
      <StyledItem>
        ch{market?.asset} minted:
        <span>
          <BigNumberValue
            value={market?.totalSupply}
            decimals={MarketDecimal}
            fractionDigits={market?.significantDigits}
            compact={market?.asset === stablecoinSymbol}
          />
        </span>
      </StyledItem>
      <StyledItem>
        Liquidation threshold:
        <span>
          <BigNumberValue
            value={market?.liquidationThreshold}
            decimals={18}
            fractionDigits={2}
            percentage
          />
        </span>
      </StyledItem>
      <StyledItem>
        Reserves:
        <span>
          <BigNumberValue
            value={market?.totalReserves}
            decimals={market?.assetDecimals}
            fractionDigits={market?.significantDigits}
          />
          &nbsp;
          {market?.asset}
        </span>
      </StyledItem>
      <StyledItem>
        Rate:
        <span>
          1 ch{market?.asset} =&nbsp;
          <BigNumberValue
            value={market?.exchangeRate}
            decimals={18 - MarketDecimal + market?.assetDecimals}
            fractionDigits={market?.significantDigits || 2}
            threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
          />
          &nbsp;
          {market?.asset}
        </span>
      </StyledItem>
      <StyledItem>
        Liquidation incentive:
        <span>
          <BigNumberValue
            value={market?.liquidationIncentive.sub(parseUnits('100', 16))}
            decimals={18}
            fractionDigits={2}
            percentage
          />
        </span>
      </StyledItem>
      <StyledItem>
        Reward per day:
        <span>
          <BigNumberValue
            value={
              market?.disableBorrow
                ? market?.compSpeed?.mul(BlocksPerDay)
                : market?.compSpeed?.mul(BlocksPerDay).mul(2)
            }
            decimals={18}
            fractionDigits={0}
          />
          &nbsp;{rewardSymbol}
        </span>
      </StyledItem>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  padding: 15px 12px 5px 12px;
  background-color: ${(p) => p.theme.box.background};
  border: 1px solid ${(p) => p.theme.box.border};
  ${screenUp('lg')`
    grid-template-columns: repeat(3, 1fr);
    margin-top: 25px;
    margin-bottom: 0px;
    padding: 16px 20px 5px 20px;
  `}
`;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  font-size: 13px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  span {
    margin-left: auto;
    color: ${({ theme }) => theme.text.primary};
  }
  ${screenUp('lg')`
    padding-bottom: 15px;
    font-size: 13px;
    span {
      margin-left: 5px;
    }
    font-size: 14px;
  `}
`;

export default MarketInfo;
