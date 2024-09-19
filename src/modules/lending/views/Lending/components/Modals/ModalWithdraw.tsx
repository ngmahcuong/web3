import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import React, { useCallback, useMemo, useState } from 'react';
import { ModalSelectWallet } from '../../../../../../components/AccountModal/ModalSelectWallet';
import { BigNumberValue } from '../../../../../../components/BigNumberValue';
import { TokenInputWithMaxButton } from '../../../../../../components/TokenInput';
import useContractRegistry from '../../../../../../hooks/useContractRegistry';
import {
  TransactionStatus,
  useGetTransactionStatus,
} from '../../../../../../hooks/useGetTransactionStatus';
import { useHandleTransactionReceipt } from '../../../../../../hooks/useHandleTransactionReceipt';
import useModal from '../../../../../../hooks/useModal';
import {
  CurrencyThreshold,
  LendingPrecision,
  Precision,
  SafeLimitPrecision,
  TokenThreshold,
} from '../../../../../../utils/constants';
import { formatBigNumber, max, min } from '../../../../../../utils/numbers';
import { formatUnits } from '@ethersproject/units';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import { getPercentageDisplay } from '../../../../../../utils/percentage';
import { useUserWallet } from '../../../../../../providers/UserWalletProvider';
import Modal from '../../../../../../components/Modal';
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
import imgWithdraw from '../../../../../../assets/images/lending-confirm-withdraw.png';
import styled from 'styled-components';
import { ModalLendingSuccess } from './ModalLendingSuccess';
import { useCalcAccountHealth } from '../../../../hooks/useCalcAccountHealth';
import { useMarket } from '../../../../hooks/useLendingMarkets';
import {
  useIsEnteredMarket,
  useLendingUserInfoBalance,
  useLendingUserInfoPosition,
} from '../../../../hooks/useUserLendingHook';

export type ModalWithdrawProps = {
  onDismiss?: () => void;
  asset: string;
};

enum ButtonStatus {
  notConnect,
  notInput,
  insufficientBalance,
  insufficientLiquidity,
  overBorrowLimit,
  ready,
  inSubmit,
}

