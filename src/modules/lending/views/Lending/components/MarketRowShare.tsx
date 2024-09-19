import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';

export const StyledContainer = styled.div`
  padding: 0 0 15px 0;
  background-color: ${({ theme }) => theme.box.itemBackground};
  :not(:last-child) {
    margin-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.box.border};
  }
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: 5fr 4fr 4fr 2fr 4fr;
    padding: 14px 16px;
    :not(:last-child) {
      margin-bottom: 0;
    }
  `}
`;

export const StyledRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 10px;

  ${screenUp('lg')`
    justify-content: flex-start;
    padding-top: 0px;
  `}
`;

export const StyledRowNoMargin = styled(StyledRow)`
  padding-top: 0px;
`;

export const StyledTitle = styled.div`
  font-size: 14px;
  margin-right: auto;
  color: ${(p) => p.theme.muted};
  ${screenUp('lg')`
    display: none;
  `};
`;

export const StyledAsset = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: normal;
  background-color: ${({ theme }) => theme.box.background};
  padding: 12px 14px;
  img {
    margin-right: 10px;
    width: 32px;
    height: 32px;
  }
  span {
    margin-top: 2px;
    padding-left: 5px;
    font-size: 14px;
    font-weight: normal;
  }
  ${screenUp('lg')`
    background-color: transparent;
    padding: 0;
    img {
      width: 36px;
      height: 36px;
    }
  `}
`;

export const StyledSymbolLink = styled(NavLink)`
  font-weight: 500;
  :hover {
    color: ${({ theme }) => theme.success};
  }
`;

export const StyledToggle = styled.div`
  padding: 8px 12px 0 12px;
  ${screenUp('lg')`
    display: flex;
    align-items: center;
    padding: 0px;
  `}
`;

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0 0 auto;
  ${screenUp('lg')`
    justify-content: flex-end;
    margin: 0;
    padding: 0;
  `}
`;
