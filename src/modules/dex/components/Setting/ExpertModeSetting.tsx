import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/Buttons';
import { Checkbox } from '../../../../components/Checkbox';
import { useExpertModeManager } from '../../../../state/dex/hooks';

interface ExpertModeSettingProps {
  onBack: () => void;
  setHideExpertModeAcknowledgement: (boolean) => void;
}

const ExpertModeSetting: React.FC<ExpertModeSettingProps> = ({
  onBack,
  setHideExpertModeAcknowledgement,
}) => {
  const [, toggleExpertMode] = useExpertModeManager();
  const [isRememberChecked, setIsRememberChecked] = useState(false);

  const onButtonClick = useCallback(() => {
    if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
      toggleExpertMode();
      if (isRememberChecked) {
        setHideExpertModeAcknowledgement(true);
      }
      onBack();
    }
  }, [isRememberChecked, onBack, setHideExpertModeAcknowledgement, toggleExpertMode]);

  return (
    <StyledContainer>
      <StyledWarning>
        <StyledText>
          Expert mode turns off the 'Confirm' transaction prompt, and allows high slippage
          trades that often result in bad rates and lost funds.
        </StyledText>
        <StyledText>Only use this mode if you know what you’re doing.</StyledText>
      </StyledWarning>
      <Checkbox
        text="Don't show this again"
        onClick={() => setIsRememberChecked(!isRememberChecked)}
        active={isRememberChecked}
      />
      <Button block onClick={onButtonClick} size="md">
        Turn On Expert Mode
      </Button>
    </StyledContainer>
  );
};

export default ExpertModeSetting;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: 15px;
  gap: 15px;
  padding: 16px 0;
`;

const StyledWarning = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.box.border};
  border-radius: 3px;
  grid-gap: 1rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.warning};
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.warning};
  font-size: 14px;
`;
