import { MaxUint256, Zero } from '@ethersproject/constants';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Field } from '../../../../../state/dex/actions';
import {
  useLimitOrderActionHandlers,
  useLimitOrderCurrencyDefault,
} from '../../../../../state/dex/hooks';
import { useCurrencyBalances } from '../../../../../state/user/hooks';
import { LimitOrderExpireType } from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import { useDexApprove } from '../../../../lending/hooks/useDexApprove';
import {
  BoxContainer,
  StyledBox,
  StyledButtonApprove,
  StyledButtonWrapper,
  StyledFooter,
  StyledHeaderBox,
  StyledTitle,
} from '../../../components/Share';
import { TokenInputWithSelectCurrency } from '../../../components/TokenInputWithSelectCurrency';
import { useLimitOrderContract } from '../../../hooks/useLimitOrderContract';
import { useLimitOrderEstimateSwap } from '../../../hooks/useLimitOrderEstimateSwap';
import { LimitOrderExpired } from './LimitOrderExpired';
import { LimitOrderRate } from './LimitOrderRate';
import { LimitOrderRecipient } from './LimitOrderRecipient';
import { LimitOrderSwapButton } from './LimitOrderSwapButton';
import icInverted from '../../../../../assets/icons/ic-inverted.svg';
import Setting from '../../../components/Setting/Setting';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Link } from 'react-router-dom';

