import React, { useMemo, useState } from 'react';
import { useCallback } from 'react';
import { Button } from '../../../../../components/Buttons';
import styled from 'styled-components';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { PairInfo } from '../../../models/Pair';
import Modal, {
  ModalCloseButton,
  ModalHeader,
  ModalProps,
  ModalTitle,
} from '../../../../../components/Modal/ModalStyles';
import { BigNumber } from 'ethers';
import { Field, useEstimateDependentAmount } from '../hook/useEstimateDependentAmount';
import { useNoLiquidity } from '../../../hooks/useNoLiquidity';
import { useUniswapToken } from '../../../hooks/useUniswapToken';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import {
  CurrencyThreshold,
  PercentageThreshold,
  TokenThreshold,
} from '../../../../../utils/constants';
import { useAddLiquidity } from '../../../hooks/useAddLiquidity';
export type ModalConfirmAddLPProps = ModalProps & {
  onAdded: (txHash: string) => void;
  pairInfo: PairInfo;
  independentField: Field;
  amountA: BigNumber;
  amountB: BigNumber;
};

export const ModalConfirmAddLP: React.FC<ModalConfirmAddLPProps> = ({
  onDismiss,
  onAdded,
  pairInfo,
  independentField,
  amountA,
  amountB,
}) => {
  const {
    currencyA,
    currencyB,
    reserveA,
    reserveB,
    liquidityToken,
    liquidityTokenSupply,
    pairState,
  } = pairInfo;
  const slippage = useGetSlippagePrecise();
  const noLiquidity = useNoLiquidity(pairState, reserveA, reserveB);
  const lpToken = useUniswapToken(liquidityToken);
  const [loading, setLoading] = useState(false);
  const {
    minOutputIndependent,
    minOutputDependent,
    dependentAmount,
    priceOutputPerInput,
    shareOfPool,
    liquidityMinted,
  } = useEstimateDependentAmount(
    independentField,
    currencyA,
    currencyB,
    amountA,
    amountB,
    noLiquidity,
    reserveA,
    reserveB,
    liquidityTokenSupply,
    liquidityToken,
  );
  const dependentField = useMemo(() => {
    return independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;
  }, [independentField]);

  const [typedValue, otherTypedValue] =
    independentField === Field.CURRENCY_A ? [amountA, amountB] : [amountB, amountA];

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: noLiquidity ? otherTypedValue : dependentAmount,
    };
  }, [
    independentField,
    typedValue,
    noLiquidity,
    otherTypedValue,
    dependentAmount,
    dependentField,
  ]);

  const formattedMinAmounts = useMemo(() => {
    return {
      [independentField]: minOutputIndependent,
      [dependentField]: minOutputDependent,
    };
  }, [independentField, dependentField, minOutputIndependent, minOutputDependent]);

  const executeAdd = useAddLiquidity(
    currencyA,
    currencyB,
    amountA,
    amountB,
    formattedMinAmounts,
  );

  const onAdd = useCallback(async () => {
    if (!amountA || !amountB) {
      return;
    }
    setLoading(true);
    try {
      const result = await executeAdd();
      if (result?.tx) {
        onAdded(result?.tx?.hash);
      }
    } catch (error) {
      console.debug('add liquidity error ', error);
    }
    setLoading(false);
    onDismiss();
  }, [amountA, amountB, executeAdd, onAdded, onDismiss]);

  return (
    <Modal size="sm">
      <StyledModalHeader>
        <ModalCloseButton onClick={onDismiss} />
        <StyledModalTitle>
          <div className="icon">
            <DexTokenSymbol size={46} address={currencyA?.wrapped.address} />
            <DexTokenSymbol size={46} address={currencyB?.wrapped.address} />
          </div>
          You will receive
        </StyledModalTitle>
        <StyledTokenReceive>
          <div className="value">
            <BigNumberValue
              value={liquidityMinted}
              decimals={lpToken?.decimals}
              fractionDigits={10}
              threshold={TokenThreshold.DEFAULT}
              keepCommas
            />
          </div>
          <div className="name">
            {currencyA?.symbol}/{currencyB?.symbol} LP
          </div>
        </StyledTokenReceive>
        <StyledReceiveDes>
          Output is estimated. If the price changes by more than{' '}
          <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} /> your
          transaction will revert
        </StyledReceiveDes>
      </StyledModalHeader>
      <StyledModalBody>
        <div className="label">Transaction Overview</div>
        <StyledAddInfo>
          <div className="label-info">Deposit</div>
          <StyledLPInfo>
            <StyledLPSymbol>
              <div className="icon">
                <DexTokenSymbol address={currencyA?.wrapped.address} size={30} />
              </div>
              <div className="name">{currencyA?.symbol}</div>
            </StyledLPSymbol>
            <div className="value">
              <BigNumberValue
                value={formattedAmounts[Field.CURRENCY_A]}
                decimals={currencyA?.decimals}
                fractionDigits={6}
                threshold={CurrencyThreshold}
                keepCommas
              />
            </div>
          </StyledLPInfo>
          <StyledLPInfo>
            <StyledLPSymbol>
              <div className="icon">
                <DexTokenSymbol address={currencyB?.wrapped.address} size={30} />
              </div>
              <div className="name">{currencyB?.symbol}</div>
            </StyledLPSymbol>
            <div className="value">
              <BigNumberValue
                value={formattedAmounts[Field.CURRENCY_B]}
                decimals={currencyB?.decimals}
                fractionDigits={6}
                threshold={CurrencyThreshold}
                keepCommas
              />
            </div>
          </StyledLPInfo>
        </StyledAddInfo>
        <StyledRateInfo>
          <StyledInfoItem>
            <div className="label">Rate</div>
            <div className="value">
              1 {currencyA?.symbol} = &nbsp;
              <BigNumberValue value={priceOutputPerInput} decimals={6} fractionDigits={6} />
              &nbsp;{currencyB?.symbol}
            </div>
          </StyledInfoItem>
          <StyledInfoItem>
            <div className="label">Pool Share</div>
            <div className="value">
              <BigNumberValue
                value={shareOfPool}
                decimals={8}
                fractionDigits={2}
                percentage
                threshold={PercentageThreshold}
              />
            </div>
          </StyledInfoItem>
          <StyledInfoItem>
            <div className="label">Slippage</div>
            <div className="value">
              <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} />
            </div>
          </StyledInfoItem>
        </StyledRateInfo>
        <StyledButtonAdd block onClick={onAdd} isLoading={loading} disabled={loading}>
          Confirm Add Liquidity
        </StyledButtonAdd>
      </StyledModalBody>
    </Modal>
  );
};

