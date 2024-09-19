import { Zero } from '@ethersproject/constants';
import { isInteger } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import Modal, {
  ModalBackButton,
  ModalCloseButton,
  ModalHeader,
  ModalProps,
} from '../../../../components/Modal/ModalStyles';
import { Toggle } from '../../../../components/Toggle';
import useDebounce from '../../../../hooks/useDebounce';
import { useTransactionTTL } from '../../../../state/application/hooks';
import {
  useExpertModeManager,
  useGasPriceOptionManager,
  useGetGasPrices,
  useHideExpertModeAcknowledgement,
  useSingleHopOnly,
} from '../../../../state/dex/hooks';
import { GasOption } from '../../../../state/dex/reducer';
import { screenUp } from '../../../../utils/styles';
import ExpertModeSetting from './ExpertModeSetting';
import SettingModalView from './SettingModalView';
import { SlippageSetting } from './SlippageSetting';

const SettingModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const [deadline, setDeadline] = useTransactionTTL();
  const [deadlineInput, setDeadlineInput] = useState<string>(`${deadline}`);
  const debouncedInput = useDebounce(deadlineInput, 200);
  const [expertMode, toggleSetExpertMode] = useExpertModeManager();
  const [hideExpertModeAcknowledgement, setHideExpertModeAcknowledgement] =
    useHideExpertModeAcknowledgement();
  const [singleHopOnly, setSingleHopOnly] = useSingleHopOnly();
  const [gasPriceOption, setGasPriceOption] = useGasPriceOptionManager();
  const gasPrices = useGetGasPrices();
  const [view, setView] = useState<SettingModalView>(SettingModalView.setting);

  const config = {
    [SettingModalView.setting]: { title: 'Setting', onBack: undefined },
    [SettingModalView.confirm]: {
      title: 'Expert Mode',
      onBack: () => setView(SettingModalView.setting),
    },
  };

  const onChangeDeadline = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    const valueDeadline: number = +value;
    if (
      !ev.currentTarget.validity.valid ||
      isNaN(valueDeadline) ||
      (value && valueDeadline < 1) ||
      !isInteger(valueDeadline)
    ) {
      return;
    }
    setDeadlineInput(value?.toString());
  }, []);

  const handleExpertMode = useCallback(() => {
    if (!expertMode && !hideExpertModeAcknowledgement) {
      setView(SettingModalView.confirm);
      return;
    }
    toggleSetExpertMode();
  }, [expertMode, hideExpertModeAcknowledgement, toggleSetExpertMode]);

  useEffect(() => {
    setDeadline(debouncedInput ? +debouncedInput : 20);
  }, [debouncedInput, setDeadline]);

  return (
    <Modal size="xs">
      <StyledModalHeader>
        {config[view].onBack && <ModalBackButton onClick={config[view]?.onBack} />}
        <StyledModalTitle>{config[view].title}</StyledModalTitle>
        <ModalCloseButton onClick={onDismiss} />
      </StyledModalHeader>
      <StyledContent>
        {view === SettingModalView.setting ? (
          <>
            {gasPrices &&
            gasPrices[GasOption.Normal] &&
            gasPrices[GasOption.Normal]._isBigNumber &&
            gasPrices[GasOption.Normal].gt(Zero) ? (
              <StyledBox>
                <StyledTitle>General</StyledTitle>
                <StyledLabel>Default Transaction Speed (GWEI)</StyledLabel>
                <StyledSpeedWrapper>
                  <StyledButton
                    onClick={() => {
                      setGasPriceOption(GasOption.Normal);
                    }}
                    selected={gasPriceOption === GasOption.Normal}
                  >
                    Normal (
                    <BigNumberValue value={gasPrices?.[GasOption.Normal]} decimals={9} />)
                  </StyledButton>
                  <StyledButton
                    onClick={() => {
                      setGasPriceOption(GasOption.Fast);
                    }}
                    selected={gasPriceOption === GasOption.Fast}
                  >
                    Fast (
                    <BigNumberValue value={gasPrices?.[GasOption.Fast]} decimals={9} />)
                  </StyledButton>
                  <StyledButton
                    onClick={() => {
                      setGasPriceOption(GasOption.VeryFast);
                    }}
                    selected={gasPriceOption === GasOption.VeryFast}
                  >
                    Very Fast (
                    <BigNumberValue value={gasPrices?.[GasOption.VeryFast]} decimals={9} />)
                  </StyledButton>
                </StyledSpeedWrapper>
              </StyledBox>
            ) : null}

            <StyledBox>
              <StyledTitle>Swaps & liquidity</StyledTitle>
              <SlippageSetting />
              <StyledFlex>
                <StyledSettingLabel>Tx deadline (mins)</StyledSettingLabel>
                <StyledInput
                  type="text"
                  pattern="^[0-9]+$"
                  placeholder={`${deadline}` || '0'}
                  value={deadlineInput}
                  onChange={onChangeDeadline}
                />
              </StyledFlex>
              <StyledFlex>
                <StyledSettingLabel>Expert Mode</StyledSettingLabel>
                <Toggle checked={expertMode} onClick={handleExpertMode} />
              </StyledFlex>
              <StyledFlex>
                <StyledSettingLabel>Disable Multihops</StyledSettingLabel>
                <Toggle checked={singleHopOnly} onClick={setSingleHopOnly} />
              </StyledFlex>
            </StyledBox>
          </>
        ) : view === SettingModalView.confirm ? (
          <ExpertModeSetting
            onBack={() => setView(SettingModalView.setting)}
            setHideExpertModeAcknowledgement={setHideExpertModeAcknowledgement}
          />
        ) : (
          <></>
        )}
      </StyledContent>
    </Modal>
  );
};

export default SettingModal;

const StyledModalHeader = styled(ModalHeader)`
  padding: 13px 9px 14px 15px;
`;

const StyledModalTitle = styled.div`
  font-weight: bold;
`;

const StyledContent = styled.div`
  padding: 0 16px 16px;
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

const StyledBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0;
  &:not(:last-child) {
    padding-bottom: 18px;
    border-bottom: 1px solid ${({ theme }) => theme.box.border};
  }
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.warning};
  font-size: 14px;
`;

const StyledLabel = styled.div`
  padding-top: 5px;
  padding-bottom: 9px;
`;

const StyledSettingLabel = styled.div``;

const StyledSpeedWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  > * + * {
    margin-left: 13px;
  }
`;

const StyledFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
`;

const StyledButton = styled.button<{ selected?: boolean }>`
  padding: 6px;
  width: auto;
  font-size: 12px;
  font-weight: normal;
  color: ${({ selected, theme }) => (selected ? theme.success : theme.gray3)};
  background-color: transparent;
  border-color: ${({ selected, theme }) => (selected ? theme.success : theme.box.border)};
  border-style: solid;
  border-width: 1px;
  width: 100%;
  :hover {
    border-color: ${({ theme }) => theme.success};
  }
  ${screenUp('lg')`
    font-size: 14px;
    padding: 8px 0;
  `}
`;

const StyledInput = styled.input`
  width: 65px;
  height: 24px;
  background: transparent;
  padding: 0 25px 0 0;
  color: ${({ theme }) => theme.gray3};
  text-align: center;
  font-size: 14px;
  border: solid 1px ${({ theme }) => theme.box.border};
  z-index: 1;
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.success};
    border: solid 1px ${({ theme }) => theme.success};
  }
`;
