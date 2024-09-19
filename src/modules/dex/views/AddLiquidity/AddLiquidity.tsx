import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../utils/styles';
import { ButtonAddLP } from './components/ButtonAddLP';
import PoolShareInfo from './components/PoolShareInfo';
import { useParams, useHistory } from 'react-router-dom';
import { Currency, Token } from '@uniswap/sdk-core';
import { useCurrencyBalances, useWatchTokenBalance } from '../../../../state/user/hooks';
import { useUserWallet } from '../../../../providers/UserWalletProvider';
import { Zero } from '@ethersproject/constants';
import { Button } from '../../../../components/Buttons';
import { BigNumber } from 'ethers';
import { Field, useEstimateDependentAmount } from './hook/useEstimateDependentAmount';
import { useUniswapRouter } from '../../hooks/useUniswapRouter';
import { useNoLiquidity } from '../../hooks/useNoLiquidity';
import { TokenInputWithSelectCurrency } from '../../components/TokenInputWithSelectCurrency';
import { PairInfo } from '../../models/Pair';
import { useSavePool } from '../../../../state/dex/hooks';
import { useDexApprove } from '../../../lending/hooks/useDexApprove';
import { computePairAddress } from '../../utils/pair';
import { useWeb3React } from '@web3-react/core';

export type AddLiquidityProps = {
  currencyA: Currency;
  currencyB: Currency;
  pairInfo: PairInfo;
};