const StyledModalHeader = styled(ModalHeader)`
  background-color: ${({ theme }) => theme.box.innerBackground};
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 14px 20px;
  button {
    position: absolute;
    right: 24px;
    padding: 0;
  }
`;

const StyledModalTitle = styled(ModalTitle)`
  font-weight: normal;
  text-align: center;
  line-height: 2;
  margin-top: 7px;
  font-size: 16px;
  .icon {
    display: flex;
    justify-content: center;
    img {
      z-index: 1;
      &:last-child {
        z-index: 0;
        margin-left: -4px;
      }
    }
  }
`;

const StyledModalBody = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  .label {
    font-weight: 500;
  }
`;

const StyledTokenReceive = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.success};
  .value {
    margin-right: 5px;
    font-weight: bold;
    font-size: 20px;
  }
  .name {
    font-weight: 500;
  }
`;

const StyledReceiveDes = styled.div`
  margin-top: 16px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.gray3};
  text-align: center;
`;

const StyledLPInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  .value {
    text-align: right;
  }
`;

const StyledLPSymbol = styled.div`
  display: flex;
  align-items: center;
  .name {
    margin-left: 7px;
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

const StyledAddInfo = styled.div`
  margin-top: 8px;
  margin-bottom: 15px;
  .label-info {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyledRateInfo = styled.div`
  border-top: dashed 1px ${({ theme }) => theme.gray1};
  margin-bottom: 24px;
`;

const StyledInfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  .label {
    color: ${({ theme }) => theme.gray3};
    font-weight: normal;
  }
`;

const StyledButtonAdd = styled(Button)`
  font-weight: 500;
`;
