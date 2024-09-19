import React, { useCallback, useState } from 'react';
import { useMemo } from 'react';
import { Zero } from '@ethersproject/constants';
import styled from 'styled-components';
import { Button } from '../../../../../components/Buttons';
import { BigNumber } from 'ethers';
import { ModalConfirmAddLP } from './ModalConfirmAddLP';
import { PairInfo } from '../../../models/Pair';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
import useModal from '../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Field } from '../hook/useEstimateDependentAmount';
import { useUniswapRouter } from '../../../hooks/useUniswapRouter';
import { useDexApprove } from '../../../../lending/hooks/useDexApprove';
import { useIsExpertMode } from '../../../../../state/dex/hooks';
import { useAddLiquidity } from '../../../hooks/useAddLiquidity';
import { ModalSuccess } from '../../../../../components/ModalSuccess';
import { useEffect } from 'react';

enum ButtonStatus {
  notConnect,
  loadBalance,
  notSelectedToken,
  duplicateToken,
  notApprove,
  notInput,
  insufficientBalance,
  ready,
  inSubmit,
}

type ButtonAddLPProps = {
  pairInfo: PairInfo;
  independentField: Field;
  amountA: BigNumber;
  amountB: BigNumber;
  formattedMinAmounts: { [x: string]: BigNumber };
  onAdded: () => void;
  currencyABalance: BigNumber;
  currencyBBalance: BigNumber;
};

export const ButtonAddLP: React.FC<ButtonAddLPProps> = ({
  pairInfo,
  independentField,
  amountA,
  amountB,
  formattedMinAmounts,
  onAdded,
  currencyABalance,
  currencyBBalance,
}) => {
  const { account } = useUserWallet();
  const { currencyA, currencyB } = pairInfo;
  // const savePool = useSavePool();
  const [connect] = useModalConnectWallet();
  const [loading, setLoading] = useState(false);
  const [swapRouter] = useUniswapRouter();
  const isExpertMode = useIsExpertMode();
  const executeAdd = useAddLiquidity(
    currencyA,
    currencyB,
    amountA,
    amountB,
    formattedMinAmounts,
  );
  const [txHash, setTxHash] = useState<string>();

  const { isApproved: isApprovedA } = useDexApprove(
    currencyA?.isNative ? currencyA?.symbol : currencyA?.wrapped?.address,
    swapRouter?.address,
  );
  const { isApproved: isApprovedB } = useDexApprove(
    currencyB?.isNative ? currencyB?.symbol : currencyB?.wrapped?.address,
    swapRouter?.address,
  );

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!currencyA || !currencyB) {
      return ButtonStatus.notSelectedToken;
    }
    if (currencyA?.wrapped.address === currencyB?.wrapped.address) {
      return ButtonStatus.duplicateToken;
    }
    if (!amountA || amountA?.eq(Zero) || !amountB || amountB?.eq(Zero)) {
      return ButtonStatus.notInput;
    }
    if (
      (amountA && currencyABalance && amountA?.gt(currencyABalance)) ||
      (amountB && currencyBBalance && amountB?.gt(currencyBBalance))
    ) {
      return ButtonStatus.insufficientBalance;
    }
    if (!isApprovedA || !isApprovedB) {
      return ButtonStatus.notApprove;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    return ButtonStatus.ready;
  }, [
    account,
    currencyA,
    currencyB,
    amountA,
    amountB,
    currencyABalance,
    currencyBBalance,
    isApprovedA,
    isApprovedB,
    loading,
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
      case ButtonStatus.duplicateToken:
        return `Invalid pair`;
      default:
        return 'Add Liquidity';
    }
  }, [status]);

  const [showModalTransactionSubmitted] = useModal(
    useMemo(() => {
      return <ModalSuccess title={'Transaction submitted'} tx={txHash} hideMetamaskButton />;
    }, [txHash]),
  );

  useEffect(() => {
    if (txHash) {
      showModalTransactionSubmitted();
    }
  }, [showModalTransactionSubmitted, txHash]);

  const onAdd = useCallback(async () => {
    if (!amountA || !amountB) {
      return;
    }
    setLoading(true);
    const result = await executeAdd();
    if (result) {
      onAdded();
      setTxHash(result?.tx?.hash);
    }
    setLoading(false);
  }, [amountA, amountB, executeAdd, onAdded]);

  const onAddedInModal = useCallback(
    (txHash: string) => {
      onAdded();
      setTxHash(txHash);
    },
    [onAdded],
  );

  const [showConfirm] = useModal(
    <ModalConfirmAddLP
      onAdded={onAddedInModal}
      pairInfo={pairInfo}
      independentField={independentField}
      amountA={amountA}
      amountB={amountB}
    />,
  );

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      default:
        return isExpertMode ? onAdd() : showConfirm();
    }
  }, [status, isExpertMode, onAdd, showConfirm, connect]);

  return (
    <StyledButton
      isLoading={status === ButtonStatus.inSubmit}
      onClick={onButtonClick}
      disabled={disabled}
    >
      {buttonText}
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  font-weight: 500;
`;
