import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../../components/Buttons';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
import useModal from '../../../../../hooks/useModal';
import { PairInfo, PairState } from '../../../models/Pair';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { useUniswapRouter } from '../../../hooks/useUniswapRouter';
import { ModalConfirmRemoveLP } from './ModalConfirmRemoveLP';
import { useDexApprove } from '../../../../lending/hooks/useDexApprove';
import { useIsExpertMode } from '../../../../../state/dex/hooks';
import { ModalSuccess } from '../../../../../components/ModalSuccess';
import { useRemoveLiquidity } from '../../../hooks/useRemoveLiquidity';

enum ButtonStatus {
  notConnect,
  notApprove,
  notInput,
  insufficientBalance,
  duplicateToken,
  ready,
  inSubmit,
  invalid,
  loadingPair,
}

type ButtonRemoveLPProps = {
  pairInfo: PairInfo;
  liquidity: BigNumber;
  amountAMin: BigNumber;
  amountBMin: BigNumber;
  onRemoved: () => void;
  signatureData: { v: number; r: string; s: string; deadline: number } | null;
  pairState: PairState;
  loadingPair: boolean;
};

export const ButtonRemoveLP: React.FC<ButtonRemoveLPProps> = ({
  pairInfo,
  liquidity,
  amountAMin,
  amountBMin,
  onRemoved,
  signatureData,
  pairState,
  loadingPair,
}) => {
  const { account } = useUserWallet();
  const { currencyA, currencyB, liquidityToken } = pairInfo;
  const liquidityBalance = useTokenBalance(liquidityToken);
  const [connect] = useModalConnectWallet();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [swapRouter] = useUniswapRouter();
  const isExpertMode = useIsExpertMode();

  const { isApproved } = useDexApprove(liquidityToken, swapRouter?.address);

  const executeRemove = useRemoveLiquidity(
    currencyA,
    currencyB,
    liquidity,
    amountAMin,
    amountBMin,
    signatureData,
    isApproved,
  );

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (loadingPair) {
      return ButtonStatus.loadingPair;
    }
    if (pairState !== PairState.EXISTS) {
      return ButtonStatus.invalid;
    }
    if (!liquidity || liquidity?.eq(Zero)) {
      return ButtonStatus.notInput;
    }
    if (liquidity && liquidityBalance && liquidity?.gt(liquidityBalance)) {
      return ButtonStatus.insufficientBalance;
    }
    if (!isApproved && !signatureData) {
      return ButtonStatus.notApprove;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    return ButtonStatus.ready;
  }, [
    account,
    loadingPair,
    pairState,
    liquidity,
    liquidityBalance,
    isApproved,
    signatureData,
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
      case ButtonStatus.loadingPair:
        return `Loading pair`;
      case ButtonStatus.invalid:
        return `Invalid pair`;
      case ButtonStatus.notInput:
        return `Enter an amount`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      default:
        return 'Remove';
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

  const onRemove = useCallback(async () => {
    if (!liquidity) {
      return;
    }
    setLoading(true);
    const result = await executeRemove();
    if (result?.tx) {
      onRemoved();
      setTxHash(result?.tx?.hash);
    }

    setLoading(false);
  }, [executeRemove, liquidity, onRemoved]);

  const onRemovedInModal = useCallback(
    (txHash: string) => {
      onRemoved();
      setTxHash(txHash);
    },
    [onRemoved],
  );

  const [showConfirm] = useModal(
    <ModalConfirmRemoveLP
      onRemoved={onRemovedInModal}
      pairInfo={pairInfo}
      liquidity={liquidity}
      signatureData={signatureData}
      isApproved={isApproved}
    />,
  );

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      default:
        return isExpertMode ? onRemove() : showConfirm();
    }
  }, [connect, onRemove, status, isExpertMode, showConfirm]);

  return (
    <StyledButton
      isLoading={status === ButtonStatus.inSubmit || status === ButtonStatus.loadingPair}
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
