import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Button } from '../../../../../components/Buttons';
import { BigNumber } from 'ethers';
import StableTokenInput from './StableTokenInput';
import PoolShareInfo from './PoolShareInfo';
import useModal from '../../../../../hooks/useModal';
import { ModalConfirmAddLP } from './ModalConfirmAddLP';
import { ModalSuccess } from '../../../../../components/ModalSuccess';
import { StablePoolConfig, StablePool } from '../../../../stablepool/models/StablePool';
import { useCalculateAddEstimateAmount } from '../hook/useCalculateAddEstimateAmount';
import {
  CurrencyThreshold,
  Precision,
  SlippagePrecision,
} from '../../../../../utils/constants';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
import { useTokenBalances, useWatchTokenBalance } from '../../../../../state/user/hooks';
import { useAssetsInfo } from '../hook/useAssetsInfo';
import { ColorVariant, screenUp } from '../../../../../utils/styles';
import { useSavePool } from '../../../../../state/dex/hooks';
import { useUniswapToken } from '../../../hooks/useUniswapToken';
import { useApprove } from '../../../../../hooks/useApprove';
import { Zero } from '@ethersproject/constants';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { useMarket } from '../../../../lending/hooks/useLendingMarkets';
import { useLendingUserInfoBalance } from '../../../../lending/hooks/useUserLendingHook';
import { max } from '../../../../../utils/numbers';
import { useCalcAccountHealth } from '../../../../lending/hooks/useCalcAccountHealth';

enum ButtonStatus {
  notConnect,
  loadBalance,
  notApprove,
  notInput,
  noPairFound,
  insufficientBalance,
  ready,
  inSubmit,
  loading,
  healthFactorBelow1,
}

export type AddLiquidityProps = {
  poolConfig: StablePoolConfig;
  poolInfo: StablePool;
  usingZap: boolean;
  tokens: string[];
};

