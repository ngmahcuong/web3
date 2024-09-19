import { BigNumber } from '@ethersproject/bignumber';
import React, { useMemo, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { TokenSymbol } from '../TokenSymbol';
import { TokenInput } from './TokenInput';
import { screenUp } from '../../utils/styles';
import { formatBigNumber } from '../../utils/numbers';
import { useUserWallet } from '../../providers/UserWalletProvider';

type Size = 'md' | 'lg';

const FontSize = {
  md: '24px',
  lg: '24px',
};

const LogoSize = {
  md: '24px',
  lg: '42px',
};

const BorderRadius = {
  md: '0px',
  lg: '0px',
};

const Padding = {
  md: '4px 5px',
  lg: '8px 10px',
};

const ButtonMaxPadding = {
  md: '0px 10px;',
  lg: '0px 10px',
};

const ButtonMaxHeight = {
  md: '24px',
  lg: '28px',
};

export type TokenInputWithMaxButtonProps = {
  value: BigNumber | undefined;
  subValue?: string;
  maxValue?: BigNumber;
  maxValidateValue?: BigNumber;
  decimals: number;
  symbol?: string;
  onChange?: (v: BigNumber) => void;
  size?: Size;
  width?: string;
  disabled?: boolean;
  steps?: {
    ratio: number;
    label?: string;
  }[];
  buttonMaxTitle?: string;
  buttonMaxWidth?: string;
  skipCheckZero?: boolean;
  inValid?: boolean;
  hideLogo?: boolean;
  showTokenName?: boolean;
  hideMaxButton?: boolean;
};

export const TokenInputWithMaxButton: React.FC<TokenInputWithMaxButtonProps> = ({
  value,
  subValue,
  maxValue,
  maxValidateValue,
  decimals,
  onChange,
  disabled,
  size = 'md',
  symbol,
  steps,
  buttonMaxTitle,
  inValid,
  hideLogo,
  showTokenName,
  hideMaxButton,
}) => {
  const { account } = useUserWallet();
  const [focus, setFocus] = useState(false);

  const isShowMaxButton = useMemo(() => {
    return !disabled && account && !hideMaxButton;
  }, [account, disabled, hideMaxButton]);

  const isInvalid = useMemo(() => {
    if (disabled) return false;
    if (inValid) {
      return true;
    }
    const max = maxValidateValue ? maxValidateValue : maxValue;
    return value && max && value.gt(max);
  }, [disabled, inValid, maxValidateValue, maxValue, value]);

  const currentRatio = useMemo(() => {
    if (!value || !maxValue || maxValue.eq(BigNumber.from(0))) return;
    return +formatBigNumber(value?.mul(1e6)?.div(maxValue), 4);
  }, [maxValue, value]);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const onSelectRatio = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      const ratio = +ev.currentTarget.dataset.ratio;
      if (ratio !== undefined && maxValue && onChange) {
        const value = maxValue.mul(ratio).div(100);
        onChange(value);
      }
    },
    [maxValue, onChange],
  );

  const setMax = useCallback(() => {
    if (!onChange) return;
    onChange(maxValue);
  }, [maxValue, onChange]);

  return (
    <StyledContainer>
      <TokenInputContainer focused={focus} invalid={isInvalid} disabled={disabled} size={size}>
        {!hideLogo && (
          <StyledLogo className="logo">
            <TokenSymbol symbol={symbol} size={LogoSize[size]} />
          </StyledLogo>
        )}
        <div className="content">
          <StyledInputContent showTokenName={showTokenName}>
            {showTokenName && <StyledTokenName>{symbol}</StyledTokenName>}
            <TokenInput
              decimals={decimals}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled}
            />
          </StyledInputContent>
          {subValue && <StyledInputValue>{subValue}</StyledInputValue>}
        </div>
        {isShowMaxButton ? (
          <StyledButtonMax onClick={setMax}>{buttonMaxTitle || 'MAX'}</StyledButtonMax>
        ) : null}
      </TokenInputContainer>
      {steps ? (
        <StyledStep>
          {steps?.map((step, index) => (
            <StyledStepItem
              active={step.ratio === currentRatio}
              data-ratio={step.ratio}
              key={index}
              onClick={onSelectRatio}
            >
              <div>{step.label ? step.label : step.ratio}</div>
            </StyledStepItem>
          ))}
        </StyledStep>
      ) : null}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledTokenName = styled.span`
  font-weight: 500;
  color: ${(p) => p.theme.text.muted};
`;

const TokenInputContainer = styled.div<{
  focused: boolean;
  invalid: boolean;
  disabled?: boolean;
  size?: Size;
}>`
  display: flex;
  width: 100%;
  height: 100%;
  padding: ${(p) => Padding[p.size || 'lg']};
  border-radius: ${(p) => BorderRadius[p.size || 'lg']};
  border: solid 1px ${(p) => p.theme.input.border};
  background-color: ${(p) => p.theme.input.background};
  align-items: center;
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  input {
    width: 100%;
    padding: 0;
    background: transparent;
    border: none;
    font-size: ${(p) => FontSize[p.size || 'lg']};
    font-weight: 500;
    line-height: 1;
    color: ${(p) =>
      !p.invalid ? (p.disabled ? p.theme.input.disable : undefined) : p.theme.danger};
    ::placeholder {
      color: ${(p) => p.theme.input.placeholder};
    }
  }
  .content {
    width: 100%;
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
`;

const StyledInputContent = styled.div<{ showTokenName?: boolean }>`
  display: flex;
  align-items: center;
  ${({ showTokenName }) =>
    showTokenName &&
    css`
      flex-direction: column;
      align-items: flex-start;
    `};
`;

const StyledInputValue = styled.div`
  min-height: 23px;
  padding-top: 2px;
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.input.disable};
`;

const StyledButtonMax = styled.button<{
  size?: Size;
  buttonMaxWidth?: string;
}>`
  align-self: center;
  margin-left: 12px;
  padding: ${(p) => ButtonMaxPadding[p.size || 'lg']};
  height: ${(p) => ButtonMaxHeight[p.size || 'lg']};
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.text.primary};
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

const StyledStep = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 16px;
`;

const StyledStepItem = styled.div<{ active?: boolean }>`
  margin: 0px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 28px;
  font-size: 13px;
  font-weight: normal;
  color: ${({ active, theme }) => (active ? theme.success : theme.muted)};
  border: 1px solid ${({ active, theme }) => (active ? theme.success : theme.muted)};
  :hover {
    color: ${({ theme }) => theme.success};
    border: solid 1px;
  }
`;
