import React from 'react';
import { Container, Message, StyledContent, StyledIcon, Title } from './Share';

export type WaitingProps = {
  message: string;
  title?: string;
};

export const WaitingPopup: React.FC<WaitingProps> = ({ message, title }) => {
  return (
    <Container>
      <StyledIcon>
        <i className="fal fa-hourglass"></i>
      </StyledIcon>
      <StyledContent>
        <Title>{title}</Title>
        <Message>{message}</Message>
      </StyledContent>
    </Container>
  );
};
