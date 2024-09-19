import { Currency, Token } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ModalBackButton } from '../../../../components/Modal/ModalStyles';
import { getDefaultSwapToken } from '../../../../config';
import { screenUp } from '../../../../utils/styles';
import { useFetchPairInfo } from '../../hooks/useFetchPairInfo';
import { useUniswapToken } from '../../hooks/useUniswapToken';
import { equalsCurrency } from '../../utils/tokens';
import { ButtonImportPool } from './components/ButtonImportPool';
import { PoolStatus } from './components/PoolStatus';
import { SelectToken } from './components/SelectToken';

const ImportPool: React.FC = () => {
  const { chainId } = useWeb3React();
  const [currencyIdA, setCurrencyIdA] = useState<string | undefined>(null);
  const [currencyIdB, setCurrencyIdB] = useState<string | undefined>(undefined);
  const currencyA = useUniswapToken(currencyIdA);
  const currencyB = useUniswapToken(currencyIdB);
  const pairInfo = useFetchPairInfo(currencyA, currencyB);
  const history = useHistory();

  useEffect(() => {
    const defaultSwapInput = getDefaultSwapToken(chainId).defaultSwapInput;
    if (currencyIdA === null && defaultSwapInput) {
      setCurrencyIdA(defaultSwapInput);
    }
  }, [currencyIdA, chainId]);

  const onSelectCurrencyA = useCallback(
    (currency: Currency) => {
      const newCurrency = currency.isNative ? currency?.symbol : (currency as Token)?.address;
      if (equalsCurrency(currency, currencyB)) {
        setCurrencyIdB(undefined);
      }
      setCurrencyIdA(newCurrency);
    },
    [currencyB],
  );

  const onSelectCurrencyB = useCallback(
    (currency: Currency) => {
      const newCurrency = currency.isNative ? currency?.symbol : (currency as Token).address;
      if (equalsCurrency(currency, currencyA)) {
        setCurrencyIdA(undefined);
      }
      setCurrencyIdB(newCurrency);
    },
    [currencyA],
  );

  const goBack = useCallback(() => {
    history.push(`/pools`);
  }, [history]);

  return (
    <BoxContainer>
      <StyledHeaderBox>
        <ModalBackButton onClick={goBack}>Back</ModalBackButton>
        <div className="label">Import Pool</div>
      </StyledHeaderBox>
      <StyledBox>
        <StyledInputContainer>
          <SelectToken currency={currencyA} onCurrencySelect={onSelectCurrencyA} />
          <StyledIconSwap>
            <i className="far fa-plus"></i>
          </StyledIconSwap>
          <SelectToken currency={currencyB} onCurrencySelect={onSelectCurrencyB} />
        </StyledInputContainer>
      </StyledBox>
      <PoolStatus pairInfo={pairInfo} />
      <StyledFooter>
        <ButtonImportPool pairInfo={pairInfo} />
      </StyledFooter>
    </BoxContainer>
  );
};

const BoxContainer = styled.div`
  margin: 36px auto;
  ${screenUp('lg')`
    width: 548px;
  `}
`;

const StyledHeaderBox = styled.div`
  padding: 0 10px;
  margin-bottom: 14px;
  .label {
    font-size: 18px;
    font-weight: 500;
    margin-top: 10px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.text.primary};
  }
  .setting {
    margin-left: auto;
  }
  ${screenUp('lg')`
    margin-bottom: 14px;
    padding: 0;
    .label {
      font-size: 20px;
    }
  `}
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
  grid-gap: 4px;
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
  margin: 10px auto;
`;

const StyledFooter = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.box.itemBackground};
  padding: 20px;
`;

export default ImportPool;
