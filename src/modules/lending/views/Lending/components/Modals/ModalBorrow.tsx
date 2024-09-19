import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ModalSelectWallet } from '../../../../../../components/AccountModal/ModalSelectWallet';
import { BigNumberValue } from '../../../../../../components/BigNumberValue';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import Modal from '../../../../../../components/Modal';
import { TokenInputWithMaxButton } from '../../../../../../components/TokenInput';
import useContractRegistry from '../../../../../../hooks/useContractRegistry';
import {
  TransactionStatus,
  useGetTransactionStatus,
} from '../../../../../../hooks/useGetTransactionStatus';
import { useHandleTransactionReceipt } from '../../../../../../hooks/useHandleTransactionReceipt';
import useModal from '../../../../../../hooks/useModal';
import { useUserWallet } from '../../../../../../providers/UserWalletProvider';
import {
  CurrencyThreshold,
  LendingPrecision,
  MaxLimitRatio,
  PercentageThreshold,
  Precision,
  SafeLimitPrecision,
  TokenThreshold,
} from '../../../../../../utils/constants';
import { formatBigNumber, min } from '../../../../../../utils/numbers';
import imgBorrow from '../../../../../../assets/images/lending-confirm-borrow.png';
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
import { useCalcAccountHealth } from '../../../../hooks/useCalcAccountHealth';
import { useMarket } from '../../../../hooks/useLendingMarkets';
import { useLendingUserInfoBalance } from '../../../../hooks/useUserLendingHook';
import { ModalLendingSuccess } from './ModalLendingSuccess';

export type ModalBorrowProps = {
  onDismiss?: () => void;
  asset: string;
};

enum ButtonStatus {
  notConnect,
  notInput,
  insufficientLiquidity,
  insufficientBalance,
  ready,
  inSubmit,
}