const AddLiquidity: React.FC<AddLiquidityProps> = ({
  poolConfig,
  poolInfo,
  usingZap,
  tokens,
}) => {
  const { account } = useUserWallet();
  const [connect] = useModalConnectWallet();
  const [amounts, setAmounts] = useState<BigNumber[]>([]);
  const [txHash, setTxHash] = useState<string>();
  const slippage = useGetSlippagePrecise();
  const tokensInfo = useAssetsInfo(tokens);
  const balances = useTokenBalances(tokensInfo?.map((t) => t.address));
  const watchTokens = useWatchTokenBalance();
  const onTokenInputChain = useCallback((index: number, value: BigNumber) => {
    setAmounts((t) => {
      t[index] = value;
      return [...t];
    });
  }, []);
  const savePool = useSavePool();

  const currencyA = useUniswapToken(tokensInfo?.[0]?.address);
  const currencyB = useUniswapToken(tokensInfo?.[1]?.address);

  const { isApproved: isApprovedA } = useApprove(
    tokens?.[0],
    usingZap ? poolConfig?.zap : poolConfig?.basePool,
  );
  const { isApproved: isApprovedB } = useApprove(
    tokens?.[1],
    usingZap ? poolConfig?.zap : poolConfig?.basePool,
  );

  const amountDatas = useMemo(() => {
    if (amounts?.length === 0) {
      setAmounts([undefined, undefined]);
    }
    return amounts.map((t, index) => {
      if (t === undefined) {
        t = Zero;
      }
      if (index === 0 && !isApprovedA) {
        t = Zero;
      }
      if (index === 1 && !isApprovedB) {
        t = Zero;
      }
      return t;
    });
  }, [amounts, isApprovedA, isApprovedB]);

  const resetAmount = useCallback(() => {
    setAmounts([]);
  }, [setAmounts]);

  useEffect(() => {
    resetAmount();
  }, [account, resetAmount]);

  useEffect(() => {
    resetAmount();
  }, [resetAmount, usingZap]);

  useEffect(() => {
    if (!tokensInfo) return;
    watchTokens(tokensInfo?.map((t) => t.address));
  }, [tokensInfo, watchTokens]);

  const onAdded = useCallback(
    (txHash: string) => {
      setTxHash(txHash);
      resetAmount();
      savePool({
        stable: true,
        address: poolConfig?.address,
        tokens: {
          currencyA: currencyA.wrapped,
          currencyB: currencyB.wrapped,
        },
      });
    },
    [currencyA?.wrapped, currencyB?.wrapped, poolConfig?.address, resetAmount, savePool],
  );

  const { outputAmount, bonus, impact, poolShare } = useCalculateAddEstimateAmount(
    poolConfig,
    poolInfo,
    poolConfig?.assets,
    poolConfig?.chAssets,
    amounts,
    usingZap,
  );
  const estimateAmount = useMemo(() => {
    if (!outputAmount) return;
    return outputAmount.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision);
  }, [outputAmount, slippage]);

  const [showConfirm] = useModal(
    <ModalConfirmAddLP
      onAdded={onAdded}
      symbols={tokens}
      poolConfig={poolConfig}
      amounts={amountDatas}
      usingZap={usingZap}
      estimateAmount={estimateAmount}
    />,
  );

  const [showModalTransactionSubmitted] = useModal(
    useMemo(() => {
      return <ModalSuccess title={'Transaction submitted'} tx={txHash} hideMetamaskButton />;
    }, [txHash]),
  );

  const { borrowLimit, borrowBalance, accountHealth, liquidationThreshold } =
    useLendingUserInfoBalance();

  const marketA = useMarket(poolConfig?.assets?.[0]);
  const marketB = useMarket(poolConfig?.assets?.[1]);

  const newLiquidationThreshold = useMemo(() => {
    if (usingZap) {
      return;
    }
    if (!liquidationThreshold) {
      return;
    }
    if (!amounts || (!amounts[0] && !amounts[1])) {
      return liquidationThreshold;
    }

    const supplyInputValueA = amounts[0]
      ?.mul(marketA?.exchangeRate)
      .mul(marketA?.underlyingPrice)
      .mul(marketA?.collateralFactor)
      .div(Precision)
      .div(Precision)
      .div(Precision);

    const supplyInputValueB = amounts[1]
      ?.mul(marketB?.exchangeRate)
      .mul(marketB?.underlyingPrice)
      .mul(marketB?.collateralFactor)
      .div(Precision)
      .div(Precision)
      .div(Precision);

    return max(
      liquidationThreshold?.sub(supplyInputValueA || Zero)?.sub(supplyInputValueB || Zero),
      Zero,
    );
  }, [
    usingZap,
    liquidationThreshold,
    amounts,
    marketA?.exchangeRate,
    marketA?.underlyingPrice,
    marketA?.collateralFactor,
    marketB?.exchangeRate,
    marketB?.underlyingPrice,
    marketB?.collateralFactor,
  ]);

  const newAccountHealth = useCalcAccountHealth(newLiquidationThreshold, borrowBalance);

  useEffect(() => {
    if (txHash) {
      showModalTransactionSubmitted();
    }
  }, [showModalTransactionSubmitted, txHash]);

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!poolConfig) {
      return ButtonStatus.noPairFound;
    }
    if (poolInfo?.loading) {
      return ButtonStatus.loading;
    }
    if (!(isApprovedA || isApprovedB)) {
      return ButtonStatus.notApprove;
    }
    if (isApprovedA || isApprovedB) {
      let insufficientBalance;
      tokensInfo.forEach((item, index) => {
        if (
          amounts[index] &&
          balances[item.address] &&
          amounts[index]?.gt(balances[item.address])
        ) {
          insufficientBalance = true;
        }
      });

      if (insufficientBalance) {
        return ButtonStatus.insufficientBalance;
      }

      if (!usingZap && newAccountHealth < 1) {
        return ButtonStatus.healthFactorBelow1;
      }
    }
    if ((isApprovedA && amounts[0]?.gt(0)) || (isApprovedB && amounts[1]?.gt(0))) {
      return ButtonStatus.ready;
    }
    if (
      poolConfig.assets?.length > 0 &&
      poolConfig.assets?.length !== amounts?.filter((t) => t && t.gt(0))?.length
    ) {
      return ButtonStatus.notInput;
    }

    return ButtonStatus.ready;
  }, [
    account,
    amounts,
    balances,
    isApprovedA,
    isApprovedB,
    newAccountHealth,
    poolConfig,
    poolInfo?.loading,
    tokensInfo,
    usingZap,
  ]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
        return false;
      default:
        return true;
    }
  }, [status]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect wallet`;
      case ButtonStatus.notInput:
        return `Enter an amount`;
      case ButtonStatus.noPairFound:
        return `No pairs found`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.notApprove:
        return `Approve the token`;
      case ButtonStatus.healthFactorBelow1:
        return `Health Factor < 1`;
      default:
        return 'Add liquidity';
    }
  }, [status]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      default:
        return showConfirm();
    }
  }, [connect, showConfirm, status]);
  return (
    <BoxContainer>
      <StyledBox>
        <StyledInputContainer>
          {tokens?.map((item, index) => (
            <div key={index}>
              <StableTokenInput
                index={index}
                symbol={item}
                basepoolAddress={usingZap ? poolConfig?.zap : poolConfig?.basePool}
                value={amounts && amounts[index]}
                onChange={onTokenInputChain}
                market={index === 0 ? marketA : marketB}
                usingZap={usingZap}
              />
              {index < tokens?.length - 1 && (
                <StyledIconSwap>
                  <i className="fal fa-plus"></i>
                </StyledIconSwap>
              )}
            </div>
          ))}
        </StyledInputContainer>
      </StyledBox>
      <StyledFooter>
        <PoolShareInfo
          shareOfPool={poolShare}
          estimateAmount={estimateAmount}
          bonus={bonus}
          impact={impact}
        />
        {!usingZap && (
          <StyledLendingInfo>
            <div className="label">Lending Info</div>
            <StyledLendingInfoBox>
              <div className="info">
                <div className="title">Collateral</div>
                {account ? (
                  <StyledValueContent>
                    {amounts && amounts.find((t) => t?.gt(Zero)) && borrowLimit?.gt(Zero) && (
                      <>
                        <span className="value">
                          <BigNumberValue
                            value={borrowLimit}
                            decimals={18}
                            currency="USD"
                            threshold={CurrencyThreshold}
                          />
                        </span>
                        <i className="far fa-arrow-right" />
                      </>
                    )}
                    <span className="value">
                      <BigNumberValue
                        value={newLiquidationThreshold}
                        decimals={18}
                        currency="USD"
                        threshold={CurrencyThreshold}
                      />
                    </span>
                  </StyledValueContent>
                ) : (
                  <StyledValue variant="text.primary">-</StyledValue>
                )}
              </div>
              <div className="info">
                <div className="title">Health Factor</div>
                {account ? (
                  <StyledValueContent>
                    {amounts &&
                      amounts.find((t) => t?.gt(Zero)) &&
                      borrowBalance &&
                      borrowBalance?.gt(Zero) && (
                        <>
                          <StyledValue
                            variant={
                              accountHealth < 1.1
                                ? 'danger'
                                : accountHealth < 1.5
                                ? 'warning'
                                : 'text.primary'
                            }
                          >
                            {accountHealth?.toFixed(2)}
                          </StyledValue>
                          <i className="far fa-arrow-right" />
                        </>
                      )}

                    <StyledValue
                      variant={
                        newAccountHealth < 1.1
                          ? 'danger'
                          : newAccountHealth < 1.5
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {newAccountHealth ? newAccountHealth?.toFixed(2) : 0}
                    </StyledValue>
                  </StyledValueContent>
                ) : (
                  <StyledValue variant="text.primary">-</StyledValue>
                )}
              </div>

              <div className="liquidation">Liquidation at &lt;1.0</div>
            </StyledLendingInfoBox>
          </StyledLendingInfo>
        )}

        <StyledButtons>
          <StyledButton onClick={onButtonClick} disabled={disabled}>
            {buttonText}
          </StyledButton>
        </StyledButtons>
      </StyledFooter>
    </BoxContainer>
  );
};

const BoxContainer = styled.div``;

const StyledBox = styled.div`
  padding: 16px 10px;
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledValueContent = styled.div`
  display: flex;
  align-items: center;
  i {
    font-size: 12px;
    color: ${(p) => p.theme.muted};
    padding: 0px 8px;
  }
`;
const StyledValue = styled.div<{ variant?: ColorVariant }>`
  i {
    font-size: 14px;
  }
  color: ${(p) =>
    p.variant ? (p.variant === 'warning' ? '#d1b91b' : p.theme[p.variant]) : p.theme.black};
`;

