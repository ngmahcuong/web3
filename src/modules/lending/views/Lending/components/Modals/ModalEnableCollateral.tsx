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
import { ModalLendingSuccess } from './ModalLendingSuccess';
import { useComptroller } from '../../../../hooks/useComptroller';
import { useCalcAccountHealth } from '../../../../hooks/useCalcAccountHealth';
import { useMarket } from '../../../../hooks/useLendingMarkets';
import {
  useIsEnteredMarket,
  useLendingUserInfoBalance,
  useLendingUserInfoPosition,
} from '../../../../hooks/useUserLendingHook';

export type ModalEnableProps = {
  onDismiss?: () => void;
  asset: string;
};

const ModalEnableCollateral: React.FC<ModalEnableProps> = ({ asset, onDismiss }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const comptroller = useComptroller();
  const { borrowBalance, accountHealth, liquidationThreshold } = useLendingUserInfoBalance();
  const { supplying } = useLendingUserInfoPosition(market?.asset);
  const isCollateralEnabled = useIsEnteredMarket(market?.marketAddress);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const getTransactionStatus = useGetTransactionStatus();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const suppliedUnderlying = useMemo(() => {
    return supplying?.mul(market?.exchangeRate).div(Precision);
  }, [market?.exchangeRate, supplying]);

  const borrowLimitChange = useMemo(() => {
    if (!market) {
      return Zero;
    }

    return (supplying || Zero)
      .mul(market.exchangeRate)
      .mul(market.underlyingPrice)
      .mul(market.collateralFactor)
      .div(LendingPrecision)
      .div(LendingPrecision)
      .div(LendingPrecision);
  }, [market, supplying]);

  const newLiquidationThreshold = useMemo(() => {
    return liquidationThreshold.add(borrowLimitChange);
  }, [liquidationThreshold, borrowLimitChange]);

  const newAccountHealth = useCalcAccountHealth(newLiquidationThreshold, borrowBalance);

  const successMessage = useMemo(() => {
    return `You enable ${market?.asset} as collateral`;
  }, [market?.asset]);

  const createTransaction = useCallback(async () => {
    return (await comptroller.enterMarkets([market?.marketAddress])) as TransactionResponse;
  }, [comptroller, market]);

  const onEnableMarket = useCallback(async () => {
    if (!comptroller || isCollateralEnabled) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    try {
      const tx = await handleTransactionReceipt(
        `Your ${market?.asset} now used as collateral`,
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
        <StyledModalTitle>Enable {market?.asset} as collateral</StyledModalTitle>
        <StyledModalDes>
          Enabling this asset as collateral increases your borrowing power and Health Factor.
          However, it can get liquidated if your health factor drops below 1.
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
                {borrowLimitChange?.gt(Zero) && borrowBalance && borrowBalance?.gt(Zero) ? (
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
          disabled={loading || !account}
          onClick={onEnableMarket}
          size="md"
          isLoading={loading}
        >
          Use {market?.asset} as collateral
        </StyledButton>
        <ErrorMessage errorMessage={errorMessage} />
      </CustomModalContent>
    </Modal>
  );
};

const CustomStyledModalImage = styled(StyledModalImage)`
  width: 115px;
`;

export default ModalEnableCollateral;