export const LimitOrderBox: React.FC = () => {
  const [inputValue, setInputValue] = useState<BigNumber | undefined>();
  const [independentField, setIndependentField] = useState<Field | undefined>(Field.INPUT);
  useLimitOrderCurrencyDefault();
  const [inputPrice, setInputPrice] = useState<BigNumber | undefined>(undefined);
  const [showInvertedPrice, setShowInvertedPrice] = useState<boolean>(false);
  const [expireTimeType, setExpiredTimeType] = useState<LimitOrderExpireType>('never');
  const [recipient, setRecipient] = useState<string>(undefined);
  const { limitOrderContract } = useLimitOrderContract();
  const { account } = useUserWallet();
  const { inputCurrency, outputCurrency, trade, recipientError, inputAmount, outputAmount } =
    useLimitOrderEstimateSwap(inputValue, independentField, inputPrice);

  const [inputCurrencyBalance, outputCurrencyBalance] = useCurrencyBalances([
    inputCurrency,
    outputCurrency,
  ]);

  const { onCurrencySelection, onUpdateCurrencies } = useLimitOrderActionHandlers();

  const {
    loading: inputLoading,
    loadingSubmit: inputLoadingSubmit,
    approve: approveInput,
    isApproved: isInputApproved,
    approveSubmitted: isInputApproveSubmitted,
  } = useDexApprove(
    inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
    limitOrderContract?.address,
  );

  const isShowApproveButtonInput = useMemo(() => {
    if (inputLoading) {
      return false;
    }
    return (
      (account && !isInputApproved && inputAmount && inputAmount?.gt(Zero)) ||
      isInputApproveSubmitted
    );
  }, [inputLoading, isInputApproveSubmitted, account, isInputApproved, inputAmount]);

  const onInvertToken = useCallback(() => {
    setIndependentField(Field.INPUT);
    setInputValue(undefined);
    setInputPrice(undefined);
    setShowInvertedPrice(false);
    onUpdateCurrencies(
      outputCurrency?.isNative ? outputCurrency?.symbol : outputCurrency?.wrapped?.address,
      inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
    );
  }, [
    inputCurrency?.isNative,
    inputCurrency?.symbol,
    inputCurrency?.wrapped?.address,
    onUpdateCurrencies,
    outputCurrency?.isNative,
    outputCurrency?.symbol,
    outputCurrency?.wrapped?.address,
  ]);

  const onInputChanged = useCallback((value: BigNumber) => {
    setInputValue(value);
    setIndependentField(Field.INPUT);
  }, []);

  const onInputPriceChanged = useCallback((value: BigNumber) => {
    setInputPrice(value);
  }, []);

  const handleInputSelect = useCallback(
    (currency: Currency) => {
      if (!outputCurrency) {
        setInputValue(undefined);
        setInputPrice(undefined);
        onCurrencySelection(Field.INPUT, currency);
      } else if (currency?.equals(outputCurrency)) {
        onInvertToken();
      } else {
        if (!inputCurrency || !currency?.equals(inputCurrency)) {
          setInputValue(undefined);
          setInputPrice(undefined);
          onCurrencySelection(Field.INPUT, currency);
        }
      }
    },
    [inputCurrency, onCurrencySelection, onInvertToken, outputCurrency],
  );

  const handleOutputSelect = useCallback(
    (currency: Currency) => {
      if (!inputCurrency) {
        setInputPrice(undefined);
        onCurrencySelection(Field.OUTPUT, currency);
      } else if (currency?.equals(inputCurrency)) {
        onInvertToken();
      } else {
        if (!outputCurrency || !currency?.equals(outputCurrency)) {
          setInputPrice(undefined);
          onCurrencySelection(Field.OUTPUT, currency);
        }
      }
    },
    [inputCurrency, onCurrencySelection, onInvertToken, outputCurrency],
  );

  const onChangeExpiredTime = useCallback((type) => {
    setExpiredTimeType(type);
  }, []);

  const onChangeRecipient = useCallback((recipient?: string) => {
    setRecipient(recipient);
  }, []);

  const onSwapCompleted = useCallback(() => {
    setInputPrice(undefined);
    setRecipient(undefined);
    setShowInvertedPrice(undefined);
    setExpiredTimeType('never');
    setInputValue(undefined);
  }, []);

  const onChangeInverted = useCallback(() => {
    setShowInvertedPrice(!showInvertedPrice);
  }, [showInvertedPrice]);

  return (
    <StyledBoxContainer>
      <StyledHeaderBox>
        <StyledTitle>Limit order</StyledTitle>
        <div className="setting">
          <Setting />
        </div>
      </StyledHeaderBox>
      <StyledOrderBox>
        <TokenInputWithSelectCurrency
          currency={inputCurrency}
          value={inputAmount}
          maxValue={inputCurrencyBalance}
          onChange={onInputChanged}
          onCurrencySelect={handleInputSelect}
          label={'From'}
        />
        <StyledSeparate></StyledSeparate>
        <TokenInputWithSelectCurrency
          currency={outputCurrency}
          value={outputAmount}
          maxValue={outputCurrencyBalance}
          onCurrencySelect={handleOutputSelect}
          label={'To'}
          hideMaxButton
          maxValidateValue={MaxUint256}
          disabled
          output
        />
        <StyledSeparate></StyledSeparate>
        <StyledLimitPriceWrapper>
          <StyleLabel>Price</StyleLabel>
          <LimitOrderRate
            onChangePrice={onInputPriceChanged}
            inputPrice={inputPrice}
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            trade={trade}
          />
        </StyledLimitPriceWrapper>
        {trade?.priceInputPerOutput &&
        trade?.priceOutputPerInput &&
        inputPrice &&
        inputPrice?.lt(trade?.priceOutputPerInput) ? (
          <StyledWarning>
            Input price is below market price, please use{' '}
            <StyledNavLink
              to={`/swap?inputCurrency=${
                inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped.address
              }&outputCurrency=${
                outputCurrency?.isNative
                  ? outputCurrency?.symbol
                  : outputCurrency?.wrapped.address
              }`}
            >
              Swap
            </StyledNavLink>{' '}
            instead
          </StyledWarning>
        ) : null}
        <LimitOrderRecipient
          recipient={recipient}
          onChangeRecipient={onChangeRecipient}
          recipientError={recipientError}
        />
      </StyledOrderBox>
      <StyledFooterCustom>
        <StyledFooterItem>
          <StyleLabel>Market price</StyleLabel>
          {trade?.inputCurrency && trade?.outputCurrency ? (
            <StyleValue>
              {showInvertedPrice ? (
                <>
                  1 {trade?.outputCurrency?.symbol} ={' '}
                  <BigNumberValue
                    value={trade?.priceInputPerOutput}
                    decimals={18}
                    fractionDigits={6}
                  />{' '}
                  {trade?.inputCurrency?.symbol}
                </>
              ) : (
                <>
                  1 {trade?.inputCurrency?.symbol} ={' '}
                  <BigNumberValue
                    value={trade?.priceOutputPerInput}
                    decimals={18}
                    fractionDigits={6}
                  />{' '}
                  {trade?.outputCurrency?.symbol}
                </>
              )}{' '}
              {trade ? (
                <StyledInvertedButton onClick={onChangeInverted}>
                  <IconRefresh src={icInverted} />
                </StyledInvertedButton>
              ) : (
                <></>
              )}
            </StyleValue>
          ) : (
            <StyledNodata>-</StyledNodata>
          )}
        </StyledFooterItem>
        <StyledFooterItem>
          <StyleLabel>Expires in</StyleLabel>
          <StyleValue>
            <LimitOrderExpired
              onChangeExpiredTime={onChangeExpiredTime}
              expireTimeType={expireTimeType}
            />
          </StyleValue>
        </StyledFooterItem>
        <StyledButtonWrapper>
          {isShowApproveButtonInput && (
            <StyledButtonApprove
              isLoading={inputLoadingSubmit}
              disabled={inputLoadingSubmit || isInputApproveSubmitted}
              onClick={approveInput}
            >
              {isInputApproved ? 'Approved' : 'Approve'} {inputCurrency?.symbol}
            </StyledButtonApprove>
          )}
          <LimitOrderSwapButton
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            inputAmount={inputAmount}
            outputAmount={outputAmount}
            trade={trade}
            limitPrice={inputPrice}
            expiredTimeType={expireTimeType}
            recipient={recipient}
            recipientError={recipientError}
            onSwapCompleted={onSwapCompleted}
          />
        </StyledButtonWrapper>
      </StyledFooterCustom>
    </StyledBoxContainer>
  );
};

const StyledBoxContainer = styled(BoxContainer)`
  margin-top: 0;
`;
const StyledOrderBox = styled(StyledBox)``;

const StyledSeparate = styled.div`
  margin-bottom: 16px;
`;

const StyledWarning = styled.div`
  margin-top: 4px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.warning};
  text-align: right;
`;

const StyledFooterCustom = styled(StyledFooter)`
  padding-top: 20px;
`;

const StyledFooterItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const StyleLabel = styled.div`
  color: ${({ theme }) => theme.text.muted};
  font-weight: 500;
`;
const StyleValue = styled.div`
  display: flex;
`;

const StyledInvertedButton = styled.button`
  display: flex;
  align-items: center;
  margin: 0 auto 0 auto;
  img {
    filter: opacity(0.8);
    :hover {
      filter: opacity(1);
    }
  }
`;

const IconRefresh = styled.img`
  width: 13px;
  ${screenUp('lg')`
    width: 17px ;
  `}
`;

const StyledNodata = styled.span`
  margin-right: 8px;
`;
export const StyledLimitPriceWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const StyledNavLink = styled(Link)`
  text-decoration: underline;
  color: ${({ theme }) => theme.button.primary.hover};
  :hover {
    color: ${({ theme }) => theme.text.highlight};
  }
`;
