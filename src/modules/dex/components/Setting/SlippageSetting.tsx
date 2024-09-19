import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import useDebounce from '../../../../hooks/useDebounce';
import theme from '../../../../providers/Theme/light';
import {
  useSetSlippageTolerance,
  useTrasactionSettings,
} from '../../../../state/application/hooks';
import { screenUp } from '../../../../utils/styles';

enum SlippageMessageType {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

export const SlippageSetting: React.FC = () => {
  const settings = useTrasactionSettings();

  const [inputSlippage, setInputSlippage] = useState<string>(
    `${settings.slippageTolerance * 100}`,
  );
  const [messageType, setMessageType] = useState<SlippageMessageType>(undefined);
  const setSlippage = useSetSlippageTolerance();
  const debouncedInput = useDebounce(inputSlippage, 200);

  const setPresetSlippage = useCallback((ev: React.MouseEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.dataset.value;
    setInputSlippage((+value * 100).toString());
  }, []);

  useEffect(() => {
    if (+debouncedInput >= 50) {
      setMessageType(SlippageMessageType.InvalidInput);
      return;
    } else if (+debouncedInput > 5) {
      setMessageType(SlippageMessageType.RiskyHigh);
    } else if (+debouncedInput < 0.5 && +debouncedInput > 0) {
      setMessageType(SlippageMessageType.RiskyLow);
    } else {
      setMessageType(undefined);
    }
    setSlippage(debouncedInput && +debouncedInput < 50 ? +debouncedInput / 100 : 0.005);
  }, [debouncedInput, setSlippage]);

  const onSlippageChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const value = target.value;
    const valueSlippage = +value;
    if (isNaN(valueSlippage)) {
      return;
    }
    setInputSlippage(value?.toString());
  }, []);

  const message = useMemo(() => {
    switch (messageType) {
      case SlippageMessageType.InvalidInput:
        return `Enter a valid slippage percentage`;
      case SlippageMessageType.RiskyLow:
        return `Your transaction may fail`;
      case SlippageMessageType.RiskyHigh:
        return `Your transaction may be frontrun`;
      default:
        return '';
    }
  }, [messageType]);

  const messageColor = useMemo(() => {
    switch (messageType) {
      case SlippageMessageType.InvalidInput:
        return theme.danger;
      case SlippageMessageType.RiskyLow:
        return theme.muted;
      case SlippageMessageType.RiskyHigh:
        return theme.warning;
      default:
        return '';
    }
  }, [messageType]);

  return (
    <StyledContainer>
      <StyleSlippage>
        <StyledSettingLabel>Slippage</StyledSettingLabel>
        <StyledSetting>
          <Button
            selected={settings.slippageTolerance === 0.005}
            onClick={setPresetSlippage}
            data-value="0.005"
          >
            0.5%
          </Button>
          <Button
            onClick={setPresetSlippage}
            data-value="0.01"
            selected={settings.slippageTolerance === 0.01}
          >
            1%
          </Button>
          <Button
            onClick={setPresetSlippage}
            data-value="0.02"
            selected={settings.slippageTolerance === 0.02}
          >
            2%
          </Button>
          <StyledInputWrapper>
            <StyledInput
              type="text"
              placeholder={`${settings.slippageTolerance * 100}` || '0.0'}
              pattern="^[0-9]+$"
              value={inputSlippage}
              onChange={onSlippageChange}
              error={messageType === SlippageMessageType.InvalidInput}
            />
            <div className="ratio">
              <span>%</span>
            </div>
          </StyledInputWrapper>
        </StyledSetting>
      </StyleSlippage>
      {message ? <StyledMessage color={messageColor}>{message}</StyledMessage> : null}
    </StyledContainer>
  );
};

const StyleSlippage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  > * + * {
    margin-top: 10px;
  }
  ${screenUp('lg')`
      align-items: center;
      flex-direction: row;
      > * + * {
      margin-top: 0;
      }
  `}
`;

const StyledSettingLabel = styled.div``;

const StyledContainer = styled.div`
  display: block;
  padding: 10px 0;
`;

const StyledSetting = styled.div`
  display: flex;
  grid-gap: 10px;
  gap: 10px;
`;

const Button = styled.button<{ selected?: boolean }>`
  padding: 3px;
  width: 48px;
  font-size: 14px;
  font-weight: normal;
  color: ${({ selected }) => (selected ? theme.success : theme.gray3)};
  background-color: transparent;
  border-color: ${({ selected, theme }) => (selected ? theme.success : theme.box.border)};
  border-style: solid;
  border-width: 1px;
  :hover {
    border-color: ${({ theme }) => theme.success};
  }
`;

const StyledInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  .ratio {
    position: absolute;
    right: 1px;
    top: 1px;
    bottom: 1px;
    padding: 0px 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: solid 1px ${({ theme }) => theme.box.border};
    background-color: ${({ theme }) => theme.box.border};
    font-size: 14px;
  }
`;

const StyledInput = styled.input<{ error?: boolean }>`
  width: 65px;
  height: 24px;
  background: transparent;
  padding: 0 25px 0 0;
  color: ${({ error, theme }) => (error ? theme.danger : theme.gray3)};
  text-align: center;
  font-size: 14px;
  border: solid 1px ${({ error, theme }) => (error ? theme.danger : theme.box.border)};
  z-index: 1;
  &:focus {
    outline: none;
    color: ${({ error, theme }) => (error ? theme.danger : theme.success)};
    border: solid 1px ${({ error, theme }) => (error ? theme.danger : theme.success)};
  }
`;

const StyledMessage = styled.div<{ color: string }>`
  font-size: 12px;
  color: ${({ color }) => color};
  padding-top: 6px;
  &.error {
    color: ${({ theme }) => theme.danger};
  }
  ${screenUp('lg')`
    text-align: right;
  `}
`;
