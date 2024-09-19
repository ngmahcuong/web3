import React, { useCallback, useMemo, useState } from 'react';
import { BigNumberValue } from '../../../../../../components/BigNumberValue';
import { TransactionResponse } from '@ethersproject/providers';
import {
  TransactionStatus,
  useGetTransactionStatus,
} from '../../../../../../hooks/useGetTransactionStatus';
import { useHandleTransactionReceipt } from '../../../../../../hooks/useHandleTransactionReceipt';
import { LendingPrecision, Precision, TokenThreshold } from '../../../../../../utils/constants';
import { Zero } from '@ethersproject/constants';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import { useUserWallet } from '../../../../../../providers/UserWalletProvider';
import {
  CustomModalContent,
  CustomModalHeader,
  StyledButton,
  StyledGroupContent,
  StyledGroupContentTitle,
  StyledModalClose,
  StyledModalDes,
  StyledModalImage,
  StyledModalTitle,
  StyledRow,
  StyledRowContent,
  StyledRowContentWrap,
  StyledRowSubValue,
  StyledRowTitle,
  StyledRowValue,
} from './ModalShare';
import Modal from '../../../../../../components/Modal';
import imgEnable from '../../../../../../assets/images/lending-confirm-enable.png';
import styled from 'styled-components';
import { max } from '../../../../../../utils/numbers';
import { useComptroller } from '../../../../hooks/useComptroller';
import { useCalcAccountHealth } from '../../../../hooks/useCalcAccountHealth';
import { useMarket } from '../../../../hooks/useLendingMarkets';
import {
  useIsEnteredMarket,
  useLendingUserInfoBalance,
  useLendingUserInfoPosition,
} from '../../../../hooks/useUserLendingHook';
import { ModalLendingSuccess } from './ModalLendingSuccess';

export type ModalDisableProps = {
  onDismiss?: () => void;
  asset: string;
};

enum CanExitStatus {
  overBorrowLimit,
  needRepayAsset,
  ready,
}

const ModalDisableCollateral: React.FC<ModalDisableProps> = ({ asset, onDismiss }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const comptroller = useComptroller();
  const { borrowLimit, borrowBalance, accountHealth, liquidationThreshold } =
    useLendingUserInfoBalance();
  const { supplying, borrowing } = useLendingUserInfoPosition(market?.asset);
  const isCollateralEnabled = useIsEnteredMarket(market?.marketAddress);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const getTransactionStatus = useGetTransactionStatus();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const suppliedUnderlying = useMemo(() => {
    return supplying?.mul(market?.exchangeRate).div(Precision);
  }, [market?.exchangeRate, supplying]);

  const supplyingValue = useMemo(() => {
    if (!market || !supplying) {
      return Zero;
    }
    return (
      supplying
        .mul(market.exchangeRate)
        .mul(market.underlyingPrice)
        .mul(market.collateralFactor)
        .div(LendingPrecision)
        .div(LendingPrecision)
        .div(LendingPrecision) || Zero
    );
  }, [market, supplying]);

  const newLiquidationThreshold = useMemo(() => {
    if (!liquidationThreshold) {
      return Zero;
    }
    if (!supplyingValue) {
      return liquidationThreshold;
    }
    return max(liquidationThreshold?.sub(supplyingValue), Zero);
  }, [liquidationThreshold, supplyingValue]);

  const newAccountHealth = useCalcAccountHealth(newLiquidationThreshold, borrowBalance);

  const canExitStatus = useMemo(() => {
    if (borrowing?.gt(Zero)) {
      return CanExitStatus.needRepayAsset;
    }
    if (borrowLimit?.sub(supplyingValue)?.lt(borrowBalance)) {
      return CanExitStatus.overBorrowLimit;
    }
    return CanExitStatus.ready;
  }, [borrowBalance, borrowLimit, borrowing, supplyingValue]);

  const disabled = useMemo(() => {
    return canExitStatus !== CanExitStatus.ready || loading;
  }, [canExitStatus, loading]);

  const isShowErrorButton = useMemo(() => {
    switch (canExitStatus) {
      case CanExitStatus.overBorrowLimit:
      case CanExitStatus.needRepayAsset:
        return true;
      case CanExitStatus.ready:
        return false;
      default:
        return false;
    }
  }, [canExitStatus]);

  const buttonText = useMemo(() => {
    switch (canExitStatus) {
      case CanExitStatus.needRepayAsset:
        return `Please repay the borrowed ${market?.asset} first`;
      case CanExitStatus.overBorrowLimit:
        return `Over borrow limit`;
      default:
        return `Stop using ${market?.asset} as collateral`;
    }
  }, [canExitStatus, market?.asset]);

  const successMessage = useMemo(() => {
    return `You disable ${market?.asset} as collateral`;
  }, [market?.asset]);

  const createTransaction = useCallback(async () => {
    return (await comptroller.exitMarket(market?.marketAddress)) as TransactionResponse;
  }, [comptroller, market]);

  const onExitMarket = useCallback(async () => {
    if (!comptroller || !isCollateralEnabled) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    try {
      const tx = await handleTransactionReceipt(
        `Disable ${market?.asset} as collateral`,
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
    comptroller,
    isCollateralEnabled,
    handleTransactionReceipt,
    market?.asset,
    createTransaction,
    getTransactionStatus,
  ]);

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
        <CustomStyledModalImage src={imgEnable} />
        <StyledModalTitle>Disable {market?.asset} as collateral</StyledModalTitle>
        <StyledModalDes>
          Disabling this asset as collateral affects your borrowing power and Health Factor.
        </StyledModalDes>
      </CustomModalHeader>
      <CustomModalContent>
        <StyledGroupContent>
          <StyledGroupContentTitle>Transaction Overview</StyledGroupContentTitle>
          <StyledRow>
            <StyledRowTitle>Supply Balance</StyledRowTitle>
            <StyledRowContent>
              <StyledRowValue>
                <BigNumberValue
                  value={suppliedUnderlying}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                />
                <span>{market?.asset}</span>
              </StyledRowValue>
            </StyledRowContent>
          </StyledRow>
          <StyledRow>
            <StyledRowTitle>Health Factor</StyledRowTitle>
            <StyledRowContentWrap>
              <StyledRowContent>
                {supplyingValue?.gt(Zero) && borrowBalance && borrowBalance?.gt(Zero) ? (
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
          isLoading={loading}
          disabled={disabled || !account}
          onClick={onExitMarket}
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

export default ModalDisableCollateral;
