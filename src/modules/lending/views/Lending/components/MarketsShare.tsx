import styled from 'styled-components';
import { colorVariant, ColorVariant, screenUp } from '../../../../../utils/styles';

export const StyledContainer = styled.div``;

export const StyledMyMarkets = styled.div`
  margin-bottom: 30px;
`;

export const StyledAllMarkets = styled.div``;

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledTitle = styled.div`
  font-weight: bold;
`;

export const StyledCheckbox = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 14px;
  label {
    cursor: pointer;
    padding-left: 5px;
    color: ${({ theme }) => theme.gray3};
  }
  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    border-radius: 2px;
    accent-color: ${({ theme }) => theme.success};
  }
`;

export const StyledInfo = styled.div`
  margin-top: 8px;
  display: flex;
  flex-flow: wrap;
  align-items: center;
`;

export const StyledInfoItem = styled.div<{ variant?: ColorVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 14px;
  font-weight: normal;
  color: ${({ theme }) => theme.gray3};
  border: solid 1px #c2bdbb;
  img {
    width: 15px;
    margin-right: 5px;
  }
  span {
    padding-left: 5px;
    font-size: 16px;
    font-weight: bold;
    ${({ variant }) => variant && colorVariant};
  }
  :not(:last-child) {
    margin: 0 8px 0px 0;
  }
  ${screenUp('lg')`
    :not(:last-child) {
      margin: 0 12px 0 0;
    }
  `}
`;

export const StyledBox = styled.div`
  padding-top: 16px;
`;

export const StyledBoxHeader = styled.div`
  display: none;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray3};
  background-color: ${({ theme }) => theme.box.header};
  border-bottom: 1px solid ${({ theme }) => theme.box.border};
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: 5fr 4fr 4fr 2fr 4fr;
  `}
`;

export const StyledMarketBoxHeader = styled(StyledBoxHeader)`
  grid-template-columns: 5fr 4fr 4fr 6fr;
`;

export const StyledBoxContent = styled.div`
  background-color: transparent;
  ${screenUp('lg')`
    background-color: red;
  `}
`;

export const StyledBoxContentLoader = styled.div`
  display: flex;
  justify-content: center;
  padding: 200px 0px 50px 0;
`;
