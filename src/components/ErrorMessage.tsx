import React from 'react';
import styled from 'styled-components';

const ErrorMessage: React.FC<{ errorMessage?: string }> = ({ errorMessage }) => {
  return errorMessage ? (
    <StyledContainer>
      <i className="fal fa-exclamation-triangle" />
      <span>{errorMessage}</span>
    </StyledContainer>
  ) : (
    <></>
  );
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  padding: 8px 10px;
  border-radius: 4px;
  background-color: #f226231a;
  i {
    color: ${({ theme }) => theme.red};
  }
  span {
    margin-left: 10px;
    font-size: 14px;
    font-weight: normal;
    color: ${({ theme }) => theme.red};
  }
`;

export default ErrorMessage;
