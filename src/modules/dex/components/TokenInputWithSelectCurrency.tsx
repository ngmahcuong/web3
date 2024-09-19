import { BigNumber } from '@ethersproject/bignumber';
import React, { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Currency } from '@uniswap/sdk-core';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { CurrencySearchModal } from './CurrencySearchModal/CurrencySearchModal';
import useModal from '../../../hooks/useModal';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { TokenInput } from '../../../components/TokenInput';
import { screenUp } from '../../../utils/styles';
import { DexTokenSymbol } from './DexTokenSymbol';
import { CurrencyThreshold } from '../../../utils/constants';

export type TokenInputWithSelectCurrencyProps = {
  value: BigNumber | undefined;
  currency: Currency;
  maxValue?: BigNumber;
  maxValidateValue?: BigNumber;
  onChange?: (v: BigNumber) => void;
  onCurrencySelect?: (currency: Currency) => void;
  disabled?: boolean;
  buttonMaxTitle?: string;
  buttonMaxWidth?: string;
  skipCheckZero?: boolean;
  inValid?: boolean;
  label?: string;
  hideMaxButton?: boolean;
  output?: boolean;
};

export const TokenInputWithSelectCurrency: React.FC<TokenInputWithSelectCurrencyProps> = ({
  value,
  maxValue,
  maxValidateValue,
  onChange,
  onCurrencySelect,
  disabled,
  buttonMaxTitle,
  inValid,
  currency,
  label,
  hideMaxButton,
  output,
}) => {
  const { account } = useUserWallet();
  const [focus, setFocus] = useState(false);

  const isShowMaxButton = useMemo(() => {
    return !disabled && account && !hideMaxButton && currency?.symbol;
  }, [account, disabled, hideMaxButton, currency]);

  const isInvalid = useMemo(() => {
    if (disabled) return false;
    if (inValid) {
      return true;
    }
    const max = maxValidateValue ? maxValidateValue : maxValue;
    return value && max && value.gt(max);
  }, [disabled, inValid, maxValidateValue, maxValue, value]);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const setMax = useCallback(() => {
    if (!onChange) return;
    onChange(maxValue);
  }, [maxValue, onChange]);

  const currencySearchModal = useMemo(
    () => (
      <CurrencySearchModal
        onCurrencySelect={onCurrencySelect}
        selectedCurrency={currency}
        isShowCommonBase
      />
    ),
    [currency, onCurrencySelect],
  );

  const [showCurrencySearchModal] = useModal(currencySearchModal, 'currency');

  return (
    <StyledContainer>
      <StyledInputHeader>
        {label}
        {currency && (
          <div className="right-header">
            Balance:
            <button onClick={setMax} className="balance" disabled={disabled ? true : false}>
              <BigNumberValue
                value={maxValue}
                decimals={currency?.decimals}
                threshold={CurrencyThreshold}
              />
            </button>
          </div>
        )}
      </StyledInputHeader>
      <TokenInputContainer
        focused={focus}
        invalid={isInvalid}
        disabled={disabled}
        output={output}
      >
        <StyledLogo className="logo" onClick={showCurrencySearchModal}>
          <DexTokenSymbol
            address={currency?.isNative ? currency?.symbol : currency?.wrapped?.address}
            size={45}
          />
        </StyledLogo>
        <div className="content">
          <StyledSelectToken onClick={showCurrencySearchModal} unselected={!currency?.symbol}>
            {currency?.symbol ? (
              <span>{currency?.symbol}</span>
            ) : (
              <span className="select-token">Select a token</span>
            )}
            <i className="far fa-angle-down"></i>
          </StyledSelectToken>
          <StyledInputContent>
            <TokenInput
              decimals={currency?.decimals}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled}
            />
          </StyledInputContent>
        </div>
        {isShowMaxButton ? (
          <StyledButtonMax onClick={setMax}>{buttonMaxTitle || 'MAX'}</StyledButtonMax>
        ) : null}
      </TokenInputContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.gray3};
`;

const StyledInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  font-weight: 500;
  .right-header {
    color: ${({ theme }) => theme.gray3};
    margin-left: auto;
    font-size: 14px;
    font-weight: normal;
    .balance {
      margin: 0;
      font-weight: normal;
      color: ${({ theme }) => theme.text.primary};
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
  }
`;

const TokenInputContainer = styled.div<{
  focused: boolean;
  invalid: boolean;
  disabled?: boolean;
  output?: boolean;
}>`
  display: flex;
  width: 100%;
  max-height: 80px;
  padding: 10px 14px;
  border: solid 1px ${(p) => p.theme.input.border};
  background-color: ${(p) => p.theme.input.background};
  align-items: center;
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
  }
  input {
    width: 100%;
    height: 100%;
    padding: 0;
    background: transparent;
    border: none;
    font-size: 24px;
    font-weight: 500;
    line-height: 1;
    color: ${(p) =>
      !p.invalid
        ? p.output
          ? p.theme.text.highlight
          : p.disabled
          ? p.theme.input.disable
          : p.theme.text.primary
        : p.theme.danger};
    ::placeholder {
      color: ${(p) => p.theme.input.placeholder};
    }
  }
  .dropdown {
    display: flex;
    align-items: center;
  }
`;

const StyledLogo = styled.div`
  display: flex;
  align-self: center;
  justify-content: center;
  margin-right: 10px;
  cursor: pointer;
  :hover {
    filter: brightness(80%);
  }
`;

const StyledInputContent = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButtonMax = styled.button<{
  buttonMaxWidth?: string;
}>`
  align-self: center;
  margin-left: 12px;
  padding: 0px 10px;
  height: 28px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${(p) => p.theme.text.primary};
  border-radius: 1px;
  opacity: 0.7;
  transition: all 0.2s ease-in-out 0s;
  width: ${({ buttonMaxWidth }) => buttonMaxWidth || 'fit-content'};
  :hover {
    opacity: 1;
    border: 1px solid ${({ theme }) => theme.success};
    color: ${({ theme }) => theme.success};
  }
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const StyledSelectToken = styled.div<{ unselected?: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  color: ${({ theme, unselected }) => (unselected ? theme.success : theme.gray3)};
  font-weight: 500;
  cursor: pointer;
  width: max-content;
  :hover {
    color: ${({ theme, unselected }) => (unselected ? theme.gray3 : theme.success)};
  }
  i {
    margin-left: 7px;
    margin-top: 2px;
  }
`;
