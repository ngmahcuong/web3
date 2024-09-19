import { Currency, Token } from '@uniswap/sdk-core';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { getLiquidityValue } from '../utils/liquidity';
import { useHistory } from 'react-router-dom';
import { useTokenBalance } from '../../../state/user/hooks';
import { PercentagePrecision, TokenThreshold } from '../../../utils/constants';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { screenUp } from '../../../utils/styles';
import { Button } from '../../../components/Buttons';
import { DexTokenSymbol } from './DexTokenSymbol';
import { usePoolsData } from '../../../state/analytic/hooks';
import { formatNumber } from '../../../utils/numbers';

export type MinimalPositionCardProps = {
  currencyA: Currency;
  currencyB: Currency;
  lpToken: string;
  liquidityTokenSupply: BigNumber;
  reserveA: BigNumber;
  reserveB: BigNumber;
  showButtons?: boolean;
};

export const MinimalPositionCard: React.FC<MinimalPositionCardProps> = ({
  currencyA,
  currencyB,
  lpToken,
  reserveA,
  reserveB,
  showButtons,
  liquidityTokenSupply,
}) => {
  const history = useHistory();
  const lpBalance = useTokenBalance(lpToken);
  const [{ data: pools }] = usePoolsData();
  const pool = useMemo(() => {
    return pools?.find((p) => p.id === lpToken?.toLocaleLowerCase());
  }, [lpToken, pools]);

  const [token0Deposited, token1Deposited] = useMemo(() => {
    return [
      getLiquidityValue(liquidityTokenSupply, lpBalance, reserveA),
      getLiquidityValue(liquidityTokenSupply, lpBalance, reserveB),
    ];
  }, [reserveA, lpBalance, liquidityTokenSupply, reserveB]);

  const poolTokenPercentage = useMemo(() => {
    if (
      !liquidityTokenSupply ||
      !lpBalance ||
      liquidityTokenSupply?.eq(Zero) ||
      liquidityTokenSupply.lt(lpBalance)
    ) {
      return;
    }
    return lpBalance.mul(PercentagePrecision).div(liquidityTokenSupply);
  }, [lpBalance, liquidityTokenSupply]);

  const onAddLiquidity = useCallback(() => {
    if (currencyA && currencyB) {
      history.push(
        `/pools/add/${currencyA.isNative ? 'ETH' : (currencyA as Token).address}/${
          currencyB.isNative ? 'ETH' : (currencyB as Token).address
        }`,
      );
    }
  }, [history, currencyA, currencyB]);

  const onRemoveLiquidity = useCallback(() => {
    if (currencyA && currencyB) {
      history.push(
        `/pools/remove/${currencyA.isNative ? 'ETH' : (currencyA as Token).address}/${
          currencyB.isNative ? 'ETH' : (currencyB as Token).address
        }`,
      );
    }
  }, [history, currencyA, currencyB]);

  return lpBalance && lpBalance.gt(Zero) ? (
    <StyledBox>
      <StyledHeader>
        <StyledLPInfo>
          <StyledLPSymbol>
            <div className="icon">
              <DexTokenSymbol size={32} address={currencyA?.wrapped.address} />
              <DexTokenSymbol size={32} address={currencyB?.wrapped.address} />
            </div>
            <div className="name">
              {currencyA?.symbol}/{currencyB?.symbol}
            </div>
          </StyledLPSymbol>
        </StyledLPInfo>
      </StyledHeader>
      <StyledBody>
        <div className="label">Pool Allocation</div>
        <StyledAllocation>
          <StyledTokenDeposited>
            <StyledTokenDepositedInfo>
              <DexTokenSymbol size={24} address={currencyA?.wrapped.address} />
              <div className="name">{currencyA?.symbol}</div>
            </StyledTokenDepositedInfo>
            <div className="value">
              <BigNumberValue
                value={token0Deposited}
                decimals={currencyA?.decimals}
                fractionDigits={6}
                keepCommas
              />
            </div>
          </StyledTokenDeposited>
          <StyledTokenDeposited>
            <StyledTokenDepositedInfo>
              <DexTokenSymbol size={24} address={currencyB?.wrapped.address} />
              <div className="name">{currencyB?.symbol}</div>
            </StyledTokenDepositedInfo>
            <div className="value">
              <BigNumberValue
                value={token1Deposited}
                decimals={currencyB?.decimals}
                fractionDigits={6}
                keepCommas
              />
            </div>
          </StyledTokenDeposited>
        </StyledAllocation>
        <StyledPoolShare>
          <div className="label">Pool Share:</div>
          <div className="value">
            <BigNumberValue
              value={poolTokenPercentage}
              decimals={8}
              fractionDigits={2}
              keepCommas
              percentage
            />
          </div>
        </StyledPoolShare>
        <StyledPoolShare>
          <div className="label">Deposited:</div>
          <div className="value">
            <BigNumberValue
              value={lpBalance}
              decimals={18}
              fractionDigits={6}
              keepCommas
              threshold={TokenThreshold.DEFAULT}
            />
          </div>
        </StyledPoolShare>
        <StyledPoolShare>
          <div className="label">APR:</div>
          <div className="value">
            {formatNumber(pool?.apr, {
              compact: false,
              fractionDigits: 2,
              percentage: true,
            })}
          </div>
        </StyledPoolShare>
        {showButtons ? (
          <StyledActionsContainer>
            <StyledButton onClick={onAddLiquidity}>Add Liquidity</StyledButton>
            <StyledButton onClick={onRemoveLiquidity}>Remove Liquidity</StyledButton>
          </StyledActionsContainer>
        ) : null}
      </StyledBody>
    </StyledBox>
  ) : null;
};

const StyledBox = styled.div`
  padding: 12px 10px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  margin: auto;
  margin-top: 0px;
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledHeader = styled.div`
  padding-bottom: 15px;
  .label {
    color: ${({ theme }) => theme.gray4};
    margin-bottom: 15px;
    font-size: 14px;
    ${screenUp('lg')`
      font-size: 16px;
    `}
  }
`;

const StyledBody = styled.div`
  font-size: 14px;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.box.innerBackground};
  .label {
    color: ${({ theme }) => theme.gray3};
  }
`;
const StyledAllocation = styled.div`
  border-bottom: 1px dashed ${({ theme }) => theme.box.border2};
  padding-bottom: 20px;
`;

const StyledTokenDeposited = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  font-size: 16px; ;
`;

const StyledTokenDepositedInfo = styled.div`
  display: flex;
  align-items: center;
  .name {
    margin-left: 7px;
  }
`;

const StyledLPInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .value {
    color: ${({ theme }) => theme.gray3};
    text-align: right;
    font-size: 14px;
    .total-pool {
      padding-top: 2px;
      color: #338931;
    }
  }
`;

const StyledLPSymbol = styled.div`
  display: flex;
  align-items: center;
  .name {
    font-weight: 500;
    margin-left: 6px;
    font-size: 14px;
    ${screenUp('lg')`
      margin-left: 12px;
      font-size: 16px;
    `}
  }
  .icon {
    display: flex;
    img {
      z-index: 1;
      :last-child {
        margin-left: -4px;
        z-index: 0;
      }
    }
  }
`;

const StyledActionsContainer = styled.div`
  border-top: dashed 1px #57575b;
  margin-top: 16px;
  padding-top: 16px;
  display: flex;
  justify-content: space-around;
`;

const StyledButton = styled(Button)`
  width: 40%;
`;

const StyledPoolShare = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .label {
    font-size: 14px;
    color: ${({ theme }) => theme.gray3};
  }
`;
