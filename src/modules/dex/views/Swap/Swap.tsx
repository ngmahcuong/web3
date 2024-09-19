import { MaxUint256, Zero } from '@ethersproject/constants';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import icInvert from '../../../../assets/icons/ic-invert.svg';
import useModal from '../../../../hooks/useModal';
import { useUserWallet } from '../../../../providers/UserWalletProvider';
import { Field } from '../../../../state/dex/actions';
import { useSwapActionHandlers, useUpdateCurrency } from '../../../../state/dex/hooks';
import { useCurrencyBalances, useWatchTokenBalance } from '../../../../state/user/hooks';
import { screenUp } from '../../../../utils/styles';
import { useDexApprove } from '../../../lending/hooks/useDexApprove';
import Setting from '../../components/Setting/Setting';
import { TokenInputWithSelectCurrency } from '../../components/TokenInputWithSelectCurrency';
import { useShowImportTokenModal } from '../../hooks/useShowImportTokenModal';
import { WrapType } from '../../hooks/useWrap';
import { ImportTokenModal } from './components/Modals/ModalImportToken';
import { SwapSummary } from './components/SwapSummary';
import { useSingleTokenSwapInfo } from '../../hooks/useSingleTokenSwapInfo';
import {
  BoxContainer,
  StyledButtonApprove,
  StyledButtonWrapper,
  StyledFooter,
  StyledHeaderBox,
  StyledIconSwap,
  StyledInputContainer,
  StyledSwapSummaryWrapper,
  StyledTitle,
  StyleRecipientContainer,
} from '../../components/Share';
import { useEstimateSwap } from '../../hooks/useEstimateSwap';
import { Recipient } from './components/Recipient';
import { DexTokenSymbol } from '../../components/DexTokenSymbol';
import SwapLineChart from './components/SwapLineChart';
import { ButtonSwap } from './components/ButtonSwap';
import { useAggregationRouter } from '../../hooks/useAggregationRouter';
import { SwapRouting } from './components/SwapRouting';

