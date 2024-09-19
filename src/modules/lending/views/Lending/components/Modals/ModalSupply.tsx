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
  LendingPrecision,
  PercentageThreshold,
  Precision,
  TokenThreshold,
} from '../../../../../../utils/constants';
import { formatBigNumber } from '../../../../../../utils/numbers';
import imgSupply from '../../../../../../assets/images/lending-confirm-supply.png';
import imgActive from '../../../../../../assets/icons/ic-active.svg';
import {
  CustomModalContent,
  CustomModalHeader,
  StyledButton,
  StyledGroupContent,
  StyledGroupContentTitle,
  StyledImageActive,
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
import { ModalLendingSuccess } from './ModalLendingSuccess';
import { useCalcAccountHealth } from '../../../../hooks/useCalcAccountHealth';
import { useMarket } from '../../../../hooks/useLendingMarkets';
import {
  useIsEnteredMarket,
  useLendingUserInfoBalance,
} from '../../../../hooks/useUserLendingHook';

export type ModalSupplyProps = {
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

const ModalSupply: React.FC<ModalSupplyProps> = ({ asset, onDismiss }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const balance = useTokenBalance(market?.assetAddress);
  const isCollateralEnabled = useIsEnteredMarket(market?.marketAddress);
  const { borrowBalance, accountHealth, liquidationThreshold } = useLendingUserInfoBalance();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const getTransactionStatus = useGetTransactionStatus();
  const registry = useContractRegistry();
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
  const [connect] = useModal(<ModalSelectWallet />);

  const marketToken = useMemo(() => {
    return registry?.getMarketByAddress(market?.marketAddress);
  }, [registry, market?.marketAddress]);

  const amountValue = useMemo(() => {
    if (!amount || !market?.underlyingPrice) {
      return;
    }
    return amount.mul(market?.underlyingPrice).div(Precision);
  }, [amount, market?.underlyingPrice]);

  const newLiquidationThreshold = useMemo(() => {
    if (!liquidationThreshold) {
      return undefined;
    }
    if (!isCollateralEnabled || !amount) {
      return liquidationThreshold;
    }
    const supplyInputValue = amount
      ?.mul(market?.underlyingPrice)
      ?.mul(market?.collateralFactor)
      ?.div(LendingPrecision)
      ?.div(LendingPrecision);
    return liquidationThreshold?.add(supplyInputValue);
  }, [
    amount,
    liquidationThreshold,
    isCollateralEnabled,
    market?.collateralFactor,
    market?.underlyingPrice,
  ]);

  const newAccountHealth = useCalcAccountHealth(newLiquidationThreshold, borrowBalance);

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
    if (amount?.gt(balance || Zero)) {
      return ButtonStatus.insufficientBalance;
    }
    return ButtonStatus.ready;
  }, [account, amount, balance, isApproved, loading, loadingGetApproveState, loadingSubmit]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect`;
      case ButtonStatus.notApprove:
      case ButtonStatus.inApprove:
        return `Enable`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient Balance`;
      case ButtonStatus.inSubmit:
        return `Supply`;
      default:
        return 'Supply';
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

  const successMessage = useMemo(() => {
    return `You Supplied ${formatBigNumber(
      amount,
      market?.assetDecimals,
      {
        fractionDigits: market.significantDigits || 3,
      },
      TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
    )} ${market?.asset}`;
  }, [amount, market?.asset, market?.assetDecimals, market.significantDigits]);

  const createTransaction = useCallback(async () => {
    return (await marketToken.supply(amount)) as TransactionResponse;
  }, [amount, marketToken]);

  const onSupply = useCallback(async () => {
    if (!marketToken || !amount) {
      return;
    }
    setLoading(true);
    setErrorMessage(undefined);
    if (market?.mintPaused) {
      setErrorMessage('Supply paused');
      setLoading(false);
      return;
    }
    try {
      const tx = await handleTransactionReceipt(
        `Supply ${formatBigNumber(
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
    market?.mintPaused,
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
      case ButtonStatus.notApprove: {
        return approve();
      }
      default:
        return onSupply();
    }
  }, [approve, connect, onSupply, status]);

  const onClickBalance = useCallback(() => {
    setAmount(balance);
  }, [balance]);

  if (txHash) {
    return (
      <ModalLendingSuccess
        symbol={`CH_${asset}`}
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
        <StyledModalImage src={imgSupply} />
        <StyledModalTitle>Supply {market?.asset}</StyledModalTitle>
        <StyledInputHeader>
          Amount
          <div className="balance">
            Wallet balance:
            <button onClick={onClickBalance}>
              <BigNumberValue
                value={balance}
                decimals={market?.assetDecimals}
                fractionDigits={4}
              />
            </button>
            <span>{market?.asset}</span>
          </div>
        </StyledInputHeader>
        <StyledInputContainer>
          <TokenInputWithMaxButton
            maxValue={balance}
            decimals={market?.assetDecimals}
            value={amount}
            symbol={market?.asset}
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
            <StyledRowTitle>Supply APY</StyledRowTitle>
            <StyledRowContent>
              <StyledRowValue>
                <BigNumberValue
                  value={market?.supplyRatePerYear}
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
                  value={market?.supplyDistributionApy || 0}
                  percentage
                  fractionDigits={2}
                  threshold={PercentageThreshold}
                />
              </StyledRowValue>
            </StyledRowContent>
          </StyledRow> */}
          <StyledRow>
            <StyledRowTitle>Collateralization</StyledRowTitle>
            <StyledRowContent>
              {market?.disableCanBeCollateral ? (
                <StyledRowValue variant="danger">Disabled</StyledRowValue>
              ) : (
                <>
                  <StyledImageActive src={imgActive} />
                  <StyledRowValue variant="success">Enabled</StyledRowValue>
                </>
              )}
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

export default ModalSupply;
