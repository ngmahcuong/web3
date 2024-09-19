import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import React, { useCallback, useMemo, useState } from 'react';
import { ModalSelectWallet } from '../../../../../../components/AccountModal/ModalSelectWallet';
import { BigNumberValue } from '../../../../../../components/BigNumberValue';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import Modal from '../../../../../../components/Modal';
import { TokenInputWithMaxButton } from '../../../../../../components/TokenInput';
import { useApprove } from '../../../../../../hooks/useApprove';
import useContractRegistry from '../../../../../../hooks/useContractRegistry';
import {
  TransactionStatus,
  useGetTransactionStatus,
} from '../../../../../../hooks/useGetTransactionStatus';
import { useHandleTransactionReceipt } from '../../../../../../hooks/useHandleTransactionReceipt';
import useModal from '../../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../../providers/UserWalletProvider';
import { useTokenBalance } from '../../../../../../state/user/hooks';
import {
  CurrencyThreshold,
  Precision,
  TokenThreshold,
} from '../../../../../../utils/constants';
import { formatBigNumber, min } from '../../../../../../utils/numbers';
import imgRepay from '../../../../../../assets/images/lending-confirm-repay.png';
import {
  CustomModalContent,
  CustomModalHeader,
  StyledButton,
  StyledGroupContent,
  StyledGroupContentTitle,
  StyledInputContainer,
  StyledInputHeader,
  StyledModalClose,
  StyledModalImage,
  StyledModalTitle,
  StyledRow,
  StyledRowContent,
  StyledRowContentWrap,
  StyledRowSubValue,
  StyledRowTitle,
  StyledRowValue,
} from './ModalShare';
import styled from 'styled-components';
import { ModalLendingSuccess } from './ModalLendingSuccess';
import { useCalcAccountHealth } from '../../../../hooks/useCalcAccountHealth';
import { useMarket } from '../../../../hooks/useLendingMarkets';
import {
  useLendingUserInfoBalance,
  useLendingUserInfoPosition,
} from '../../../../hooks/useUserLendingHook';