export const Swap: React.FC = () => {
  const [inputValue, setInputValue] = useState<BigNumber | undefined>();
  const [independentField, setIndependentField] = useState<Field | undefined>();
  const { account } = useUserWallet();
  const aggregationRouter = useAggregationRouter();
  const watchTokens = useWatchTokenBalance();
  const history = useHistory();
  const { updateCurrencies, restoreCurrencyDefault } = useUpdateCurrency();
  const [showChart] = useState(false);

  const {
    inputCurrencyId,
    outputCurrencyId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    outputAmount,
    trade,
    wrapType,
    recipientError,
    userHasSpecifiedInputOutput,
    loading,
  } = useEstimateSwap(inputValue, independentField);

  const { onCurrencySelection, onChangeRecipient } = useSwapActionHandlers();

  useEffect(() => {
    watchTokens([inputCurrencyId, outputCurrencyId]);
  }, [inputCurrencyId, outputCurrencyId, watchTokens]);

  const [inputCurrencyBalance, outputCurrencyBalance] = useCurrencyBalances([
    inputCurrency,
    outputCurrency,
  ]);

  const { showImportTokenModal, importTokens } = useShowImportTokenModal();

  const onCancelImportToken = useCallback(() => {
    restoreCurrencyDefault();
    history.push('/swap');
  }, [history, restoreCurrencyDefault]);

  const importModal = useMemo(
    () => <ImportTokenModal onCancel={onCancelImportToken} tokens={importTokens} />,
    [onCancelImportToken, importTokens],
  );
  const [openImportModal] = useModal(importModal, 'import-tokens', false);

  useEffect(() => {
    if (showImportTokenModal) {
      openImportModal();
    }
  }, [openImportModal, showImportTokenModal, importTokens]);

  const {
    loading: inputLoading,
    loadingSubmit: inputLoadingSubmit,
    approve: approveInput,
    isApproved: isInputApproved,
    approveSubmitted: isInputApproveSubmitted,
  } = useDexApprove(
    inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
    aggregationRouter?.address,
  );

  const isShowApproveButtonInput = useMemo(() => {
    if (inputLoading) {
      return false;
    }
    return (
      (account && !isInputApproved && inputAmount && inputAmount?.gt(Zero)) ||
      isInputApproveSubmitted
    );
  }, [inputLoading, account, isInputApproved, inputAmount, isInputApproveSubmitted]);

  const onInputChanged = useCallback((value: BigNumber) => {
    setInputValue(value);
    setIndependentField(Field.INPUT);
  }, []);

  const updateRoute = useCallback(
    (inputCurrency?: Currency, outputCurrency?: Currency) => {
      if (inputCurrency && outputCurrency && inputCurrency !== outputCurrency) {
        history.push(
          `/swap?inputCurrency=${
            inputCurrency.isNative ? inputCurrency.symbol : inputCurrency.wrapped.address
          }&outputCurrency=${
            outputCurrency.isNative ? outputCurrency.symbol : outputCurrency.wrapped.address
          }`,
        );
      }
    },
    [history],
  );

  const onInvertToken = useCallback(() => {
    setIndependentField(independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT);
    setInputValue(undefined);
    if (inputCurrency && outputCurrency) {
      updateRoute(outputCurrency, inputCurrency);
    }
    updateCurrencies(
      outputCurrency?.isNative ? outputCurrency?.symbol : outputCurrency?.wrapped?.address,
      inputCurrency?.isNative ? inputCurrency?.symbol : inputCurrency?.wrapped?.address,
    );
  }, [independentField, inputCurrency, outputCurrency, updateCurrencies, updateRoute]);

  const handleInputSelect = useCallback(
    (currency: Currency) => {
      if (!outputCurrency) {
        setInputValue(undefined);
        onCurrencySelection(Field.INPUT, currency);
        updateRoute(currency, outputCurrency);
      } else if (currency?.equals(outputCurrency)) {
        onInvertToken();
      } else {
        if (!inputCurrency || !currency?.equals(inputCurrency)) {
          setInputValue(undefined);
          onCurrencySelection(Field.INPUT, currency);
          updateRoute(currency, outputCurrency);
        }
      }
    },
    [inputCurrency, onCurrencySelection, onInvertToken, outputCurrency, updateRoute],
  );

  const handleOutputSelect = useCallback(
    (currency: Currency) => {
      if (!inputCurrency) {
        onCurrencySelection(Field.OUTPUT, currency);
        updateRoute(inputCurrency, currency);
      } else if (currency?.equals(inputCurrency)) {
        onInvertToken();
      } else {
        if (!outputCurrency || !currency?.equals(outputCurrency)) {
          onCurrencySelection(Field.OUTPUT, currency);
          updateRoute(inputCurrency, currency);
        }
      }
    },
    [inputCurrency, onCurrencySelection, onInvertToken, outputCurrency, updateRoute],
  );

  const onSwapCompleted = useCallback(() => {
    setInputValue(undefined);
    onChangeRecipient(undefined);
  }, [onChangeRecipient]);

  // const toggleChart = useCallback(() => {
  //   setShowChart(!showChart);
  // }, [showChart]);

  const singleTokenPrice = useSingleTokenSwapInfo(inputCurrency, outputCurrency);
  return (
    <StyledContainer>
      {showChart && (
        <StyledChartContainer>
          <StyledChartHeader>
            <div className="icon">
              <DexTokenSymbol address={inputCurrency?.wrapped.address} size={36} />
              <DexTokenSymbol address={outputCurrency?.wrapped.address} size={36} />
            </div>
            <div className="name">
              {inputCurrency?.symbol}/{outputCurrency?.symbol}
            </div>
          </StyledChartHeader>
          <SwapLineChart
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            token0Address={inputCurrency?.wrapped.address}
            token1Address={outputCurrency?.wrapped.address}
            currentSwapPrice={singleTokenPrice}
          />
        </StyledChartContainer>
      )}
      <BoxContainer>
        <StyledHeaderBox>
          <StyledTitle>Swap</StyledTitle>
          <div className="setting">
            {/* <StyledChartVisible onClick={toggleChart} showChart={showChart}>
              <IcChart />
            </StyledChartVisible> */}
            <Setting />
          </div>
        </StyledHeaderBox>
        <StyledBox>
          <StyledInputContainer>
            <TokenInputWithSelectCurrency
              currency={inputCurrency}
              value={inputAmount}
              maxValue={inputCurrencyBalance}
              onChange={onInputChanged}
              onCurrencySelect={handleInputSelect}
              label={'From'}
            />
            <StyledIconSwap onClick={onInvertToken}>
              <img src={icInvert} alt="swap-invert" />
            </StyledIconSwap>
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
          </StyledInputContainer>
          <StyleRecipientContainer>
            <Recipient recipientError={recipientError} />
          </StyleRecipientContainer>
        </StyledBox>
        {wrapType === WrapType.NOT_APPLICABLE ? (
          <StyledSwapSummaryWrapper>
            <SwapSummary trade={trade} showSlippage />
          </StyledSwapSummaryWrapper>
        ) : undefined}
        <StyledFooter>
          <StyledButtonWrapper>
            {isShowApproveButtonInput && wrapType !== WrapType.UNWRAP && (
              <StyledButtonApprove
                isLoading={inputLoadingSubmit}
                disabled={inputLoadingSubmit || isInputApproveSubmitted}
                onClick={approveInput}
              >
                {isInputApproved ? 'Approved' : 'Approve'} {inputCurrency?.symbol}
              </StyledButtonApprove>
            )}
            <ButtonSwap
              inputAmount={inputAmount}
              inputCurrency={inputCurrency}
              outputAmount={outputAmount}
              outputCurrency={outputCurrency}
              userHasSpecifiedInputOutput={userHasSpecifiedInputOutput}
              onSwapCompleted={onSwapCompleted}
              recipientError={recipientError}
              wrapType={wrapType}
              inputValue={inputValue}
              independentField={independentField}
              trade={trade}
              loadingEstimate={loading}
            />
          </StyledButtonWrapper>
        </StyledFooter>
        <StyleRoutingContainer visibleBorder={trade?.path?.length ? true : false}>
          <SwapRouting route={trade?.path} />
        </StyleRoutingContainer>
      </BoxContainer>
    </StyledContainer>
  );
};

