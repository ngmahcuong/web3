import React from 'react';
import styled from 'styled-components';
import { useCountdown } from '../../../../hooks/useCountdown';
import { screenUp } from '../../../../utils/styles';

export type CountDownProps = {
  timestamp: number;
};

export const Countdown: React.FC<CountDownProps> = ({ timestamp }) => {
  const { started, remaining } = useCountdown(timestamp);
  const zeroPadding = (num: number) => {
    if (num >= 0) {
      return num < 10 ? `0${num}` : num;
    }
    return 0;
  };
  if (!started) {
    return (
      <StyledContainer>
        {remaining.days > 0 && <StyledTime> {zeroPadding(remaining.days)}</StyledTime>}
        {remaining.days > 0 && <TwoDot>:</TwoDot>}
        <StyledTime>{zeroPadding(remaining.hours)}</StyledTime>
        <TwoDot>:</TwoDot>
        <StyledTime>{zeroPadding(remaining.minutes)}</StyledTime>
        <TwoDot>:</TwoDot>
        <StyledTime>{zeroPadding(remaining.seconds)}</StyledTime>
      </StyledContainer>
    );
  }
  return <></>;
};

const StyledContainer = styled.div`
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  color: ${(p) => p.theme.text.highlight};
`;

const TwoDot = styled.span`
  font-size: 24px;
  font-weight: 500;
`;

const StyledTime = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  span {
    font-size: 14px;
    font-weight: 400;
  }
  ${screenUp('lg')`
    width: 38px;
  `}
`;
