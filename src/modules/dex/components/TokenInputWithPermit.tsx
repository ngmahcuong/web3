import { BigNumber } from '@ethersproject/bignumber';
import React, { useMemo, useState } from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { TokenInput } from '../../../components/TokenInput';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { TokenThreshold } from '../../../utils/constants';
import { screenUp } from '../../../utils/styles';
import { DexTokenSymbol } from './DexTokenSymbol';

type Size = 'md' | 'lg';

const FontSize = {
  md: '24px',
  lg: '24px',
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

export type TokenInputWithPermitProps = {
  maxValue?: BigNumber;
  decimals: number;
  currencyA: string;
  currencyB: string;
  value: BigNumber;
  onChange?: (v: BigNumber) => void;
  label: string;
  size?: Size;
};

export const TokenInputWithPermit: React.FC<TokenInputWithPermitProps> = ({
  currencyA,
  currencyB,
  maxValue,
  decimals,
  value,
  onChange,
  label,
  size = 'lg',
}) => {
  const { account } = useUserWallet();
  const [focus, setFocus] = useState(false);

  const setMax = useCallback(() => {
    if (!onChange) return;
    onChange(maxValue);
  }, [maxValue, onChange]);

  const isInvalid = useMemo(() => {
    return value && maxValue && value.gt(maxValue);
  }, [maxValue, value]);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  return (
    <StyledContainer>
      <StyledInputHeader>
        {label}
        <div className="info">
          Balance:
          <button onClick={setMax} className="balance">
            <BigNumberValue
              fractionDigits={2}
              decimals={decimals}
              value={maxValue}
              threshold={TokenThreshold.DEFAULT}
            />
          </button>
        </div>
      </StyledInputHeader>
      <TokenInputWithPermitContainer>
        <TokenInputContainer focused={focus} invalid={isInvalid} size={size}>
          <StyledLogo>
            <DexTokenSymbol address={currencyA} size={30} />
            <DexTokenSymbol address={currencyB} size={30} />
          </StyledLogo>
          <div className="content">
            <StyledInputContent>
              <TokenInput
                decimals={decimals}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </StyledInputContent>
          </div>
          {account ? <StyledButtonMax onClick={setMax}>{'MAX'}</StyledButtonMax> : null}
        </TokenInputContainer>
      </TokenInputWithPermitContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const StyledInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  font-weight: 500;
  .info {
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

const TokenInputWithPermitContainer = styled.div`
  position: relative;
`;

const TokenInputContainer = styled.div<{
  focused: boolean;
  invalid: boolean;
  disabled?: boolean;
  size?: Size;
}>`
  display: flex;
  width: 100%;
  height: 60px;
  padding: ${(p) => Padding[p.size || 'lg']};
  border-radius: ${(p) => BorderRadius[p.size || 'lg']};
  border: solid 1px ${(p) => p.theme.input.border};
  background-color: ${(p) => p.theme.input.background};
  align-items: center;
  input {
    width: 100%;
    padding: 0;
    background: transparent;
    border: none;
    font-size: ${(p) => FontSize[p.size || 'lg']};
    font-weight: 500;
    color: ${(p) => (!p.invalid ? (p.disabled ? '#93c59f4d' : undefined) : p.theme.danger)};
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
  img {
    z-index: 1;
    :last-child {
      margin-left: -4px;
      z-index: 0;
    }
  }
`;

const StyledInputContent = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButtonMax = styled.button<{
  size?: Size;
  buttonMaxWidth?: string;
}>`
  align-self: center;
  margin-left: 4px;
  padding: ${(p) => ButtonMaxPadding[p.size || 'lg']};
  height: ${(p) => ButtonMaxHeight[p.size || 'lg']};
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${(p) => p.theme.text.primary};
  opacity: 0.7;
  transition: all 0.2s ease-in-out 0s;
  width: ${({ buttonMaxWidth }) => buttonMaxWidth || 'fit-content'};
  :hover {
    opacity: 1;
    border: 1px solid ${(p) => p.theme.success};
    color: ${(p) => p.theme.success};
  }
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;
