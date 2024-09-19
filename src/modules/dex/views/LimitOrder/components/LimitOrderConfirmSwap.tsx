import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { Fragment, useCallback, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Button } from '../../../../../components/Buttons';
import Modal from '../../../../../components/Modal';
import { ModalCloseButton, ModalProps } from '../../../../../components/Modal/ModalStyles';
import { Trade } from '../../../../../state/dex/actions';
import { screenUp } from '../../../../../utils/styles';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import {
  StyledConfirmSwapItemInfo,
  StyledConfirmSwapRightContainer,
  StyledConfirmSwapTextLeft,
  StyledDashed,
  StyledInputSymbol,
  StyledModalBody,
  StyledModalHeader,
  StyledModalTitle,
  StyledTokenReceive,
  StyleTextOverview,
  StyleTextSwapFrom,
} from '../../../components/Share';
import { WarningMessage } from './WarningMessage';

export type LimitOrderConfirmSwapProps = ModalProps & {
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  inputAmount?: BigNumber;
  outputAmount?: BigNumber;
  trade?: Trade;
  limitPrice?: BigNumber;
  onSubmitSwap?: () => Promise<any>;
};

export const LimitOrderConfirmSwap: React.FC<LimitOrderConfirmSwapProps> = ({
  outputCurrency,
  outputAmount,
  inputCurrency,
  inputAmount,
  trade,
  limitPrice,
  onDismiss,
  onSubmitSwap,
}) => {
  const [isLoading, setLoading] = useState<boolean>();

  const onSubmit = useCallback(() => {
    setLoading(true);
    onSubmitSwap?.().finally(() => {
      setLoading(false);
      onDismiss();
    });
  }, [onSubmitSwap, onDismiss]);

  return (
    <Modal size="xs">
      <StyledModalHeader>
        <ModalCloseButton onClick={onDismiss} />
        <StyledModalTitle>
          <DexTokenSymbol
            size={45}
            address={
              outputCurrency?.isNative
                ? outputCurrency.symbol
                : outputCurrency?.wrapped?.address
            }
          />
          You will receive
        </StyledModalTitle>
        <StyledTokenReceive>
          <BigNumberValue
            value={outputAmount}
            decimals={outputCurrency?.decimals}
            fractionDigits={10}
            keepCommas
          />
          <div className="symbol">{outputCurrency?.symbol}</div>
        </StyledTokenReceive>
      </StyledModalHeader>
      <StyledModalBody>
        <StyleTextOverview>Transaction Overview</StyleTextOverview>
        <StyleTextSwapFrom>Input Amount</StyleTextSwapFrom>
        <StyledConfirmSwapItemInfo>
          <StyledInputSymbol>
            <DexTokenSymbol
              address={
                inputCurrency?.isNative ? inputCurrency.symbol : inputCurrency?.wrapped?.address
              }
              size={30}
            />
            <div className="symbol">{inputCurrency?.symbol}</div>
          </StyledInputSymbol>
          <BigNumberValue
            value={inputAmount}
            decimals={inputCurrency?.decimals}
            fractionDigits={10}
            keepCommas
          />
        </StyledConfirmSwapItemInfo>
        <StyledDashed />
        {[
          {
            title: 'Spot Price',
            price: limitPrice,
          },
          {
            title: 'Market Price',
            price: trade?.priceOutputPerInput,
          },
        ].map((item, index, items) => {
          const price = item?.price;
          return (
            <Fragment key={`price-item-${index}`}>
              <StyledConfirmSwapItemInfo>
                <StyledConfirmSwapTextLeft>{item?.title}</StyledConfirmSwapTextLeft>
                <StyledConfirmSwapRightContainer>
                  <div>
                    1 {inputCurrency?.symbol} ={' '}
                    <BigNumberValue value={price} decimals={18} fractionDigits={6} />{' '}
                    {outputCurrency?.symbol}
                  </div>
                </StyledConfirmSwapRightContainer>
              </StyledConfirmSwapItemInfo>
              {index < items.length - 1 && <StyledDashed />}
            </Fragment>
          );
        })}
        <StyledLimitOrderDescWrapper>
          <div>
            <i className="fa fa-check" />
          </div>
          <div>
            Limit price is{' '}
            <WarningMessage marketPrice={trade.priceOutputPerInput} limitPrice={limitPrice} />{' '}
            rate. The order will be executed when the market price reaches high enough above
            your limit price (to also pay for limit order execution gas fees)
          </div>
        </StyledLimitOrderDescWrapper>

        <StyledButtonSwap block onClick={onSubmit} isLoading={isLoading} disabled={isLoading}>
          Confirm
        </StyledButtonSwap>
      </StyledModalBody>
    </Modal>
  );
};

const StyledLimitOrderDescWrapper = styled.div`
  display: flex;
  color: ${({ theme }) => theme.header.background};
  background-color: ${({ theme }) => theme.green};
  padding: 12px;
  i {
    color: ${({ theme }) => theme.white};
    background-color: ${({ theme }) => theme.header.background};
    margin-right: 8px;
    padding: 4px;
    border-radius: 10px;
    font-size: 10px;
  }
`;

const StyledButtonSwap = styled(Button)`
  font-size: 14px;
  height: 42px;
  font-weight: 500;
  margin-top: 8px;
  ${screenUp('lg')`
      font-size: 16px;
      height: 46px;
  `}
`;
