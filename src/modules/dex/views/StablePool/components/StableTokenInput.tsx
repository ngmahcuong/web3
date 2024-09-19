import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import { useTokenBalance, useWatchTokenBalance } from '../../../../../state/user/hooks';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Button } from '../../../../../components/Buttons';
import { BigNumber } from 'ethers';
import { TokenInput } from '../../../../../components/TokenInput';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { useTokenConfig } from '../../../../../hooks/useTokenConfig';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useApprove } from '../../../../../hooks/useApprove';
import { Precision } from '../../../../../utils/constants';
import { Market } from '../../../../lending/models/Lending';

export type StableItemInputProps = {
  index: number;
  symbol?: string;
  basepoolAddress?: string;
  value: BigNumber | undefined;
  disabled?: boolean;
  market?: Market;
  usingZap?: boolean;
  onChange: (index: number, value: BigNumber) => void;
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

const StableTokenInput: React.FC<StableItemInputProps> = ({
  index,
  symbol,
  basepoolAddress,
  value,
  disabled,
  onChange: _onChange,
  market,
  usingZap,
}) => {
  const { account } = useUserWallet();
  const watchTokens = useWatchTokenBalance();

  const token = useTokenConfig(symbol);
  const balance = useTokenBalance(symbol);
  const [focus, setFocus] = useState(false);
  const { approve, isApproved, loadingSubmit } = useApprove(symbol, basepoolAddress);

  const subValue = useMemo(() => {
    if (!value || !market) {
      return;
    }
    if (usingZap) {
      return value?.mul(market?.underlyingPrice).div(Precision);
    }
    return value
      ?.mul(market?.exchangeRate)
      .mul(market?.underlyingPrice)
      .div(Precision)
      .div(Precision);
  }, [value, market, usingZap]);

  useEffect(() => {
    watchTokens([token?.address]);
  }, [token, watchTokens]);
  const onFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const isInvalid = useMemo(() => {
    if (disabled) return false;

    return value && balance && value.gt(balance);
  }, [balance, disabled, value]);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const onChange = useCallback(
    (v: BigNumber) => {
      _onChange(index, v);
    },
    [_onChange, index],
  );

  const setMax = useCallback(() => {
    if (!onChange) return;
    if (isApproved) {
      onChange(balance);
    }
  }, [onChange, isApproved, balance]);

  return (
    <>
      <StyledInputHeader>
        Input {token?.name}
        <div className="balance">
          Balance:
          <button onClick={setMax}>
            <BigNumberValue value={balance} decimals={token?.decimals} fractionDigits={4} />
          </button>
          <span>{token?.name}</span>
        </div>
      </StyledInputHeader>
      <TokenInputContainer focused={focus} invalid={isInvalid}>
        <StyledLogo className="logo">
          <TokenSymbol symbol={symbol} size={45} />
        </StyledLogo>
        <div className="content">
          <span>{token?.name}</span>
          <StyledInputContent>
            <TokenInput
              decimals={token?.decimals}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={!isApproved}
            />
          </StyledInputContent>
          {subValue && (
            <StyledSubValue>
              $<BigNumberValue value={subValue} decimals={18} fractionDigits={4} />
            </StyledSubValue>
          )}
        </div>
        {account ? (
          <>
            {!isApproved ? (
              <StyledButtonApprove
                isLoading={loadingSubmit}
                disabled={loadingSubmit}
                onClick={approve}
              >
                {isApproved ? 'Approved' : 'Approve'}
              </StyledButtonApprove>
            ) : (
              <StyledButtonMax onClick={setMax} size={'lg'}>
                {'MAX'}
              </StyledButtonMax>
            )}
          </>
        ) : (
          <></>
        )}
      </TokenInputContainer>
      <StyledInputContent></StyledInputContent>
    </>
  );
};
const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
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
  focused?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  size?: Size;
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
const StyledSubValue = styled.div`
  min-height: 23px;
  padding-top: 2px;
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.input.disable};
`;

const StyledLogo = styled.div`
  display: flex;
  align-self: center;
  justify-content: center;
  margin-right: 10px;
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

const StyledButtonApprove = styled(Button)`
  font-weight: 500;
  font-size: 14px;
  padding: 0 10px;
  height: 32px;
`;

export default StableTokenInput;