const StyledInputContainer = styled.div``;

const StyledIconSwap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.gray3};
  border-radius: 50%;
  border: solid 2px ${({ theme }) => theme.icon.border};
  margin: 12px auto;
`;

const StyledFooter = styled(StyledBox)`
  background-color: ${({ theme }) => theme.box.itemBackground};
  .info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0px;
    .title {
      margin-right: 16px;
      font-size: 14px;
      color: ${({ theme }) => theme.gray3};
    }
  }
  .liquidation {
    margin-bottom: 0px;
    font-size: 13px;
    color: ${({ theme }) => theme.text.muted};
    text-align: right;
  }
`;

const StyledButtons = styled.div`
  flex: 1;
  button {
    width: 100%;
  }
`;

export const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  font-weight: 500;
  color: ${(p) => p.theme.text.primary};
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
    }
  }
`;

const StyledButton = styled(Button)`
  font-weight: 500;
`;

const StyledLendingInfo = styled.div`
  .label {
    color: ${({ theme }) => theme.gray3};
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }
`;
const StyledLendingInfoBox = styled.div`
  margin-bottom: 16px;
  border: solid 1px ${({ theme }) => theme.box.border};
  background-color: ${({ theme }) => theme.box.background};
  padding: 10px;
  ${screenUp('lg')`
    padding: 13px 18px 11px 18px;
  `}
`;

export default AddLiquidity;
