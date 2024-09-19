import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Currency } from '@uniswap/sdk-core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ModalSelectWallet } from '../../../../../components/AccountModal/ModalSelectWallet';
import { Button } from '../../../../../components/Buttons';
import { ModalSuccess } from '../../../../../components/ModalSuccess';
import useModal from '../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Field, Trade } from '../../../../../state/dex/actions';
import {
  useExpertModeManager,
  useRecipient,
  useSetLastPairSwap,
} from '../../../../../state/dex/hooks';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { screenUp } from '../../../../../utils/styles';
import { useDexApprove } from '../../../../lending/hooks/useDexApprove';
import { useAggregationRouter } from '../../../hooks/useAggregationRouter';
import { usePriceImpact } from '../../../hooks/usePriceImpact';
import { useSwap } from '../../../hooks/useSwap';
import { useTokenListLogo } from '../../../hooks/useTokenListLogo';
import { useWrap, WrapType } from '../../../hooks/useWrap';
import { ModalConfirmSwap } from './Modals/ModalConfirmSwap';

enum ButtonStatus {
  notConnect,
  loadBalance,
  notSelectedToken,
  duplicateToken,
  noRoute,
  findingRoute,
  notInput,
  notApprove,
  insufficientBalance,
  invalidRecipient,
  priceImpactHigh,
  priceImpactVeryHigh,
  inSubmit,
  wrap,
  unwrap,
  ready,
}
type ButtonSwapProps = {
  userHasSpecifiedInputOutput: boolean;
  onSwapCompleted?: () => void;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  inputAmount?: BigNumber;
  outputAmount?: BigNumber;
  recipientError?: string;
  wrapType?: WrapType;
  inputValue?: BigNumber;
  independentField?: Field;
  trade?: Trade;
  loadingEstimate?: boolean;
};

