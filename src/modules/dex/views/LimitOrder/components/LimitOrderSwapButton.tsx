import { TransactionResponse } from '@ethersproject/providers';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ModalSelectWallet } from '../../../../../components/AccountModal/ModalSelectWallet';
import { Button } from '../../../../../components/Buttons';
import { ModalSuccess } from '../../../../../components/ModalSuccess';
import { TransactionStatus } from '../../../../../hooks/useGetTransactionStatus';
import useModal from '../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Trade } from '../../../../../state/dex/actions';
import {
  useExpertModeManager,
  useSetLimitOrderLastPairSwap,
} from '../../../../../state/dex/hooks';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { LimitOrderExpireType } from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import { useDexApprove } from '../../../../lending/hooks/useDexApprove';
import { useLimitOrderContract } from '../../../hooks/useLimitOrderContract';
import { useLimitOrderListOrder } from '../../../hooks/useLimitOrderListOrder';
import { useLimitOrderSwap } from '../../../hooks/useLimitOrderSwap';
import { useTokenListLogo } from '../../../hooks/useTokenListLogo';
import { LimitOrderConfirmSwap } from './LimitOrderConfirmSwap';

enum ButtonStatus {
  notConnect,
  loadBalance,
  notSelectedToken,
  duplicateToken,
  noRoute,
  notInput,
  notApprove,
  insufficientBalance,
  invalidRecipient,
  inSubmit,
  invalidPrice,
  ready,
}

export type LimitOrderSwapButtonProps = {
  expiredTimeType?: LimitOrderExpireType;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  inputAmount?: BigNumber;
  outputAmount?: BigNumber;
  trade?: Trade;
  limitPrice?: BigNumber;
  recipientError?: string;
  recipient?: string;
  onSwapCompleted?: () => void;
};

export const LimitOrderSwapButton: React.FC<LimitOrderSwapButtonProps> = ({
  inputCurrency,
  outputCurrency,
  inputAmount,
  outputAmount,
  limitPrice,
  trade,
  recipientError,
  recipient,
  expiredTimeType,
  onSwapCompleted,
}) => {
  const { account } = useUserWallet();
  const [connect] = useModal(<ModalSelectWallet />);
  const [loading, setLoading] = useState(false);
  const inputBalance = useTokenBalance(
    inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
  );
  const [isExpertMode] = useExpertModeManager();
  const { limitOrderContract } = useLimitOrderContract();
  const { isApproved } = useDexApprove(
    inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
    limitOrderContract?.address,
  );
  const [txHash, setTxHash] = useState<string>();
  const openOrder = useLimitOrderSwap(
    inputAmount,
    outputAmount,
    inputCurrency,
    outputCurrency,
    recipient,
    expiredTimeType,
  );
  const setLastPairSwap = useSetLimitOrderLastPairSwap();
  const getTokenLogo = useTokenListLogo();
  const { onLoad } = useLimitOrderListOrder();

  const status = useMemo(() => {
    if (!trade) {
      return ButtonStatus.noRoute;
    }
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!inputCurrency || !outputCurrency) {
      return ButtonStatus.notSelectedToken;
    }
    if (inputCurrency === outputCurrency) {
      return ButtonStatus.duplicateToken;
    }
    if (!(inputCurrency && outputCurrency && (inputAmount?.gt(0) || outputAmount?.gt(0)))) {
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
    if (!limitPrice) {
      return ButtonStatus.invalidPrice;
    }
    if (!isApproved) {
      return ButtonStatus.notApprove;
    }
    if (recipient && recipientError) {
      return ButtonStatus.invalidRecipient;
    }
    return ButtonStatus.ready;
  }, [
    account,
    inputCurrency,
    outputCurrency,
    inputAmount,
    outputAmount,
    inputBalance,
    loading,
    trade,
    limitPrice,
    isApproved,
    recipientError,
    recipient,
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
      case ButtonStatus.notSelectedToken:
        return `Select a token`;
      case ButtonStatus.notInput:
        return `Enter an amount`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.invalidPrice:
        return 'Invalid Price';
      case ButtonStatus.invalidRecipient:
        return recipientError;
      default:
        return 'Swap';
    }
  }, [recipientError, status]);

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
    async (tx?: TransactionResponse) => {
      setLastPairSwap(
        inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
        outputCurrency?.isNative ? outputCurrency?.symbol : outputCurrency?.wrapped?.address,
      );
      onSwapCompleted();
      setTxHash(tx?.hash);
      const result = await tx.wait();
      if (result?.status === TransactionStatus.SUCCESS) {
        onLoad?.();
      }
    },
    [
      inputCurrency?.isNative,
      inputCurrency?.symbol,
      inputCurrency?.wrapped?.address,
      onLoad,
      onSwapCompleted,
      outputCurrency?.isNative,
      outputCurrency?.symbol,
      outputCurrency?.wrapped?.address,
      setLastPairSwap,
    ],
  );

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const result = await openOrder();
      if (result?.tx) {
        onCompleted?.(result?.tx);
      }
      setLoading(false);
      return Promise.resolve();
    } catch (ex) {
      console.debug('swap error ', ex);
      setLoading(false);
    }
  }, [onCompleted, openOrder]);

  const onSubmitSwap = useCallback(() => {
    return execute();
  }, [execute]);

  const [showConfirm] = useModal(
    useMemo(() => {
      return (
        <LimitOrderConfirmSwap
          inputAmount={inputAmount}
          inputCurrency={inputCurrency}
          outputAmount={outputAmount}
          outputCurrency={outputCurrency}
          trade={trade}
          limitPrice={limitPrice}
          onSubmitSwap={onSubmitSwap}
        />
      );
    }, [
      inputAmount,
      inputCurrency,
      limitPrice,
      onSubmitSwap,
      outputAmount,
      outputCurrency,
      trade,
    ]),
    'LimitOrderConfirmSwap',
  );

  const onButtonClick = useCallback(() => {
    if (status === ButtonStatus.notConnect) {
      connect();
    } else {
      if (isExpertMode) {
        execute();
      } else {
        showConfirm();
      }
    }
  }, [status, isExpertMode, connect, execute, showConfirm]);

  return (
    <StyleButtonSwap
      onClick={onButtonClick}
      disabled={disabled}
      isLoading={status === ButtonStatus.inSubmit}
    >
      {buttonText}
    </StyleButtonSwap>
  );
};

const StyleButtonSwap = styled(Button)`
  font-weight: 500;
  font-size: 14px;
  ${screenUp('lg')`
    font-size: 16px;
  `}
`;