const ModalWithdraw: React.FC<ModalWithdrawProps> = ({ asset, onDismiss }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const registry = useContractRegistry();
  const { supplying } = useLendingUserInfoPosition(market?.asset);
  const { borrowLimit, borrowBalance, accountHealth, liquidationThreshold } =
    useLendingUserInfoBalance();
  const isEntered = useIsEnteredMarket(market?.marketAddress);
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

  const suppliedUnderlying = useMemo(() => {
    return supplying?.mul(market?.exchangeRate).div(Precision);
  }, [market?.exchangeRate, supplying]);

  const remainingSupply = useMemo(() => {
    if (!amount || !suppliedUnderlying) {
      return suppliedUnderlying;
    }
    return amount.gte(suppliedUnderlying) ? Zero : suppliedUnderlying.sub(amount);
  }, [amount, suppliedUnderlying]);

  const newLiquidationThreshold = useMemo(() => {
    if (!liquidationThreshold) {
      return;
    }
    if (!amount || !isEntered) {
      return liquidationThreshold;
    }
    const supplyInputValue = amount
      .mul(market?.underlyingPrice)
      .mul(market?.collateralFactor)
      .div(Precision)
      .div(Precision);
    return max(liquidationThreshold?.sub(supplyInputValue), Zero);
  }, [
    amount,
    liquidationThreshold,
    isEntered,
    market?.collateralFactor,
    market?.underlyingPrice,
  ]);

  const newBorrowLimitDisplay = useMemo(() => {
    if (!borrowLimit) {
      return {
        value: undefined,
        originalValue: undefined,
      };
    }
    if (!amount || !isEntered) {
      return {
        value: borrowLimit,
        originalValue: borrowLimit,
      };
    }
    const supplyInputValue = amount
      .mul(market?.underlyingPrice)
      .mul(market?.collateralFactor)
      .div(Precision)
      .div(Precision);
    return {
      value: max(borrowLimit?.sub(supplyInputValue), Zero),
      originalValue: borrowLimit?.sub(supplyInputValue),
    };
  }, [amount, borrowLimit, isEntered, market?.collateralFactor, market?.underlyingPrice]);

  const newAccountHealth = useCalcAccountHealth(newLiquidationThreshold, borrowBalance);

  const newBorrowLimitPercentageDisplay = useMemo(() => {
    const percentage =
      newBorrowLimitDisplay?.value?.eq(0) || !borrowBalance
        ? 0
        : borrowBalance.mul(1e3).div(newBorrowLimitDisplay?.value);
    const value = +formatUnits(percentage, 1);
    return {
      value,
      display: getPercentageDisplay(value),
      invalid: borrowBalance?.gt(Zero) && newBorrowLimitDisplay?.originalValue?.lte(Zero),
    };
  }, [borrowBalance, newBorrowLimitDisplay?.originalValue, newBorrowLimitDisplay?.value]);

  const [maxInput, isWithdrawAll] = useMemo(() => {
    if (!isEntered) {
      return [suppliedUnderlying, true];
    }

    if (borrowBalance?.eq(Zero)) {
      return [min(suppliedUnderlying, market?.marketLiquidity), true];
    }

    const minBorrowLimit = borrowBalance.mul(LendingPrecision).div(SafeLimitPrecision);

    if (minBorrowLimit.gte(borrowLimit)) {
      return [Zero, false];
    }

    const withdrawAllValue = suppliedUnderlying
      .mul(market?.underlyingPrice)
      .mul(market?.collateralFactor)
      .div(LendingPrecision)
      .div(LendingPrecision);

    if (borrowLimit.sub(withdrawAllValue).gte(minBorrowLimit)) {
      return [min(suppliedUnderlying, market?.marketLiquidity), true];
    }

    const safe80PercentageAmount = borrowLimit
      .sub(minBorrowLimit)
      .mul(LendingPrecision)
      .mul(LendingPrecision)
      .div(market?.collateralFactor)
      .div(market?.underlyingPrice);

    const safeMax = safe80PercentageAmount?.lte(suppliedUnderlying)
      ? min(safe80PercentageAmount, market?.marketLiquidity)
      : min(suppliedUnderlying, market?.marketLiquidity);

    return [max(safeMax, Zero), false];
  }, [
    isEntered,
    borrowBalance,
    borrowLimit,
    suppliedUnderlying,
    market?.underlyingPrice,
    market?.collateralFactor,
    market?.marketLiquidity,
  ]);

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
    if (amount?.gt(suppliedUnderlying || Zero)) {
      return ButtonStatus.insufficientBalance;
    }
    if (
      newBorrowLimitPercentageDisplay.value > 100 ||
      newBorrowLimitPercentageDisplay.invalid
    ) {
      return ButtonStatus.overBorrowLimit;
    }
    if (amount?.gt(market?.cash)) {
      return ButtonStatus.insufficientLiquidity;
    }
    return ButtonStatus.ready;
  }, [
    account,
    loading,
    amount,
    suppliedUnderlying,
    newBorrowLimitPercentageDisplay.value,
    newBorrowLimitPercentageDisplay.invalid,
    market?.cash,
  ]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.overBorrowLimit:
        return `Over borrow limit`;
      case ButtonStatus.inSubmit:
        return `Withdraw`;
      case ButtonStatus.insufficientLiquidity:
        return `Not Enough Liquidity`;
      default:
        return 'Withdraw';
    }
  }, [status]);

  const isShowErrorButton = useMemo(() => {
    switch (status) {
      case ButtonStatus.overBorrowLimit:
      case ButtonStatus.insufficientBalance:
        return true;
      case ButtonStatus.notInput:
      case ButtonStatus.inSubmit:
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
        return false;
      default:
        return false;
    }
  }, [status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notInput:
      case ButtonStatus.inSubmit:
      case ButtonStatus.insufficientBalance:
      case ButtonStatus.overBorrowLimit:
      case ButtonStatus.insufficientLiquidity:
        return true;
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
        return false;
      default:
        return false;
    }
  }, [status]);

  const successMessage = useMemo(() => {
    return `You Withdrawed ${formatBigNumber(
      amount,
      market?.assetDecimals,
      {
        fractionDigits: market.significantDigits || 3,
      },
      TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
    )} ${market?.asset}`;
  }, [amount, market?.asset, market?.assetDecimals, market.significantDigits]);

  const createTransaction = useCallback(async () => {
    if (amount.eq(suppliedUnderlying)) {
      // she want to withdraw all
      return (await marketToken.redeemAll()) as TransactionResponse;
    }
    return (await marketToken.redeemUnderlying(amount)) as TransactionResponse;
  }, [amount, marketToken, suppliedUnderlying]);

  const onWithdraw = useCallback(async () => {
    if (!marketToken || !amount) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    try {
      const tx = await handleTransactionReceipt(
        `Withdraw ${formatBigNumber(
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
    handleTransactionReceipt,
    market?.assetDecimals,
    market.significantDigits,
    market?.asset,
    createTransaction,
    getTransactionStatus,
  ]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      default:
        return onWithdraw();
    }
  }, [connect, onWithdraw, status]);

  const onClickBalance = useCallback(() => {
    setAmount(suppliedUnderlying);
  }, [suppliedUnderlying]);

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
        <CustomStyledModalImage src={imgWithdraw} />
        <StyledModalTitle>Withdraw {market?.asset}</StyledModalTitle>
        <StyledInputHeader>
          Amount
          <div className="balance">
            Supplying:
            <button onClick={onClickBalance}>
              <BigNumberValue
                value={suppliedUnderlying}
                decimals={market?.assetDecimals}
                fractionDigits={6}
                threshold={0.000001}
              />
            </button>
            <span>{market?.asset}</span>
          </div>
        </StyledInputHeader>
        <StyledInputContainer>
          <TokenInputWithMaxButton
            maxValue={maxInput}
            decimals={market?.assetDecimals}
            value={amount}
            symbol={market?.asset}
            onChange={setAmount}
            size="lg"
            skipCheckZero={!isWithdrawAll}
            maxValidateValue={suppliedUnderlying}
            inValid={newBorrowLimitPercentageDisplay.value > 100}
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
            <StyledRowTitle>Remaining Supply</StyledRowTitle>
            <StyledRowContent>
              <StyledRowValue>
                {remainingSupply ? (
                  <>
                    <BigNumberValue
                      value={remainingSupply}
                      decimals={market?.assetDecimals}
                      fractionDigits={market?.significantDigits || 2}
                      threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                    />
                    <span>{market?.asset}</span>
                  </>
                ) : (
                  '-'
                )}
              </StyledRowValue>
            </StyledRowContent>
          </StyledRow>
          <StyledRow>
            <StyledRowTitle>Health Factor</StyledRowTitle>
            <StyledRowContentWrap>
              <StyledRowContent>
                {amount && amount?.gt(Zero) && borrowBalance && borrowBalance?.gt(Zero) ? (
                  <>
                    <StyledRowValue
                      variant={
                        accountHealth < 1.1
                          ? 'danger'
                          : accountHealth < 1.5
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {accountHealth ? accountHealth.toFixed(2) : 0}
                    </StyledRowValue>
                    <i className="far fa-arrow-right" />
                  </>
                ) : null}
                <StyledRowValue
                  variant={
                    newAccountHealth < 1.1
                      ? 'danger'
                      : newAccountHealth < 1.5
                      ? 'warning'
                      : 'success'
                  }
                >
                  {newAccountHealth ? newAccountHealth?.toFixed(2) : 0}
                </StyledRowValue>
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

export default ModalWithdraw;
