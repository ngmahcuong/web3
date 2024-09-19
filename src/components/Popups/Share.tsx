import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const StyledContent = styled.div`
  flex: 1;
  padding: 10px 10px 10px 15px;
  font-size: 14px;
  font-weight: normal;
`;

export const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

export const Message = styled.div`
  font-size: 14px;
  font-weight: normal;
  padding-top: 2px;
`;

export const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  width: 64px;
  background-color: ${({ theme }) => theme.warning};
  i {
    font-size: 24px;
    color: ${({ theme }) => theme.white};
  }
`;