export const ButtonSwap: React.FC<ButtonSwapProps> = ({
  inputCurrency,
  outputCurrency,
  userHasSpecifiedInputOutput,
  onSwapCompleted,
  inputAmount,
  outputAmount,
  wrapType,
  recipientError,
  inputValue,
  trade,
  independentField,
  loadingEstimate,
}) => {
  const { account } = useUserWallet();
  const [isExpertMode] = useExpertModeManager();
  const inputBalance = useTokenBalance(
    inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
  );
  const [connect] = useModal(<ModalSelectWallet />);
  const [loading, setLoading] = useState(false);
  const aggregationRouter = useAggregationRouter();
  const { isApproved } = useDexApprove(
    inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
    aggregationRouter?.address,
  );
  const recipientAddressOrName = useRecipient();
  const { priceImpactLevel } = usePriceImpact(trade?.priceImpact);
  const executeWrap = useWrap(inputValue, wrapType);
  const executeSwap = useSwap(
    inputCurrency,
    outputCurrency,
    inputAmount,
    outputAmount,
    trade?.minAmountOut,
    trade?.path,
  );
  const setLastPairSwap = useSetLastPairSwap();
  const [txHash, setTxHash] = useState<string>();
  const getTokenLogo = useTokenListLogo();

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!inputCurrency || !outputCurrency) {
      return ButtonStatus.notSelectedToken;
    }
    if (inputCurrency === outputCurrency) {
      return ButtonStatus.duplicateToken;
    }
    if (!userHasSpecifiedInputOutput) {
      return ButtonStatus.notInput;
    }
    if (inputAmount && inputBalance && inputAmount?.gt(inputBalance)) {
      return ButtonStatus.insufficientBalance;
    }
    if (!inputBalance) {
      return ButtonStatus.loadBalance;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    if (loadingEstimate) {
      return ButtonStatus.findingRoute;
    }
    if (wrapType === WrapType.WRAP) {
      return ButtonStatus.wrap;
    }
    if (wrapType === WrapType.UNWRAP) {
      return ButtonStatus.unwrap;
    }
    if (trade?.path && !trade?.path?.length) {
      return ButtonStatus.noRoute;
    }
    if (!isApproved) {
      return ButtonStatus.notApprove;
    }
    if (recipientAddressOrName && recipientError) {
      return ButtonStatus.invalidRecipient;
    }
    if (priceImpactLevel === 'HIGH') {
      return ButtonStatus.priceImpactHigh;
    }
    if (priceImpactLevel === 'VERY_HIGH') {
      return ButtonStatus.priceImpactVeryHigh;
    }
    return ButtonStatus.ready;
  }, [
    account,
    inputCurrency,
    outputCurrency,
    userHasSpecifiedInputOutput,
    inputAmount,
    inputBalance,
    loading,
    loadingEstimate,
    wrapType,
    trade?.path,
    isApproved,
    recipientAddressOrName,
    recipientError,
    priceImpactLevel,
  ]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
      case ButtonStatus.wrap:
      case ButtonStatus.unwrap:
      case ButtonStatus.priceImpactHigh:
      case ButtonStatus.priceImpactVeryHigh:
        return false;
      default:
        return true;
    }
  }, [status]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect wallet`;
      case ButtonStatus.notSelectedToken:
        return `Select a token`;
      case ButtonStatus.notInput:
        return `Enter an amount`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.findingRoute:
        return `Finding route`;
      case ButtonStatus.noRoute:
        return `No route for swap`;
      case ButtonStatus.priceImpactHigh:
        return `Swap anyway`;
      case ButtonStatus.priceImpactVeryHigh:
        return `Very High Price Impact`;
      case ButtonStatus.invalidRecipient:
        return recipientError;
      case ButtonStatus.wrap:
        return `Wrap `;
      case ButtonStatus.unwrap:
        return `Unwrap`;
      default:
        switch (wrapType) {
          case WrapType.WRAP:
            return 'Wrap';
          case WrapType.UNWRAP:
            return 'Unwrap';
          default:
            return 'Swap';
        }
    }
  }, [recipientError, status, wrapType]);

  const [showModalTransactionSubmitted] = useModal(
    useMemo(() => {
      return (
        <ModalSuccess
          symbol={
            outputCurrency?.isNative ? outputCurrency?.symbol : outputCurrency?.wrapped?.symbol
          }
          address={outputCurrency?.wrapped?.address}
          decimals={outputCurrency?.wrapped?.decimals}
          logo={getTokenLogo(outputCurrency?.wrapped?.address)}
          title={'Transaction submitted'}
          tx={txHash}
        />
      );
    }, [outputCurrency, txHash, getTokenLogo]),
  );

  useEffect(() => {
    if (txHash) {
      showModalTransactionSubmitted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  const onCompleted = useCallback(
    (tx?: TransactionResponse) => {
      setLastPairSwap(
        inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
        outputCurrency?.isNative ? outputCurrency?.symbol : outputCurrency?.wrapped?.address,
      );
      onSwapCompleted();
      setTxHash(tx?.hash);
    },
    [onSwapCompleted, outputCurrency, setLastPairSwap, inputCurrency],
  );

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        wrapType !== WrapType.NOT_APPLICABLE ? await executeWrap() : await executeSwap();
      if (result?.tx) {
        onCompleted(result.tx);
      }
    } catch (ex) {
      console.debug('swap error ', ex);
    }
    setLoading(false);
  }, [executeSwap, executeWrap, onCompleted, wrapType]);

  const onSubmitSwap = useCallback(
    (data?: { isLoading?: boolean; isCompleted?: boolean; tx?: TransactionResponse }) => {
      setLoading(data?.isLoading ?? false);
      if (data?.tx) {
        onCompleted(data?.tx);
      }
    },
    [onCompleted],
  );

  const [showConfirm] = useModal(
    useMemo(() => {
      return (
        <ModalConfirmSwap
          onSubmitSwap={onSubmitSwap}
          inputAmount={inputAmount}
          inputCurrency={inputCurrency}
          outputAmount={outputAmount}
          outputCurrency={outputCurrency}
          inputValue={inputValue}
          independentField={independentField}
          trade={trade}
        />
      );
    }, [
      onSubmitSwap,
      inputAmount,
      inputCurrency,
      outputAmount,
      outputCurrency,
      inputValue,
      independentField,
      trade,
    ]),
    'ConfirmSwap',
  );

  const onButtonClick = useCallback(() => {
    if (status === ButtonStatus.notConnect) {
      return connect();
    }

    if (wrapType !== WrapType.NOT_APPLICABLE || isExpertMode) {
      return execute();
    }

    return showConfirm();
  }, [status, wrapType, isExpertMode, showConfirm, connect, execute]);

  return (
    <StyledButton
      onClick={onButtonClick}
      disabled={disabled}
      warning={priceImpactLevel && priceImpactLevel !== 'LOW'}
      isLoading={status === ButtonStatus.inSubmit || status === ButtonStatus.findingRoute}
    >
      {buttonText}
    </StyledButton>
  );
};

const StyledButton = styled(Button)<{
  warning?: boolean;
}>`
  font-weight: 500;
  font-size: 14px;
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
  `}
`;
