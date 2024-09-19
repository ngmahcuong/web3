import { Currency } from '@uniswap/sdk-core';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { calcPrice } from '../../../utils/liquidity';
import { PoolPositionCard } from './PoolPositionCard';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { screenUp } from '../../../../../utils/styles';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import { ExplorerLink } from '../../../../../components/ExplorerLink';
import { PriceChange } from './PriceChange';
import { usePoolsData } from '../../../../../state/analytic/hooks';
import { formatNumber } from '../../../../../utils/numbers';
import { PoolChart } from './PoolChart';
import { TokenThreshold } from '../../../../../utils/constants';

export type PoolInfoProps = {
  currencyA: Currency;
  currencyB: Currency;
  reserveA: BigNumber;
  reserveB: BigNumber;
  liquidityToken: string;
};

export const PoolInfo: React.FC<PoolInfoProps> = ({
  currencyA,
  currencyB,
  reserveA,
  reserveB,
  liquidityToken,
}) => {
  const priceInputPerOutput = calcPrice(
    reserveA,
    reserveB,
    currencyA?.decimals,
    currencyB?.decimals,
  );
  const priceOutputPerInput = calcPrice(
    reserveB,
    reserveA,
    currencyB?.decimals,
    currencyA?.decimals,
  );

  const [{ data: pools }] = usePoolsData();
  const pool = useMemo(() => {
    return pools?.find((p) => p.id === liquidityToken?.toLocaleLowerCase());
  }, [liquidityToken, pools]);

  return (
    <>
      <StyledPoolHeader>
        <StyledPoolTokens>
          <div className="icon">
            <DexTokenSymbol address={currencyA?.wrapped.address} size={36} />
            <DexTokenSymbol address={currencyB?.wrapped.address} size={36} />
          </div>
          <div className="name">
            {currencyA?.symbol}/{currencyB?.symbol}
          </div>
          <StyledExplorerLink>
            <ExplorerLink type="token" address={liquidityToken}>
              <i className="far fa-external-link"></i>
            </ExplorerLink>
          </StyledExplorerLink>
        </StyledPoolTokens>
        <StyledFlexResponsive>
          <StyledTokenPrice>
            <DexTokenSymbol address={currencyA?.wrapped.address} size={20} />
            <span>
              1 {currencyA?.symbol} = &nbsp;
              <BigNumberValue value={priceOutputPerInput} decimals={6} fractionDigits={6} />
              &nbsp;{currencyB?.symbol}
            </span>
          </StyledTokenPrice>
          <StyledTokenPrice>
            <DexTokenSymbol address={currencyB?.wrapped.address} size={20} />
            <span>
              1 {currencyB?.symbol} = &nbsp;
              <BigNumberValue value={priceInputPerOutput} decimals={6} fractionDigits={6} />
              &nbsp;{currencyA?.symbol}
            </span>
          </StyledTokenPrice>
        </StyledFlexResponsive>
      </StyledPoolHeader>
      <PoolChart poolId={liquidityToken} />
      <StyledPoolFooter>
        <PoolPositionCard
          currencyA={currencyA}
          currencyB={currencyB}
          reserveA={reserveA}
          reserveB={reserveB}
        />
        <StyledGraphInfo>
          <StyledGraphItem>
            <div className="label">Liquidity</div>
            <div className="value">
              {formatNumber(pool?.liquidityUSD, { compact: false, currency: 'USD' })}
              <span className="price-change">
                <PriceChange value={pool?.liquidityUSDChange} />
              </span>
            </div>
          </StyledGraphItem>
          <StyledGraphItem>
            <div className="label">Trading Volume (24H) </div>
            <div className="value">
              {formatNumber(pool?.volumeUSD, {
                compact: false,
                currency: 'USD',
                threshold: TokenThreshold.DEFAULT,
              })}
              <span className="price-change">
                <PriceChange value={pool?.volumeUSDChange} />
              </span>
            </div>
          </StyledGraphItem>
          <StyledGraphItem>
            <div className="label">Trading Fees (24H)</div>
            <div className="value">
              {formatNumber(pool?.fee24h, {
                compact: false,
                currency: 'USD',
                threshold: TokenThreshold.DEFAULT,
              })}
            </div>
          </StyledGraphItem>
        </StyledGraphInfo>
      </StyledPoolFooter>
    </>
  );
};

const StyledFlex = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFlexResponsive = styled.div`
  display: flex;
  flex-direction: column;
  align-items: unset;
  ${screenUp('lg')`
    flex-direction: row;
    align-items: center;
  `}
`;

const StyledPoolHeader = styled(StyledFlexResponsive)`
  justify-content: space-between;
  display: none;
  padding-bottom: 16px;
  ${screenUp('lg')`
    display: flex;
  `}
`;

const StyledPoolTokens = styled(StyledFlex)`
  margin-top: 16px;
  .icon {
    display: flex;
    img {
      z-index: 1;
      &:last-child {
        margin-left: -4px;
        z-index: 0;
      }
    }
  }
  .name {
    margin-left: 9px;
    font-weight: 500;
    font-size: 20px;
  }
  ${screenUp('lg')`
    margin-top: 0;
  `}
`;

const StyledTokenPrice = styled(StyledFlex)`
  padding: 6px 10px;
  border: solid 1px ${({ theme }) => theme.box.border};
  margin-left: 0;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray3};
  margin-top: 10px;
  img {
    margin-right: 4px;
  }
  ${screenUp('lg')`
   justify-content: flex-start;
   margin-left: 12px;
   margin-top: 0;
  `}
`;

const StyledPoolFooter = styled.div`
  margin-top: 20px;
  ${screenUp('lg')`
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: 17px;
    grid-auto-columns: 1fr 1fr;
  `}
`;

const StyledGraphInfo = styled.div`
  padding: 12px 10px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  display: grid;
  grid-gap: 16px;
  align-items: center;
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledGraphItem = styled(StyledFlex)`
  justify-content: space-between;
  height: max-content;
  .value {
    font-weight: 600;
    text-align: right;
    display: flex;
    align-items: center;
  }
  .price-change {
    margin-left: 4px;
    font-size: 12px;
    padding-top: 2px;
  }
`;

export const StyledExplorerLink = styled.div`
  a {
    color: ${({ theme }) => theme.success};
    :hover {
      color: ${({ theme }) => theme.text.primary};
    }
  }
  i {
    margin-left: 8px;
  }
`;
