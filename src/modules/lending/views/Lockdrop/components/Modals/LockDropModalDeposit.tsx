import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import imgDeposit from '../../../../../../assets/images/lending-confirm-supply.png';
import { ModalSelectWallet } from '../../../../../../components/AccountModal/ModalSelectWallet';
import { BigNumberValue } from '../../../../../../components/BigNumberValue';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import Modal from '../../../../../../components/Modal';
import { TokenInputWithMaxButton } from '../../../../../../components/TokenInput';
import { getLockdropConfig, getTokenByAddress } from '../../../../../../config';
import { useApprove } from '../../../../../../hooks/useApprove';
import {
  TransactionStatus,
  useGetTransactionStatus,
} from '../../../../../../hooks/useGetTransactionStatus';
import { useHandleTransactionReceipt } from '../../../../../../hooks/useHandleTransactionReceipt';
import useModal from '../../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../../providers/UserWalletProvider';
import { useTokenBalance, useWatchTokenBalance } from '../../../../../../state/user/hooks';
import {
  CurrencyThreshold,
  Precision,
  TokenThreshold,
} from '../../../../../../utils/constants';
import { formatBigNumber } from '../../../../../../utils/numbers';
import { useLockdrop } from '../../../../hooks/useLockdrop';
import { useLockDropMarketAsset } from '../../hooks/useLockDropMarketAsset';
import {
  CustomModalContent,
  CustomModalHeader,
  StyledButton,
  StyledInputContainer,
  StyledInputHeader,
  StyledModalClose,
  StyledModalImage,
  StyledModalTitle,
} from './../../../Lending/components/Modals/ModalShare';

export type LockDropModalDepositProps = {
  onDismiss?: () => void;
  address: string;
  poolId: number;
};

enum ButtonStatus {
  notConnect,
  notApprove,
  inApprove,
  notInput,
  insufficientBalance,
  ready,
  inSubmit,
}

const LockDropModalDeposit: React.FC<LockDropModalDepositProps> = ({
  address,
  poolId,
  onDismiss,
}) => {
  const { chainId, account } = useUserWallet();
  const lockDropConfig = getLockdropConfig(chainId);
  const lockDrop = useLockdrop();
  const token = useMemo(() => {
    return getTokenByAddress(chainId, address);
  }, [address, chainId]);
  const { market } = useLockDropMarketAsset(address);
  const balance = useTokenBalance(address);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const getTransactionStatus = useGetTransactionStatus();
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const { approve, isApproved, loadingSubmit } = useApprove(
    token.symbol,
    lockDropConfig.address,
  );
  const fetchTokenBalance = useWatchTokenBalance();

  useEffect(() => {
    fetchTokenBalance([token?.address]);
  }, [fetchTokenBalance, token?.address]);

  const [connect] = useModal(<ModalSelectWallet />);

  const amountValue = useMemo(() => {
    if (!amount || !market?.underlyingPrice || !market?.exchangeRate) {
      return;
    }
    return amount
      .mul(market?.underlyingPrice)
      .mul(market.exchangeRate)
      .div(Precision)
      .div(Precision);
  }, [amount, market.exchangeRate, market?.underlyingPrice]);

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!isApproved && loadingSubmit) {
      return ButtonStatus.inApprove;
    }
    if (!isApproved) {
      return ButtonStatus.notApprove;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    if (!amount || amount?.eq(Zero)) {
      return ButtonStatus.notInput;
    }
    if (amount?.gt(balance || Zero)) {
      return ButtonStatus.insufficientBalance;
    }
    return ButtonStatus.ready;
  }, [account, amount, balance, isApproved, loading, loadingSubmit]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect`;
      case ButtonStatus.notApprove:
      case ButtonStatus.inApprove:
        return `Approve`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient Balance`;
      case ButtonStatus.inSubmit:
        return `Deposit`;
      default:
        return 'Deposit';
    }
  }, [status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notInput:
      case ButtonStatus.inSubmit:
      case ButtonStatus.inApprove:
      case ButtonStatus.insufficientBalance:
        return true;
      case ButtonStatus.notConnect:
      case ButtonStatus.notApprove:
      case ButtonStatus.ready:
        return false;
      default:
        return false;
    }
  }, [status]);

  const error = useMemo(() => {
    switch (status) {
      case ButtonStatus.insufficientBalance:
        return true;
      default:
        return false;
    }
  }, [status]);

  const createTransaction = useCallback(async () => {
    return (await lockDrop.deposit(poolId, amount, account)) as TransactionResponse;
  }, [account, amount, lockDrop, poolId]);

  const onDeposit = useCallback(async () => {
    if (!token || !amount) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    try {
      const tx = await handleTransactionReceipt(
        `Deposit ${formatBigNumber(
          amount,
          token?.decimals,
          {
            fractionDigits: market?.significantDigits || 3,
          },
          TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
        )} ${token?.name}`,
        createTransaction,
      );
      if (tx) {
        await tx.wait();
        const txStatus = await getTransactionStatus(tx.hash);

        if (txStatus.status === TransactionStatus.SUCCESS) {
          setLoading(false);
          onDismiss();
        } else if (txStatus.status === TransactionStatus.ERROR) {
          setLoading(false);
          setErrorMessage(txStatus.message);
        }
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    amount,
    createTransaction,
    getTransactionStatus,
    handleTransactionReceipt,
    market?.asset,
    market?.significantDigits,
    onDismiss,
    token,
  ]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      case ButtonStatus.notApprove: {
        return approve();
      }
      default:
        return onDeposit();
    }
  }, [approve, connect, onDeposit, status]);

  const onClickBalance = useCallback(() => {
    setAmount(balance);
  }, [balance]);

  return (
    <Modal size="xs">
      <CustomModalHeader>
        <StyledModalClose onClick={onDismiss}>
          <i className="fal fa-times" />
        </StyledModalClose>
        <StyledModalImage src={imgDeposit} />
        <StyledModalTitle>Deposit {token?.name}</StyledModalTitle>
        <StyledInputHeader>
          Amount
          <div className="balance">
            Wallet balance:
            <button onClick={onClickBalance}>
              <BigNumberValue value={balance} decimals={token?.decimals} fractionDigits={4} />
            </button>
            <span>{token?.name}</span>
          </div>
        </StyledInputHeader>
        <StyledInputContainer>
          <TokenInputWithMaxButton
            maxValue={balance}
            decimals={token?.decimals}
            value={amount}
            symbol={token?.symbol}
            onChange={setAmount}
            size="lg"
            subValue={
              amountValue
                ? `${formatBigNumber(
                    amountValue,
                    18,
                    {
                      fractionDigits: 2,
                      currency: 'USD',
                      compact: false,
                    },
                    CurrencyThreshold,
                  )}`
                : '$0'
            }
          />
        </StyledInputContainer>
      </CustomModalHeader>
      <CustomModalContent>
        <StyledButton
          size="md"
          isLoading={status === ButtonStatus.inSubmit || status === ButtonStatus.inApprove}
          disabled={disabled}
          error={error}
          onClick={onButtonClick}
        >
          {buttonText}
        </StyledButton>
        <ErrorMessage errorMessage={errorMessage} />
      </CustomModalContent>
    </Modal>
  );
};

export default LockDropModalDeposit;
