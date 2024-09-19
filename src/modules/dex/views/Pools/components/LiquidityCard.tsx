import { Zero } from '@ethersproject/constants';
import { useMulticall } from '@reddotlabs/multicall-react';
import { Currency } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ContractInterfaces } from '../../../../../abis';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Button, ButtonOutline } from '../../../../../components/Buttons';
import { getWrappedToken } from '../../../../../config';
import { PercentagePrecision } from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import { useUniswapPair } from '../../../hooks/useUniswapPair';
import { useUniswapToken } from '../../../hooks/useUniswapToken';
import { getLiquidityValue } from '../../../utils/liquidity';

type LiquidityCardPairInfo = {
  lpBalance?: BigNumber;
  currencyA: Currency;
  currencyB: Currency;
  liquidityToken: string;
};

export type LiquidityCardProps = {
  pairInfo: LiquidityCardPairInfo;
};

export const LiquidityCard: React.FC<LiquidityCardProps> = ({ pairInfo }) => {
  const { lpBalance, currencyA, currencyB, liquidityToken } = pairInfo;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const history = useHistory();
  const pair = useUniswapPair(liquidityToken);
  const [token0, token1] = [
    useUniswapToken(currencyA?.wrapped?.address),
    useUniswapToken(currencyB?.wrapped?.address),
  ];
  const [reserveA, setReserveA] = useState<BigNumber | undefined>();
  const [reserveB, setReserveB] = useState<BigNumber | undefined>();
  const [liquidityTokenSupply, setLiquidityTokenSupply] = useState<BigNumber | undefined>();
  const [infoFetched, setInfoFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const multicall = useMulticall();
  const { chainId } = useWeb3React();

  useEffect(() => {
    if (isOpen && !infoFetched) {
      setInfoFetched(true);
    }
  }, [infoFetched, isOpen]);

  useEffect(() => {
    let mounted = true;
    if (isOpen && !infoFetched && mounted && liquidityToken && multicall) {
      setLoading(true);
      multicall([
        {
          target: liquidityToken,
          abi: ContractInterfaces.pairInterface.functions['getReserves()'],
        },
        {
          target: liquidityToken,
          abi: ContractInterfaces.pairInterface.functions['totalSupply()'],
        },
      ])
        .then((data) => {
          const reserves = data[0];
          const lpSupply = data[1][0];
          setReserveA(
            currencyA && currencyB
              ? currencyA.wrapped.sortsBefore(currencyB.wrapped)
                ? reserves[0]
                : reserves[1]
              : undefined,
          );
          setReserveB(
            currencyA && currencyB
              ? currencyA.wrapped.sortsBefore(currencyB.wrapped)
                ? reserves[1]
                : reserves[0]
              : undefined,
          );
          setLiquidityTokenSupply(lpSupply);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [currencyA, currencyB, infoFetched, isOpen, liquidityToken, multicall, pair]);

  const [token0Deposited, token1Deposited] = useMemo(() => {
    return [
      getLiquidityValue(liquidityTokenSupply, lpBalance, reserveA),
      getLiquidityValue(liquidityTokenSupply, lpBalance, reserveB),
    ];
  }, [liquidityTokenSupply, lpBalance, reserveA, reserveB]);

  const poolTokenPercentage = useMemo(() => {
    if (!liquidityTokenSupply || !lpBalance || liquidityTokenSupply.lt(lpBalance)) {
      return;
    }
    return liquidityTokenSupply.gt(Zero)
      ? lpBalance.mul(PercentagePrecision).div(liquidityTokenSupply)
      : Zero;
  }, [lpBalance, liquidityTokenSupply]);

  const onAddLiquidity = useCallback(() => {
    if (token0 && token1) {
      const wrapToken = getWrappedToken(chainId);
      history.push(
        `/pools/add/${
          token0?.isNative || token0?.wrapped?.address === wrapToken?.address
            ? 'ETH'
            : token0?.wrapped?.address
        }/${
          token1?.isNative || token1?.wrapped?.address === wrapToken?.address
            ? 'ETH'
            : token1?.wrapped?.address
        }`,
      );
    }
  }, [chainId, history, token0, token1]);

  const onRemoveLiquidity = useCallback(() => {
    if (token0 && token1) {
      const wrapToken = getWrappedToken(chainId);
      history.push(
        `/pools/remove/${
          token0?.isNative || token0?.wrapped?.address === wrapToken?.address
            ? 'ETH'
            : token0?.wrapped?.address
        }/${
          token1?.isNative || token1?.wrapped?.address === wrapToken?.address
            ? 'ETH'
            : token1?.wrapped?.address
        }`,
      );
    }
  }, [chainId, history, token0, token1]);

  return lpBalance && lpBalance.gt(Zero) ? (
    <StyledBox open={isOpen}>
      <StyledHeader onClick={() => setIsOpen(!isOpen)}>
        <StyledLPInfo>
          <div className="icon">
            <DexTokenSymbol address={token0?.wrapped?.address} size={36} />
            <DexTokenSymbol address={token1?.wrapped?.address} size={36} />
          </div>
          <div className="name">
            {token0 && token1 ? `${token0?.symbol}/${token1?.symbol}` : ''}
            <StyledMobileInfo>
              <BigNumberValue value={lpBalance} decimals={18} fractionDigits={10} keepCommas />
              <span>
                ( Pool share:{' '}
                <BigNumberValue
                  value={poolTokenPercentage}
                  decimals={8}
                  fractionDigits={2}
                  keepCommas
                  percentage
                />
                )
              </span>
            </StyledMobileInfo>
          </div>
        </StyledLPInfo>
        <StyledRightHeader>
          <StyledRight>
            <span>Manage</span>
          </StyledRight>
          <StyledArrow>
            {isOpen ? (
              <i className="far fa-chevron-up" />
            ) : (
              <i className="far fa-chevron-down" />
            )}
          </StyledArrow>
        </StyledRightHeader>
      </StyledHeader>
      {isOpen ? (
        <>
          <StyledPoolAllocation className="pool-allocation">
            <div className="label">Pool Allocation</div>
            <StyledTokenDeposited>
              <StyledTokenDepositedInfo>
                <DexTokenSymbol address={token0?.wrapped?.address} size={30} />
                <div className="name">{token0?.symbol}</div>
              </StyledTokenDepositedInfo>
              <div className="value">
                {!loading ? (
                  <BigNumberValue
                    value={token0Deposited}
                    decimals={token0?.decimals}
                    fractionDigits={6}
                    keepCommas
                  />
                ) : (
                  <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
                )}
              </div>
            </StyledTokenDeposited>
            <StyledTokenDeposited>
              <StyledTokenDepositedInfo>
                <DexTokenSymbol address={token1?.wrapped?.address} size={30} />
                <div className="name">{token1?.symbol}</div>
              </StyledTokenDepositedInfo>
              <div className="value">
                {!loading ? (
                  <BigNumberValue
                    value={token1Deposited}
                    decimals={token1?.decimals}
                    fractionDigits={6}
                    keepCommas
                  />
                ) : (
                  <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
                )}
              </div>
            </StyledTokenDeposited>
            <StyledPoolShare>
              Pool Share:
              <span>
                {!loading ? (
                  <BigNumberValue
                    value={poolTokenPercentage}
                    decimals={8}
                    fractionDigits={2}
                    keepCommas
                    percentage
                  />
                ) : (
                  <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
                )}
              </span>
            </StyledPoolShare>
          </StyledPoolAllocation>
          <StyledButtonGroup>
            <StyledButtonRemove onClick={onRemoveLiquidity}>Remove</StyledButtonRemove>
            <StyledButtonAdd onClick={onAddLiquidity}>Add</StyledButtonAdd>
          </StyledButtonGroup>
        </>
      ) : null}
    </StyledBox>
  ) : null;
};

const StyledBox = styled.div<{ open?: boolean }>`
  padding: 16px;
  background-color: ${({ theme }) => theme.box.background};
  border: 1px solid ${({ theme }) => theme.box.border};
  cursor: pointer;
  :not(:last-child) {
    margin-bottom: 12px;
  }
  ${screenUp('lg')`
    :not(:last-child) {
      margin-bottom: 16px;
    }
  `}
`;

const StyledPoolShare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #cbcbcb;
  font-size: 14px;
  color: ${({ theme }) => theme.muted};
  span {
    margin-left: auto;
    color: ${({ theme }) => theme.text.primary};
    font-size: 16px;
  }
`;

const StyledPoolAllocation = styled.div`
  padding: 14px;
  margin: 20px 0;
  background-color: #6060601a;
  color: ${({ theme }) => theme.text.primary};
  .label {
    font-size: 14px;
    color: ${({ theme }) => theme.muted};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledRightHeader = styled.div`
  display: none;
  align-items: center;
  ${screenUp('lg')`
    display: flex;
  `}
`;

const StyledTokenDeposited = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 13px;
  .value {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const StyledRight = styled.div`
  margin-left: auto;
  text-align: right;
  span {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyledTokenDepositedInfo = styled.div`
  display: flex;
  align-items: center;
  .name {
    color: ${({ theme }) => theme.text.primary};
    margin-left: 12px;
  }
`;

const StyledLPInfo = styled.div`
  display: flex;
  align-items: center;
  .name {
    font-weight: 600;
    margin-left: 12px;
  }
  .icon {
    display: flex;
    img {
      z-index: 1;
      &:last-child {
        z-index: 0;
        margin-left: -4px;
      }
    }
  }
`;

const StyledMobileInfo = styled.div`
  display: block;
  color: ${({ theme }) => theme.text.primary};
  font-size: 12px;
  font-weight: normal;
  margin-top: 2px;
  span {
    color: ${({ theme }) => theme.muted};
    padding-left: 6px;
  }
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledArrow = styled.div`
  display: none;
  align-items: center;
  justify-content: flex-end;
  font-size: 14px;
  margin-left: 10px;
  color: ${({ theme }) => theme.text.primary};
  ${screenUp('lg')`
    display: flex;
  `}
`;

const StyledButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButtonRemove = styled(ButtonOutline)`
  margin-right: 16px;
  font-size: 14px;
  width: 100%;
  height: 36px;
`;

const StyledButtonAdd = styled(Button)`
  font-size: 14px;
  width: 100%;
  height: 36px;
`;