export default Swap;

const StyledContainer = styled.div`
  ${screenUp('lg')`
    display: grid;
    grid-column-gap: 30px;
    grid-auto-columns: 6fr 4fr;
    grid-auto-flow: column;
  `};
`;

const StyledChartContainer = styled.div`
  display: none;
  ${screenUp('lg')`
    display: block;
    width: 100%;
    height: fit-content;
  `};
`;

const StyledChartHeader = styled.div`
  width: 100%;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  .icon {
    margin-right: 12px;
    line-height: 1;
    display: flex;
    img {
      z-index: 1;
      &:last-child {
        z-index: 0;
        margin-left: -4px;
      }
    }
  }
  .name {
    font-size: 20px;
    font-weight: 500;
  }
`;

const StyledBox = styled.div`
  padding: 15px 12px;
  background-color: ${({ theme }) => theme.box.background};
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyleRoutingContainer = styled.div<{ visibleBorder?: boolean }>`
  border-top: ${({ visibleBorder, theme }) =>
    visibleBorder ? `solid 1px ${theme.box.border}` : ' none'};
  background-color: ${({ theme }) => theme.box.itemBackground};
  margin-top: 16px;
`;

// const StyledChartVisible = styled.button<{ showChart: boolean }>`
//   padding: 0;
//   height: 32px;
//   width: 32px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   font-size: 18px;
//   fill: ${({ theme, showChart }) => (showChart ? theme.success : theme.muted)};
//   background-color: ${({ theme }) => theme.box.background};
//   color: ${({ theme }) => theme.success};
//   border-radius: 3px;
//   &:hover {
//     fill: ${({ theme }) => theme.black};
//   }
// `;