const ModalBorrow: React.FC<ModalBorrowProps> = ({ asset, onDismiss }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const registry = useContractRegistry();
  const { borrowLimit, borrowBalance, accountHealth, liquidationThreshold } =
    useLendingUserInfoBalance();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const getTransactionStatus = useGetTransactionStatus();
  const [connect] = useModal(<ModalSelectWallet />);
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const marketToken = useMemo(() => {
    return registry?.getMarketByAddress(market?.marketAddress);
  }, [registry, market?.marketAddress]);

  const amountValue = useMemo(() => {
    if (!amount || !market?.underlyingPrice) {
      return;
    }
    return amount.mul(market?.underlyingPrice).div(Precision);
  }, [amount, market?.underlyingPrice]);

  const newBorrowBalanceDisplay = useMemo(() => {
    if (!borrowBalance || !market?.underlyingPrice) {
      return undefined;
    }
    if (!amount) {
      return borrowBalance;
    }
    const borrowInputValue = amount.mul(market.underlyingPrice).div(Precision);
    return borrowBalance?.add(borrowInputValue);
  }, [amount, borrowBalance, market?.underlyingPrice]);

  const newAccountHealth = useCalcAccountHealth(liquidationThreshold, newBorrowBalanceDisplay);

  const availableToBorrow = useMemo(() => {
    if (!market?.underlyingPrice || !borrowLimit) {
      return Zero;
    }
    const safeMax = borrowLimit
      .mul(SafeLimitPrecision)
      .sub(borrowBalance.mul(LendingPrecision))
      .mul(MaxLimitRatio)
      .div(1e6)
      .div(market?.underlyingPrice);

    if (safeMax.lte(0)) {
      return Zero;
    }

    return min(safeMax, market?.marketLiquidity);
  }, [borrowBalance, borrowLimit, market?.marketLiquidity, market?.underlyingPrice]);

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    if (!amount || amount?.eq(Zero)) {
      return ButtonStatus.notInput;
    }
    if (amount?.gt(availableToBorrow || Zero)) {
      return ButtonStatus.insufficientBalance;
    }
    if (amount?.gt(market?.cash)) {
      return ButtonStatus.insufficientLiquidity;
    }
    return ButtonStatus.ready;
  }, [account, amount, availableToBorrow, loading, market?.cash]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient Collateral Balance`;
      case ButtonStatus.insufficientLiquidity:
        return `Not Enough Liquidity`;
      case ButtonStatus.inSubmit:
        return `Borrow`;
      default:
        return 'Borrow';
    }
  }, [status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notInput:
      case ButtonStatus.inSubmit:
      case ButtonStatus.insufficientBalance:
      case ButtonStatus.insufficientLiquidity:
        return true;
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
      default:
        return false;
    }
  }, [status]);

  const isShowErrorButton = useMemo(() => {
    switch (status) {
      case ButtonStatus.insufficientBalance:
      case ButtonStatus.insufficientLiquidity:
        return true;
      case ButtonStatus.notInput:
      case ButtonStatus.inSubmit:
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
      default:
        return false;
    }
  }, [status]);

  const createTransaction = useCallback(async () => {
    return (await marketToken.borrow(amount)) as TransactionResponse;
  }, [amount, marketToken]);

  const successMessage = useMemo(() => {
    return `You Borrowed ${formatBigNumber(
      amount,
      market?.assetDecimals,
      {
        fractionDigits: market.significantDigits || 3,
      },
      TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
    )} ${market?.asset}`;
  }, [amount, market?.asset, market?.assetDecimals, market.significantDigits]);

  const onBorrow = useCallback(async () => {
    if (!marketToken || !amount) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    if (market?.borrowPaused) {
      setErrorMessage('Borrow paused');
      setLoading(false);
      return;
    }
    try {
      const tx = await handleTransactionReceipt(
        `Borrow ${formatBigNumber(
          amount,
          market?.assetDecimals,
          {
            fractionDigits: market.significantDigits || 3,
          },
          TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
        )} ${market?.asset}`,
        createTransaction,
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
    market?.borrowPaused,
    market?.assetDecimals,
    market.significantDigits,
    market?.asset,
    handleTransactionReceipt,
    createTransaction,
    getTransactionStatus,
  ]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      default:
        return onBorrow();
    }
  }, [connect, onBorrow, status]);

  const onClickBalance = useCallback(() => {
    setAmount(availableToBorrow);
  }, [availableToBorrow]);

  if (txHash) {
    return (
      <ModalLendingSuccess
        symbol={asset}
        message={successMessage}
        tx={txHash}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <Modal size="xs">
      <CustomModalHeader>
        <StyledModalClose onClick={onDismiss}>
          <i className="fal fa-times" />
        </StyledModalClose>
        <CustomStyledModalImage src={imgBorrow} />
        <StyledModalTitle>Borrow {market?.asset}</StyledModalTitle>
        <StyledInputHeader>
          Amount
          <div className="balance">
            Available:
            <button onClick={onClickBalance}>
              <BigNumberValue
                value={availableToBorrow}
                decimals={market?.assetDecimals}
                fractionDigits={market?.significantDigits || 2}
                threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
              />
            </button>
            <span>{market?.asset}</span>
          </div>
        </StyledInputHeader>
        <StyledInputContainer>
          <TokenInputWithMaxButton
            maxValue={availableToBorrow}
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
        <StyledGroupContent>
          <StyledGroupContentTitle>Transaction Overview</StyledGroupContentTitle>
          <StyledRow>
            <StyledRowTitle>Borrow APY</StyledRowTitle>
            <StyledRowContent>
              <StyledRowValue>
                <BigNumberValue
                  value={market?.borrowRatePerYear}
                  decimals={18}
                  percentage
                  fractionDigits={2}
                  threshold={PercentageThreshold}
                />
              </StyledRowValue>
            </StyledRowContent>
          </StyledRow>
          {/* <StyledRow>
            <StyledRowTitle>Reward APY</StyledRowTitle>
            <StyledRowContent>
              <StyledRowValue>
                <FormatNumber
                  value={market?.borrowDistributionApy || 0}
                  percentage
                  fractionDigits={2}
                  threshold={PercentageThreshold}
                />
              </StyledRowValue>
            </StyledRowContent>
          </StyledRow> */}
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
          isLoading={status === ButtonStatus.inSubmit}
          disabled={disabled}
          onClick={onButtonClick}
          error={isShowErrorButton}
        >
          {buttonText}
        </StyledButton>
        <ErrorMessage errorMessage={errorMessage} />
      </CustomModalContent>
    </Modal>
  );
};

const CustomStyledModalImage = styled(StyledModalImage)`
  width: 115px;
`;

export default ModalBorrow;
