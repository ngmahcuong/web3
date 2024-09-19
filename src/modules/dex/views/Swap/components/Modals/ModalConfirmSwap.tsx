import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Currency } from '@uniswap/sdk-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../../components/BigNumberValue';
import { Button } from '../../../../../../components/Buttons';
import Modal from '../../../../../../components/Modal';
import { ModalCloseButton, ModalProps } from '../../../../../../components/Modal/ModalStyles';
import { useGetSlippagePrecise } from '../../../../../../state/application/hooks';
import { Trade, Field } from '../../../../../../state/dex/actions';
import { TokenThreshold } from '../../../../../../utils/constants';
import { screenUp } from '../../../../../../utils/styles';
import { DexTokenSymbol } from '../../../../components/DexTokenSymbol';
import {
  StyledConfirmSwapItemInfo,
  StyledDashed,
  StyledInputSymbol,
  StyledModalBody,
  StyledModalHeader,
  StyledModalTitle,
  StyledTokenReceive,
  StyleTextOverview,
  StyleTextSwapFrom,
} from '../../../../components/Share';
import { useEstimateSwap } from '../../../../hooks/useEstimateSwap';
import { useConfirmSwapWithHighImpact, usePriceImpact } from '../../../../hooks/usePriceImpact';
import { useSwap } from '../../../../hooks/useSwap';
import { useWrap, useWrapType, WrapType } from '../../../../hooks/useWrap';
import { SwapSummary } from '../SwapSummary';

export type ModalConfirmSwapProps = ModalProps & {
  onSubmitSwap?: (data?: {
    isLoading?: boolean;
    isCompleted?: boolean;
    tx?: TransactionResponse;
  }) => void;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  inputAmount?: BigNumber;
  outputAmount?: BigNumber;
  inputValue?: BigNumber;
  independentField?: Field;
  trade?: Trade;
};

