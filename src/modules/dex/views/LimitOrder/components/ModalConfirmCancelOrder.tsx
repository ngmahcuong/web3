import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Button } from '../../../../../components/Buttons';
import Modal, {
  ModalCloseButton,
  ModalProps,
} from '../../../../../components/Modal/ModalStyles';
import { Timestamp } from '../../../../../components/Timestamp';
import { getWrappedToken } from '../../../../../config';
import { useHandleTransactionReceipt } from '../../../../../hooks/useHandleTransactionReceipt';
import { ETH_ADDRESS, Precision, TokenThreshold } from '../../../../../utils/constants';
import { formatBigNumber } from '../../../../../utils/numbers';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import {
  StyledInputSymbol,
  StyledModalBody,
  StyledModalHeader,
  StyledModalTitle,
  StyledTokenReceive,
  StyleTextOverview,
} from '../../../components/Share';
import { useDexNativeToken } from '../../../hooks/useDexNativeToken';
import { useLimitOrderContract } from '../../../hooks/useLimitOrderContract';
import { useUniswapToken } from '../../../hooks/useUniswapToken';
import { LimitOrderData } from '../../../models/Graphql';

export type ModalConfirmCancelOrderProps = ModalProps & {
  order: LimitOrderData;
  onCompleted: () => void;
};

export const ModalConfirmCancelOrder: React.FC<ModalConfirmCancelOrderProps> = ({
  onDismiss,
  order,
  onCompleted,
}) => {
  const { chainId } = useWeb3React();
  const { estimate } = useLimitOrderContract();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const nativeToken = useDexNativeToken();
  const inputCurrency = useUniswapToken(
    order.inputToken?.id === ETH_ADDRESS.toLowerCase()
      ? nativeToken.symbol
      : order.inputToken?.id,
  );
  const outputCurrency = useUniswapToken(
    order.outputToken?.id === ETH_ADDRESS.toLowerCase()
      ? nativeToken.symbol
      : order.outputToken?.id,
  );
  const [loading, setLoading] = useState(false);
  const wrappedToken = getWrappedToken(chainId);
  const prices = useMemo(() => {
    const priceInputPerOutput = BigNumber.from(order.outputAmount)
      .mul(Precision)
      .div(BigNumber.from(order.inputAmount));

    const priceOutputPerInput = BigNumber.from(order.inputAmount)
      .mul(Precision)
      .div(BigNumber.from(order.outputAmount));

    return {
      priceInputPerOutput,
      priceOutputPerInput,
    };
  }, [order.inputAmount, order.outputAmount]);

  const cancelOrder = useCallback(async () => {
    return await estimate('cancelOrder', [
      order?.id,
      order.inputToken?.id === wrappedToken?.address?.toLowerCase() ? true : false,
    ]);
  }, [estimate, order?.id, order.inputToken?.id, wrappedToken?.address]);

  const onCancelOrder = useCallback(async () => {
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Cancel order from ${formatBigNumber(
          BigNumber.from(order.inputAmount),
          inputCurrency?.decimals,
          {
            fractionDigits: 10,
            compact: false,
            threshold: TokenThreshold.DEFAULT,
          },
        )} ${inputCurrency?.symbol} to ${formatBigNumber(
          BigNumber.from(order.outputAmount),
          outputCurrency?.decimals,
          {
            fractionDigits: 10,
            compact: false,
            threshold: TokenThreshold.DEFAULT,
          },
        )} ${outputCurrency?.symbol}`,
        cancelOrder,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
        onCompleted?.();
      }
    } catch (ex) {
      setLoading(false);
    }
    onDismiss();
  }, [
    cancelOrder,
    handleTransactionReceipt,
    inputCurrency?.decimals,
    inputCurrency?.symbol,
    onCompleted,
    onDismiss,
    order?.inputAmount,
    order?.outputAmount,
    outputCurrency?.decimals,
    outputCurrency?.symbol,
  ]);

  return (
    <Modal size="sm">
      <StyledModalHeader>
        <ModalCloseButton onClick={onDismiss} />
        <StyledModalTitle>
          <DexTokenSymbol size={45} address={inputCurrency?.wrapped?.address} />
          You will receive
        </StyledModalTitle>
        <StyledTokenReceive>
          <div className="value">
            <BigNumberValue
              value={BigNumber.from(order.inputAmount)}
              decimals={inputCurrency?.decimals}
              fractionDigits={10}
              threshold={TokenThreshold.DEFAULT}
              keepCommas
            />
          </div>{' '}
          <div className="name">{inputCurrency?.name}</div>
        </StyledTokenReceive>
      </StyledModalHeader>
      <StyledModalBody>
        <StyleTextOverview>Cancel Order</StyleTextOverview>
        <StyleTextSwap>From</StyleTextSwap>
        <StyledConfirmSwapItemInfo>
          <StyledInputSymbol>
            <DexTokenSymbol
              address={
                inputCurrency.isNative ? inputCurrency.symbol : inputCurrency?.wrapped?.address
              }
              size={30}
            />
            <div className="symbol">{inputCurrency?.symbol}</div>
          </StyledInputSymbol>
          <BigNumberValue
            value={BigNumber.from(order.inputAmount)}
            decimals={inputCurrency?.decimals}
            fractionDigits={10}
            keepCommas
          />
        </StyledConfirmSwapItemInfo>
        <StyleTextSwap>To</StyleTextSwap>
        <StyledConfirmSwapItemInfo>
          <StyledInputSymbol>
            <DexTokenSymbol
              address={
                outputCurrency.isNative
                  ? outputCurrency.symbol
                  : outputCurrency?.wrapped?.address
              }
              size={30}
            />
            <div className="symbol">{outputCurrency?.symbol}</div>
          </StyledInputSymbol>
          <BigNumberValue
            value={BigNumber.from(order.outputAmount)}
            decimals={outputCurrency?.decimals}
            fractionDigits={10}
            keepCommas
          />
        </StyledConfirmSwapItemInfo>
        <StyledSummaryItem>
          <span className="label">Limit Price</span>
          <span>
            1 {inputCurrency?.symbol} ={' '}
            <BigNumberValue
              value={prices?.priceInputPerOutput}
              decimals={18 + outputCurrency?.decimals - inputCurrency?.decimals}
              fractionDigits={10}
              keepCommas
              threshold={TokenThreshold.DEFAULT}
            />
            {` ${outputCurrency?.symbol}`}
          </span>
        </StyledSummaryItem>
        <StyledSummaryItem>
          <span className="label">Expires in</span>
          <span>
            {parseInt(order.expiryTimestamp) > 0 ? (
              <Timestamp secs={+order.expiryTimestamp} />
            ) : (
              <span>Never</span>
            )}
          </span>
        </StyledSummaryItem>
        <StyledSummaryItem>
          <span className="label">Created at</span>
          <span>
            <Timestamp secs={+order.createdAt} />
          </span>
        </StyledSummaryItem>
        <StyledButtonCancel
          block
          onClick={onCancelOrder}
          isLoading={loading}
          disabled={loading}
        >
          Cancel Order
        </StyledButtonCancel>
      </StyledModalBody>
    </Modal>
  );
};

const StyledConfirmSwapItemInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 0px 12px;
  border-bottom: 1px dashed ${({ theme }) => theme.box.border4};
`;

export const StyleTextSwap = styled.div`
  color: ${({ theme }) => theme.gray6};
`;

const StyledSummaryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  .label {
    color: ${({ theme }) => theme.gray6};
  }
`;

const StyledButtonCancel = styled(Button)`
  margin-top: 24px;
`;
