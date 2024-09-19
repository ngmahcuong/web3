import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { TokenInput } from '../../../../../components/TokenInput';
import { Trade } from '../../../../../state/dex/actions';
import { StyledLimitOrderSummaryWrapper } from '../../../components/Share';

export type LimitOrderRateProps = {
  onChangePrice: (price?: BigNumber) => void;
  inputPrice?: BigNumber;
  inputCurrency: Currency;
  outputCurrency: Currency;
  trade: Trade;
};

export const LimitOrderRate: React.FC<LimitOrderRateProps> = ({
  onChangePrice,
  inputPrice,
  inputCurrency,
  outputCurrency,
  trade,
}) => {
  const [isFocus, setFocus] = useState<boolean>(false);

  const onInputFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const onInputBlur = useCallback(() => {
    setFocus(false);
  }, []);

  return (
    <StyledLimitOrderSummaryWrapper>
      <StyledLabel>1 {inputCurrency?.symbol} = </StyledLabel>
      <StyledInputContainer focus={isFocus}>
        <TokenInput
          decimals={18}
          value={inputPrice}
          onChange={onChangePrice}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <StyledCurrencyLabel>{outputCurrency?.symbol}</StyledCurrencyLabel>
      </StyledInputContainer>
    </StyledLimitOrderSummaryWrapper>
  );
};

const StyledLabel = styled.span`
  margin-right: 8px;
  display: flex;
  white-space: nowrap;
`;

const StyledCurrencyLabel = styled.div`
  max-width: 92px;
  padding-left: 4px;
  padding-right: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 500;
  &:hover {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyledInputContainer = styled.div<{ focus?: boolean }>`
  width: 100%;
  height: 46px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: solid 1px ${({ theme, focus }) => (focus ? theme.success : theme.input.border)};
  color: ${({ theme }) => theme.gray3};
  background-color: ${({ theme }) => theme.input.background};
  input {
    flex: 1;
    font-weight: 500;
    height: 100%;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.gray3};
    border: unset;
    padding: 0px 14px;
    font-size: 18px;
    &:focus {
      color: ${({ theme }) => theme.gray3};
    }
  }
`;