const AddLiquidity: React.FC<AddLiquidityProps> = ({ currencyA, currencyB, pairInfo }) => {
  const { account } = useUserWallet();
  const { chainId } = useWeb3React();
  const [swapRouter] = useUniswapRouter();
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA?: string;
    currencyIdB?: string;
  }>();
  const history = useHistory();
  const watchTokens = useWatchTokenBalance();
  const savePool = useSavePool();
  const { pairState, liquidityToken, liquidityTokenSupply, reserveA, reserveB } = pairInfo;

  const [currencyABalance, currencyBBalance] = useCurrencyBalances([currencyA, currencyB]);
  const noLiquidity = useNoLiquidity(pairState, reserveA, reserveB);

  const [independentField, setIndependentField] = useState<Field>(Field.CURRENCY_A);
  const [fieldAValue, setFieldAValue] = useState<BigNumber | undefined>(undefined);
  const [fieldBValue, setFieldBValue] = useState<BigNumber | undefined>(undefined);

  const onFieldAInput = useCallback((value: BigNumber) => {
    setIndependentField(Field.CURRENCY_A);
    setFieldAValue(value);
  }, []);

  const onFieldBInput = useCallback((value: BigNumber) => {
    setIndependentField(Field.CURRENCY_B);
    setFieldBValue(value);
  }, []);

  const {
    minOutputIndependent,
    minOutputDependent,
    dependentAmount,
    priceOutputPerInput,
    priceInputPerOutput,
    shareOfPool,
  } = useEstimateDependentAmount(
    independentField,
    currencyA,
    currencyB,
    fieldAValue,
    fieldBValue,
    noLiquidity,
    reserveA,
    reserveB,
    liquidityTokenSupply,
    liquidityToken,
  );

  useEffect(() => {
    if (!noLiquidity && dependentAmount) {
      if (
        independentField === Field.CURRENCY_A &&
        (!fieldBValue || !dependentAmount.eq(fieldBValue))
      ) {
        setFieldBValue(dependentAmount);
      } else if (
        independentField === Field.CURRENCY_B &&
        (!fieldAValue || !dependentAmount.eq(fieldAValue))
      ) {
        setFieldAValue(dependentAmount);
      }
    }
  }, [dependentAmount, fieldAValue, fieldBValue, independentField, noLiquidity]);

  useEffect(() => {
    watchTokens([currencyIdA, currencyIdB, liquidityToken]);
  }, [currencyIdA, currencyIdB, liquidityToken, watchTokens]);

  const dependentField = useMemo(() => {
    return independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;
  }, [independentField]);

  // get formatted minAmounts
  const formattedMinAmounts = useMemo(() => {
    return {
      [independentField]: minOutputIndependent,
      [dependentField]: minOutputDependent,
    };
  }, [independentField, dependentField, minOutputIndependent, minOutputDependent]);

  const {
    loading: loadingA,
    loadingSubmit: loadingSubmitA,
    approve: approveA,
    isApproved: isApprovedA,
    approveSubmitted: approveSubmittedA,
  } = useDexApprove(
    currencyA?.isNative ? currencyA?.symbol : currencyA?.wrapped?.address,
    swapRouter?.address,
  );

  const {
    loading: loadingB,
    loadingSubmit: loadingSubmitB,
    approve: approveB,
    isApproved: isApprovedB,
    approveSubmitted: approveSubmittedB,
  } = useDexApprove(
    currencyB?.isNative ? currencyB?.symbol : currencyB?.wrapped?.address,
    swapRouter?.address,
  );

  const isShowApproveButtonA = useMemo(() => {
    if (loadingA) {
      return false;
    }
    return (account && !isApprovedA && fieldAValue?.gt(Zero)) || approveSubmittedA;
  }, [account, approveSubmittedA, fieldAValue, isApprovedA, loadingA]);

  const isShowApproveButtonB = useMemo(() => {
    if (loadingB) {
      return false;
    }
    return (account && !isApprovedB && fieldBValue?.gt(Zero)) || approveSubmittedB;
  }, [account, approveSubmittedB, fieldBValue, isApprovedB, loadingB]);

  const onSelectCurrencyA = useCallback(
    (currency: Currency) => {
      const newCurrencyIdA = currency.isNative ? 'ETH' : (currency as Token).address;
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/pools/add/${currencyIdB}/${currencyIdA}`);
      } else if (currencyIdB) {
        history.push(`/pools/add/${newCurrencyIdA}/${currencyIdB}`);
      } else {
        history.push(`/pools/add/${newCurrencyIdA}`);
      }
    },
    [currencyIdA, history, currencyIdB],
  );

  const onSelectCurrencyB = useCallback(
    (currency: Currency) => {
      const newCurrencyIdB = currency.isNative ? 'ETH' : (currency as Token).address;
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/pools/add/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          history.push(`/pools/add/${newCurrencyIdB}`);
        }
      } else {
        history.push(`/pools/add/${currencyIdA || 'ETH'}/${newCurrencyIdB}`);
      }
    },
    [currencyIdA, history, currencyIdB],
  );

  const reset = useCallback(() => {
    setIndependentField(undefined);
    setFieldAValue(undefined);
    setFieldBValue(undefined);
  }, []);

  const onAdded = useCallback(() => {
    savePool({
      stable: false,
      address: computePairAddress(chainId, currencyA.wrapped, currencyB.wrapped),
      tokens: {
        currencyA: currencyA.wrapped,
        currencyB: currencyB.wrapped,
      },
    });
    reset();
  }, [savePool, chainId, currencyA?.wrapped, currencyB?.wrapped, reset]);

  useEffect(() => {
    reset();
  }, [currencyIdA, currencyIdB, account, reset]);

  return (
    <BoxContainer>
      <StyledBox>
        <StyledInputContainer>
          <TokenInputWithSelectCurrency
            currency={currencyA}
            value={fieldAValue}
            maxValue={currencyABalance}
            onChange={onFieldAInput}
            onCurrencySelect={onSelectCurrencyA}
            label="Amount"
          />
          <StyledIconSwap>
            <i className="fal fa-plus"></i>
          </StyledIconSwap>
          <TokenInputWithSelectCurrency
            currency={currencyB}
            value={fieldBValue}
            maxValue={currencyBBalance}
            onChange={onFieldBInput}
            onCurrencySelect={onSelectCurrencyB}
            label="Amount"
          />
        </StyledInputContainer>
      </StyledBox>
      <StyledFooter>
        {currencyA && currencyB && (
          <PoolShareInfo
            shareOfPool={shareOfPool}
            estimatePriceInputToOutput={priceInputPerOutput}
            estimatePriceOutputToInput={priceOutputPerInput}
            currencyA={currencyA?.symbol}
            currencyB={currencyB?.symbol}
          />
        )}
        <StyledButtons>
          {isShowApproveButtonA || isShowApproveButtonB ? (
            <StyledApproveContainer>
              {isShowApproveButtonA && (
                <StyledButtonApprove
                  isLoading={loadingSubmitA}
                  disabled={loadingSubmitA || approveSubmittedA}
                  onClick={approveA}
                >
                  {isApprovedA ? 'Approved' : 'Approve'} {currencyA?.symbol}
                </StyledButtonApprove>
              )}
              {isShowApproveButtonB && (
                <StyledButtonApprove
                  isLoading={loadingSubmitB}
                  disabled={loadingSubmitB || approveSubmittedB}
                  onClick={approveB}
                >
                  {isApprovedB ? 'Approved' : 'Approve'} {currencyB?.symbol}
                </StyledButtonApprove>
              )}
            </StyledApproveContainer>
          ) : null}
          <ButtonAddLP
            pairInfo={pairInfo}
            independentField={independentField}
            amountA={fieldAValue}
            amountB={fieldBValue}
            formattedMinAmounts={formattedMinAmounts}
            onAdded={onAdded}
            currencyABalance={currencyABalance}
            currencyBBalance={currencyBBalance}
          />
        </StyledButtons>
      </StyledFooter>
    </BoxContainer>
  );
};

const BoxContainer = styled.div`
  border: solid 1px ${({ theme }) => theme.box.border};
`;

const StyledBox = styled.div`
  padding: 16px 10px;
  background-color: ${({ theme }) => theme.box.background};
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledInputContainer = styled.div`
  display: grid;
  position: relative;
`;

const StyledIconSwap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.gray3};
  border-radius: 50%;
  border: solid 2px ${({ theme }) => theme.icon.border};
  margin: 12px auto;
`;

const StyledFooter = styled(StyledBox)`
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

const StyledButtons = styled.div`
  flex: 1;
  button {
    width: 100%;
  }
`;

const StyledApproveContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  gap: 20px;
`;

const StyledButtonApprove = styled(Button)`
  font-weight: 500;
`;

export default AddLiquidity;