export const ModalConfirmSwap: React.FC<ModalConfirmSwapProps> = ({
  onDismiss,
  inputAmount,
  inputCurrency,
  outputAmount,
  outputCurrency,
  onSubmitSwap,
  inputValue,
  independentField,
  trade,
}) => {
  const [currentTrade, setCurrentTrade] = useState(trade);
  const [currentInputAmount, setCurrentInputAmount] = useState(inputAmount);
  const [currentOutputAmount, setCurrentOutputAmount] = useState(outputAmount);
  const [isLoading, setLoading] = useState<boolean>();
  const [isShowUpdatePriceButton, setShowUpdatePriceButton] = useState<boolean>(false);
  const { priceImpactLevel } = usePriceImpact(trade?.priceImpact);
  const wrapType = useWrapType();
  const executeWrap = useWrap(inputValue, wrapType);
  const executeSwap = useSwap(
    inputCurrency,
    outputCurrency,
    currentInputAmount,
    currentOutputAmount,
    currentTrade?.minAmountOut,
    currentTrade?.path,
  );
  const confirmSwapWithHighImpact = useConfirmSwapWithHighImpact();

  const {
    trade: newTrade,
    inputAmount: newInputAmount,
    outputAmount: newOutputAmount,
  } = useEstimateSwap(inputValue, independentField);

  const isPriceUpdate = useMemo(() => {
    if (currentTrade?.priceInputPerOutput && newTrade?.priceInputPerOutput) {
      return !currentTrade?.priceInputPerOutput?.eq(newTrade?.priceInputPerOutput);
    } else {
      return false;
    }
  }, [currentTrade, newTrade]);

  useEffect(() => {
    if (isPriceUpdate && !isShowUpdatePriceButton) {
      setShowUpdatePriceButton(true);
    }
  }, [isPriceUpdate, isShowUpdatePriceButton]);

  const onSubmit = useCallback(async () => {
    if (confirmSwapWithHighImpact(trade?.priceImpact)) {
      setLoading(true);
      onSubmitSwap({
        isLoading: true,
      });
      let tx: TransactionResponse;
      try {
        const result =
          wrapType !== WrapType.NOT_APPLICABLE ? await executeWrap() : await executeSwap();
        tx = result?.tx;
      } catch (ex) {
        console.debug('swap error ', ex);
      }

      onSubmitSwap({
        isLoading: false,
        isCompleted: true,
        tx: tx,
      });
      setLoading(false);
      onDismiss();
    }
  }, [
    confirmSwapWithHighImpact,
    trade?.priceImpact,
    onSubmitSwap,
    onDismiss,
    wrapType,
    executeWrap,
    executeSwap,
  ]);

  const slippage = useGetSlippagePrecise();

  const buttonText = useMemo(() => {
    switch (priceImpactLevel) {
      case 'LOW':
        return 'Confirm Swap';
      case 'HIGH':
        return 'Swap anyway';
      case 'VERY_HIGH':
        return 'Very High Price Impact';
      default:
        return 'Confirm Swap';
    }
  }, [priceImpactLevel]);

  const disabled = useMemo(() => {
    return isLoading || isPriceUpdate;
  }, [isLoading, isPriceUpdate]);

  const onUpdatePrice = useCallback(() => {
    if (newTrade && newInputAmount && newOutputAmount) {
      setCurrentTrade(newTrade);
      setCurrentInputAmount(newInputAmount);
      setCurrentOutputAmount(newOutputAmount);
    }
  }, [newInputAmount, newOutputAmount, newTrade]);

  return (
    <Modal size="xs">
      <StyledModalHeader>
        <ModalCloseButton onClick={onDismiss} />
        <StyledModalTitle>
          <DexTokenSymbol size={45} address={outputCurrency?.wrapped?.address} />
          You will receive
        </StyledModalTitle>
        <StyledTokenReceive>
          <BigNumberValue
            value={currentOutputAmount}
            decimals={outputCurrency?.decimals}
            fractionDigits={10}
            keepCommas
            threshold={TokenThreshold.DEFAULT}
          />
          <div className="symbol">{outputCurrency?.symbol}</div>
        </StyledTokenReceive>
        <StyledReceiveDes>
          Output is estimated. If the price changes by more than{' '}
          <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} /> your
          transaction will revert
        </StyledReceiveDes>
      </StyledModalHeader>
      <StyledModalBody>
        <StyleTextOverview>Transaction overview</StyleTextOverview>
        <StyleTextSwapFrom>Swap from</StyleTextSwapFrom>
        <StyledConfirmSwapItemInfo>
          <StyledInputSymbol>
            <DexTokenSymbol address={inputCurrency?.wrapped?.address} size={30} />
            <div className="symbol">{inputCurrency?.symbol}</div>
          </StyledInputSymbol>
          <BigNumberValue
            value={currentInputAmount}
            decimals={inputCurrency?.decimals}
            fractionDigits={10}
            keepCommas
          />
        </StyledConfirmSwapItemInfo>
        {isShowUpdatePriceButton && (
          <StyledPriceUpdateContainer>
            <i className="fas fa-exclamation-triangle"></i>
            Price update
            <StyledButtonUpdatePrice
              size="sm"
              disabled={!isPriceUpdate}
              onClick={onUpdatePrice}
            >
              Accept
            </StyledButtonUpdatePrice>
          </StyledPriceUpdateContainer>
        )}

        <StyledDashed />
        <SwapSummaryWrapper>
          <SwapSummary trade={trade} showSlippage />
        </SwapSummaryWrapper>
        <StyledButtonWrapper>
          <StyledButtonSwap
            block
            onClick={onSubmit}
            disabled={disabled}
            warning={priceImpactLevel && priceImpactLevel !== 'LOW'}
            isLoading={isLoading}
          >
            {buttonText}
          </StyledButtonSwap>
        </StyledButtonWrapper>
      </StyledModalBody>
    </Modal>
  );
};

const StyledReceiveDes = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.gray3};
  text-align: center;
  margin-top: 8px;
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const SwapSummaryWrapper = styled.div`
  padding: 6px 0px;
`;

const StyledButtonSwap = styled(Button)<{
  warning?: boolean;
}>`
  font-size: 14px;
  height: 42px;
  font-weight: 500;
  background-color: ${({ warning, theme }) =>
    warning ? theme.button.danger.background : undefined};
  :not(:disabled) {
    :hover {
      background-color: ${({ warning, theme }) =>
        warning ? theme.button.danger.hover : undefined};
    }
  }
  ${screenUp('lg')`
      font-size: 16px;
      height: 46px;
  `}
`;

const StyledPriceUpdateContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  padding: 6px 8px 6px 12px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  border-radius: 5px;
  background-color: ${({ theme }) => theme.box.background};
  i {
    margin-right: 8px;
    color: ${({ theme }) => theme.warning};
  }
`;

const StyledButtonUpdatePrice = styled(Button)`
  margin-left: auto;
`;

const StyledButtonWrapper = styled.div`
  margin-top: 10px;
`;
