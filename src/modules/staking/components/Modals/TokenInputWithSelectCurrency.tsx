import { BigNumber } from '@ethersproject/bignumber';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Currency } from '@uniswap/sdk-core';
import { useUserWallet } from '../../../../providers/UserWalletProvider';
import useModal from '../../../../hooks/useModal';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import { TokenInput } from '../../../../components/TokenInput';
import { screenUp } from '../../../../utils/styles';
import SelectTokenModal from './SelectTokenModal';
import { getAllChefPoolsConfig, getTokenConfig } from '../../../../config';
import { useWeb3React } from '@web3-react/core';
import { useTokenBalance, useWatchTokenBalance } from '../../../../state/user/hooks';
import { TokenSymbol } from '../../../../components/TokenSymbol';
import { useTokenConfig } from '../../../../hooks/useTokenConfig';

export type TokenInputWithSelectCurrencyProps = {
  value: BigNumber | undefined;
  currency: Currency;
  onChange?: (v: BigNumber) => void;
  onTokenLPSelect?: (token: string, poolIndex: number) => void;
  disabled?: boolean;
  buttonMaxTitle?: string;
  buttonMaxWidth?: string;
  skipCheckZero?: boolean;
  inValid?: boolean;
  label?: string;
  hideMaxButton?: boolean;
};

export const TokenInputWithSelectCurrency: React.FC<TokenInputWithSelectCurrencyProps> = ({
  value,
  onChange,
  onTokenLPSelect,
  disabled,
  buttonMaxTitle,
  inValid,
  currency,
  label,
  hideMaxButton,
}) => {
  const { account } = useUserWallet();
  const { chainId } = useWeb3React();
  const [focus, setFocus] = useState(false);
  const [farmItem, setFarmItem] = useState(undefined);
  const pools = getAllChefPoolsConfig(chainId);

  const watchTokens = useWatchTokenBalance();
  const balance = useTokenBalance(farmItem?.wantSymbol);
  const tokenLP = useTokenConfig(farmItem?.wantSymbol);
  useEffect(() => {
    watchTokens([tokenLP?.address]);
  }, [tokenLP?.address, watchTokens, account]);

  const isShowMaxButton = useMemo(() => {
    return !disabled && account && !hideMaxButton && farmItem?.wantSymbol;
  }, [account, disabled, hideMaxButton, farmItem?.wantSymbol]);

  const isInvalid = useMemo(() => {
    if (disabled) return false;
    if (inValid) {
      return true;
    }
    const max = balance;
    return value && max && value.gt(max);
  }, [disabled, inValid, balance, value]);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const setMax = useCallback(() => {
    if (!onChange) return;
    onChange(balance);
  }, [balance, onChange]);

  const onTokenSelect = useCallback(
    (index: number) => {
      const token = getTokenConfig(chainId, pools[index]?.wantSymbol);
      setFarmItem(pools[index]);
      onTokenLPSelect(token?.address, index);
    },
    [chainId, onTokenLPSelect, pools],
  );

  const [showSelectTokenModal] = useModal(
    <SelectTokenModal onTokenSelect={onTokenSelect} lpTokens={pools} />,
    'currency',
  );
  return (
    <StyledContainer>
      <StyledInputHeader>
        {label}
        {farmItem && (
          <div className="right-header">
            Balance:
            <button onClick={setMax} className="balance">
              <BigNumberValue value={balance} decimals={tokenLP?.decimals} />
            </button>
          </div>
        )}
      </StyledInputHeader>
      <TokenInputContainer focused={focus} invalid={isInvalid} disabled={disabled}>
        {farmItem ? (
          <StyledLogo hasToken={true} className="logo" onClick={() => {}}>
            <TokenSymbol size={36} symbol={farmItem?.wantTokens[0]} />
            <TokenSymbol size={36} symbol={farmItem?.wantTokens[1]} />
          </StyledLogo>
        ) : (
          <StyledLogo hasToken={false} className="logo" onClick={() => {}}>
            <TokenSymbol size={44} symbol="" />
          </StyledLogo>
        )}

        <div className="content">
          <StyledSelectToken onClick={showSelectTokenModal} unselected={!currency?.symbol}>
            {tokenLP?.symbol ? (
              <span>{tokenLP?.name}</span>
            ) : (
              <span className="select-token">Select a token</span>
            )}
            <i className="far fa-angle-down"></i>
          </StyledSelectToken>
          <StyledInputContent>
            <TokenInput
              decimals={18}
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
    padding: 0;
    background: transparent;
    border: none;
    font-size: 24px;
    font-weight: 500;
    line-height: 1;
    color: ${(p) =>
      !p.invalid ? (p.disabled ? p.theme.input.disable : undefined) : p.theme.danger};
    ::placeholder {
      color: ${(p) => p.theme.input.placeholder};
    }
  }
  .dropdown {
    display: flex;
    align-items: center;
  }
`;

const StyledLogo = styled.div<{ hasToken?: boolean }>`
  display: flex;
  align-self: center;
  justify-content: center;
  margin-right: 10px;
  cursor: pointer;
  position: relative;
  :hover {
    filter: brightness(80%);
  }

  img {
    + img {
      position: absolute;
      left: 32px;
    }
  }

  & + .content {
    margin-left: ${(p) => (p.hasToken ? '30px' : '0px')};
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
  border: 1px solid ${(p) => p.theme.input.border};
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
