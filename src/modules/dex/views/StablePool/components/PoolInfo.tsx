import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PriceChange } from './PriceChange';
import { PoolChart } from './PoolChart';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { screenUp } from '../../../../../utils/styles';
import { ExplorerLink } from '../../../../../components/ExplorerLink';
import { usePoolsData } from '../../../../../state/analytic/hooks';
import { formatNumber } from '../../../../../utils/numbers';
import { StablePool } from '../../../../stablepool/models/StablePool';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useAssetsInfo } from '../hook/useAssetsInfo';
import { useTokenBalance } from '../../../../../state/user/hooks';

export type PoolInfoProps = {
  tokenInfo: any;
  poolInfo: StablePool;
  symbols: string[];
  liquidityToken: string;
};

export const PoolInfo: React.FC<PoolInfoProps> = ({
  tokenInfo,
  poolInfo,
  symbols,
  liquidityToken,
}) => {
  const [{ data: pools }] = usePoolsData();
  const pool = useMemo(() => {
    return pools?.find(
      (p) => p?.lpToken?.toLocaleLowerCase() === liquidityToken?.toLocaleLowerCase(),
    );
  }, [liquidityToken, pools]);
  const chTokens = useAssetsInfo(symbols);
  const lpBalance = useTokenBalance(liquidityToken);
  return (
    <>
      <StyledPoolHeader>
        <StyledPoolTokens>
          <div className="icon">
            {symbols?.map((item, index) => (
              <TokenSymbol symbol={item} size={36} key={index} />
            ))}
          </div>
          <div className="right">
            <div className="token">
              <div className="name">{chTokens?.map((t) => t.name)?.join('/')}</div>
              <StyledExplorerLink>
                <ExplorerLink type="token" address={liquidityToken}>
                  <i className="far fa-external-link"></i>
                </ExplorerLink>
              </StyledExplorerLink>
            </div>
            <span className="label">STABLE</span>
          </div>
        </StyledPoolTokens>
      </StyledPoolHeader>
      <PoolChart poolId={poolInfo.id} />
      <StyledPoolFooter>
        <StyledPoolAllocation>
          <div>Pool Allocation</div>
          {symbols?.map((item, index) => (
            <StyledTokenInPool key={index}>
              <TokenSymbol symbol={item} size={36} />
              <span>{chTokens[index]?.name}</span>
              <StyledValue>
                <BigNumberValue
                  value={poolInfo?.reserves[index]}
                  decimals={8}
                  fractionDigits={6}
                />
              </StyledValue>
            </StyledTokenInPool>
          ))}
          <StyledSeparate />
          <StyledTokenInPool>
            Total Liquidity
            <StyledValue>
              <BigNumberValue value={poolInfo?.totalSupply} decimals={18} fractionDigits={4} />
            </StyledValue>
          </StyledTokenInPool>
          <StyledTokenInPool>
            My Liquidity
            <StyledLiquidity>
              <BigNumberValue value={lpBalance} decimals={18} fractionDigits={4} />
            </StyledLiquidity>
          </StyledTokenInPool>
        </StyledPoolAllocation>
        <div>
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
              <div className="label">Volume (24H) </div>
              <div className="value">
                {formatNumber(pool?.volumeUSD, { compact: false, currency: 'USD' })}
                <span className="price-change">
                  <PriceChange value={pool?.volumeUSDChange} />
                </span>
              </div>
            </StyledGraphItem>
            <StyledGraphItem>
              <div className="label">Trading Fees (24H)</div>
              <div className="value">
                {formatNumber(pool?.fee24h, { compact: false, currency: 'USD' })}
              </div>
            </StyledGraphItem>
          </StyledGraphInfo>
          <StyledGraphInfo>
            <StyledGraphItem>
              <div className="label">Virtual Price</div>
              <div className="value">
                <BigNumberValue
                  value={poolInfo?.virtualPrice}
                  decimals={18}
                  fractionDigits={6}
                />
              </div>
            </StyledGraphItem>
            <StyledGraphItem>
              <div className="label">Swap Fee</div>
              <div className="value">
                <BigNumberValue value={poolInfo?.fee} decimals={10} fractionDigits={4} />%
              </div>
            </StyledGraphItem>
          </StyledGraphInfo>
        </div>
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
  margin: 16px 0;
  display: none;
  ${screenUp('lg')`
    display: flex
  `}
`;

const StyledPoolTokens = styled(StyledFlex)`
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
  .right {
    margin-left: 9px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .label {
      font-weight: normal;
      font-size: 14px;
      color: ${({ theme }) => theme.badge.color};
      padding: 0 7px;
      background-color: ${({ theme }) => theme.badge.background};
      border-radius: 5px;
      line-height: 1.5;
      margin-top: 3px;
    }
  }
  .token {
    display: flex;
    align-items: center;
  }
  .name {
    font-weight: 500;
    font-size: 20px;
  }
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

const StyledPoolAllocation = styled.div`
  padding: 12px 10px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  display: grid;
  grid-gap: 16px;
  align-items: center;
  height: fit-content;
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledTokenInPool = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 8px;
  }
`;
const StyledGraphInfo = styled.div`
  padding: 12px 10px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  display: grid;
  grid-gap: 16px;
  align-items: center;
  height: fit-content;
  margin-bottom: 20px;
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledSeparate = styled.div`
  border-top: 1px solid ${({ theme }) => theme.box.border};
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
      color: ${({ theme }) => theme.black};
    }
  }
  i {
    margin-left: 5px;
    font-size: 14px;
  }
`;

const StyledValue = styled.div`
  margin-left: auto;
`;

const StyledLiquidity = styled(StyledValue)`
  color: ${({ theme }) => theme.text.highlight};
`;