export type ModalRepayProps = {
  onDismiss?: () => void;
  asset: string;
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

const ModalRepay: React.FC<ModalRepayProps> = ({ asset, onDismiss }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const registry = useContractRegistry();
  const { borrowBalance, accountHealth, liquidationThreshold } = useLendingUserInfoBalance();
  const { borrowing } = useLendingUserInfoPosition(market?.asset);
  const balance = useTokenBalance(market?.assetAddress);
  const getTransactionStatus = useGetTransactionStatus();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [connect] = useModal(<ModalSelectWallet />);
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const {
    approve,
    isApproved,
    loadingSubmit,
    loading: loadingGetApproveState,
  } = useApprove(market?.asset, market?.marketAddress);

  const marketToken = useMemo(() => {
    return registry?.getMarketByAddress(market?.marketAddress);
  }, [registry, market?.marketAddress]);

  const amountValue = useMemo(() => {
    if (!amount || !market?.underlyingPrice) {
      return;
    }
    return amount.mul(market?.underlyingPrice).div(Precision);
  }, [amount, market?.underlyingPrice]);

  const newBorrowBalance = useMemo(() => {
    if (!borrowBalance) {
      return undefined;
    }
    if (!amount) {
      return borrowBalance;
    }
    const borrowInputValue = amount.mul(market?.underlyingPrice).div(Precision);
    return borrowBalance?.sub(borrowInputValue)?.gt(Zero)
      ? borrowBalance?.sub(borrowInputValue)
      : Zero;
  }, [amount, borrowBalance, market?.underlyingPrice]);

  const newAccountHealth = useCalcAccountHealth(liquidationThreshold, newBorrowBalance);

  const borrowingValue = useMemo(() => {
    if (!borrowing || !market?.underlyingPrice) {
      return;
    }
    return borrowing.mul(market.underlyingPrice).div(Precision);
  }, [borrowing, market?.underlyingPrice]);

  const newBorrowing = useMemo(() => {
    if (!amount || !borrowing) {
      return borrowing;
    }
    return amount.gte(borrowing) ? Zero : borrowing.sub(amount);
  }, [amount, borrowing]);

  const newBorrowingValue = useMemo(() => {
    if (!newBorrowing || !market?.underlyingPrice) {
      return;
    }
    return newBorrowing.mul(market.underlyingPrice).div(Precision);
  }, [newBorrowing, market?.underlyingPrice]);

  const inputMax = useMemo(() => {
    return min(balance, borrowing);
  }, [balance, borrowing]);

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!isApproved && loadingSubmit) {
      return ButtonStatus.inApprove;
    }
    if (!isApproved && !loadingGetApproveState) {
      return ButtonStatus.notApprove;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    if (!amount || amount?.eq(Zero)) {
      return ButtonStatus.notInput;
    }
    if (amount?.gt(inputMax || Zero)) {
      return ButtonStatus.insufficientBalance;
    }
    return ButtonStatus.ready;
  }, [account, amount, inputMax, isApproved, loading, loadingGetApproveState, loadingSubmit]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect`;
      case ButtonStatus.notApprove:
      case ButtonStatus.inApprove:
        return `Enable`;
      case ButtonStatus.insufficientBalance:
        return `No Balance to Repay`;
      case ButtonStatus.inSubmit:
        return `Repay`;
      default:
        return 'Repay';
    }
  }, [status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notInput:
      case ButtonStatus.inSubmit:
      case ButtonStatus.insufficientBalance:
      case ButtonStatus.inApprove:
        return true;
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
      case ButtonStatus.notApprove:
        return false;
      default:
        return false;
    }
  }, [status]);

  const successMessage = useMemo(() => {
    return `You Repayed ${formatBigNumber(
      amount,
      market?.assetDecimals,
      {
        fractionDigits: market.significantDigits || 3,
      },
      TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
    )} ${market?.asset}`;
  }, [amount, market?.asset, market?.assetDecimals, market.significantDigits]);

  const repay = useCallback(async () => {
    const isMax = amount.eq(borrowing);
    return (await marketToken.repay(amount, isMax, account)) as TransactionResponse;
  }, [account, amount, borrowing, marketToken]);

  const onRepay = useCallback(async () => {
    if (!marketToken || !amount) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    try {
      const tx = await handleTransactionReceipt(
        `Repay ${formatBigNumber(
          amount,
          market?.assetDecimals,
          {
            fractionDigits: market.significantDigits || 3,
          },
          TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
        )} ${market?.asset}`,
        repay,
      );
      if (tx) {
        await tx.wait();
        const txStatus = await getTransactionStatus(tx.hash);
        if (txStatus.status === TransactionStatus.SUCCESS) {
          setLoading(false);
          setTxHash(tx.hash);
        } else if (txStatus.status === TransactionStatus.ERROR) {
          setLoading(false);
          setErrorMessage(txStatus.message);
        }
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    marketToken,
    amount,
    handleTransactionReceipt,
    market?.assetDecimals,
    market.significantDigits,
    market?.asset,
    repay,
    getTransactionStatus,
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
        return onRepay();
    }
  }, [approve, connect, onRepay, status]);

  const onClickBalance = useCallback(() => {
    setAmount(inputMax);
  }, [inputMax]);

  if (txHash) {
    return (
      <ModalLendingSuccess
        symbol={asset}
        message={successMessage}
        tx={txHash}
        onDismiss={onDismiss}
        hideMetamaskButton
      />
    );
  }

  return (
    <Modal size="xs">
      <CustomModalHeader>
        <StyledModalClose onClick={onDismiss}>
          <i className="fal fa-times" />
        </StyledModalClose>
        <CustomStyledModalImage src={imgRepay} />
        <StyledModalTitle>Repay {market?.asset}</StyledModalTitle>
        <StyledInputHeader>
          Amount
          <div className="balance">
            Balance:
            <button onClick={onClickBalance}>
              <BigNumberValue
                value={inputMax}
                decimals={market?.assetDecimals}
                fractionDigits={4}
                threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
              />
            </button>
            <span>{market?.asset}</span>
          </div>
        </StyledInputHeader>
        <StyledInputContainer>
          <TokenInputWithMaxButton
            maxValue={inputMax}
            decimals={market?.assetDecimals}
            symbol={market?.asset}
            value={amount}
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
                    },
                    CurrencyThreshold,
                  )}`
                : '$0'
            }
          />
        </StyledInputContainer>
      </CustomModalHeader>
      <CustomModalContent>
        <StyledGroupContent>
          <StyledGroupContentTitle>Transaction Overview</StyledGroupContentTitle>
          <StyledRow>
            <StyledRowTitle>Remaining Debt</StyledRowTitle>
            <StyledRowContent>
              <StyledRowValue>
                <StyledRowContentWrap>
                  <StyledRowContent>
                    <StyledRowValue>
                      <BigNumberValue
                        value={borrowing}
                        fractionDigits={market?.significantDigits || 2}
                        decimals={market?.assetDecimals}
                        threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                      />
                      <span>{market?.asset}</span>
                    </StyledRowValue>
                    {amount && amount?.gt(Zero) ? (
                      <>
                        <i className="far fa-arrow-right" />
                        <StyledRowValue>
                          <BigNumberValue
                            value={newBorrowing}
                            fractionDigits={market?.significantDigits || 2}
                            decimals={market?.assetDecimals}
                            threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                          />
                          <span>{market?.asset}</span>
                        </StyledRowValue>
                      </>
                    ) : null}
                  </StyledRowContent>
                  <StyledRowSubValue>
                    <BigNumberValue
                      value={borrowingValue}
                      decimals={18}
                      threshold={CurrencyThreshold}
                      currency="USD"
                    />
                    {amount && amount?.gt(Zero) ? (
                      <>
                        <i className="far fa-arrow-right" />
                        <BigNumberValue
                          value={newBorrowingValue}
                          fractionDigits={market?.significantDigits || 2}
                          decimals={18}
                          threshold={CurrencyThreshold}
                          currency="USD"
                        />
                      </>
                    ) : null}
                  </StyledRowSubValue>
                </StyledRowContentWrap>
              </StyledRowValue>
            </StyledRowContent>
          </StyledRow>
          <StyledRow>
            <StyledRowTitle>Health Factor</StyledRowTitle>
            <StyledRowContentWrap>
              <StyledRowContent>
                <StyledRowValue
                  variant={
                    accountHealth < 1.1 ? 'danger' : accountHealth < 1.5 ? 'warning' : 'success'
                  }
                >
                  {accountHealth ? accountHealth?.toFixed(2) : 0}
                </StyledRowValue>
                {amount && amount?.gt(Zero) ? (
                  <>
                    <i className="far fa-arrow-right" />
                    <StyledRowValue
                      variant={
                        newAccountHealth < 1.1
                          ? 'danger'
                          : newAccountHealth < 1.5
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {newAccountHealth ? newAccountHealth.toFixed(2) : 0}
                    </StyledRowValue>
                  </>
                ) : null}
              </StyledRowContent>
              <StyledRowSubValue>Liquidation at &lt;1.0</StyledRowSubValue>
            </StyledRowContentWrap>
          </StyledRow>
        </StyledGroupContent>
        <StyledButton
          size="md"
          isLoading={status === ButtonStatus.inSubmit || status === ButtonStatus.inApprove}
          disabled={disabled}
          onClick={onButtonClick}
        >
          {buttonText}
        </StyledButton>
        <ErrorMessage errorMessage={errorMessage} />
      </CustomModalContent>
    </Modal>
  );
};

const CustomStyledModalImage = styled(StyledModalImage)`
  width: 110px;
`;

export default ModalRepay;
