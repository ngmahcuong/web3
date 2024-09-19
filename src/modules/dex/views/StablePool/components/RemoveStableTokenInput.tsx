import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import { useTokenBalance, useWatchTokenBalance } from '../../../../../state/user/hooks';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { BigNumber } from 'ethers';
import { TokenInput } from '../../../../../components/TokenInput';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { useTokenConfig } from '../../../../../hooks/useTokenConfig';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useAssetsInfo } from '../hook/useAssetsInfo';

export type RemoveStableItemInputProps = {
  symbol?: string;
  assets?: string[];
  value: BigNumber | undefined;
  disabled?: boolean;
  onChange: (value: BigNumber) => void;
};

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

const RemoveStableTokenInput: React.FC<RemoveStableItemInputProps> = ({
  symbol,
  assets,
  value,
  disabled,
  onChange,
}) => {
  const { account } = useUserWallet();
  const watchTokens = useWatchTokenBalance();
  const token = useTokenConfig(symbol);
  const balance = useTokenBalance(token?.symbol);
  const [focus, setFocus] = useState(false);
  const chTokenInfos = useAssetsInfo(assets);
  useEffect(() => {
    watchTokens([token?.address]);
  }, [token, watchTokens]);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const setMax = useCallback(() => {
    if (!onChange) return;
    onChange(balance);
  }, [onChange, balance]);

  const isInvalid = useMemo(() => {
    if (disabled) return false;

    return value && balance && value.gt(balance);
  }, [balance, disabled, value]);

  return (
    <>
      <StyledInputHeader>
        Remove Amount
        <div className="balance">
          Balance:
          <button onClick={setMax}>
            <BigNumberValue value={balance} decimals={token?.decimals} fractionDigits={4} />
          </button>
          <span>{chTokenInfos?.map((t) => t.name)?.join('/')}</span>
        </div>
      </StyledInputHeader>
      <TokenInputContainer focused={focus} invalid={isInvalid}>
        <StyledLogo className="logo">
          {assets?.map((item, index) => (
            <TokenSymbol symbol={item} size={45} key={index} />
          ))}
        </StyledLogo>
        <div className="content">
          <span>{chTokenInfos?.map((t) => t.name)?.join('/')}</span>
          <StyledInputContent>
            <TokenInput
              decimals={token?.decimals}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </StyledInputContent>
        </div>
        {account ? (
          <>
            <StyledButtonMax onClick={setMax} size={'lg'}>
              {'MAX'}
            </StyledButtonMax>
          </>
        ) : (
          <></>
        )}
      </TokenInputContainer>
      <StyledInputContent></StyledInputContent>
    </>
  );
};

export const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  font-weight: 500;
  color: ${(p) => p.theme.text.primary};
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.text.primary};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.text.primary};
    }
  }
`;

const TokenInputContainer = styled.div<{
  focused: boolean;
  size?: string;
  disabled?: boolean;
  invalid?: boolean;
}>`
  display: flex;
  width: 100%;
  // height: 100%;
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
  margin-left: 12px;
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
    border: 1px solid ${({ theme }) => theme.success};
    color: ${({ theme }) => theme.success};
  }
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

export default RemoveStableTokenInput;
