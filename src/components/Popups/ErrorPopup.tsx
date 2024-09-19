import React from 'react';
import styled from 'styled-components';
import { Container, Message, StyledContent, StyledIcon, Title } from './Share';

export type ErrorPopupProps = {
  title: string;
  message: string;
};

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ title, message }) => {
  return (
    <Container>
      <CustomStyledIcon>
        <i className="fal fa-exclamation-triangle"></i>
      </CustomStyledIcon>
      <StyledContent>
        <Title>{title}</Title>
        <Message>{message}</Message>
      </StyledContent>
    </Container>
  );
};

const CustomStyledIcon = styled(StyledIcon)`
  background-color: ${({ theme }) => theme.danger};
`;
