import styled from 'styled-components';
import { screenUp } from '../../../utils/styles';

export const StyledChartContainer = styled.div`
  width: 100%;
  padding-top: 16px;
  ${screenUp('lg')`
    padding-top: 0;
  `};
`;

export const StyledColumn = styled.div`
  display: grid;
  grid-auto-rows: auto;
`;

export const StyledLabel = styled.div`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  margin: 0px;
`;

export const StyledValue = styled.div`
  margin-top: 4px;
  font-weight: bold;
  display: flex;
  align-items: center;
  min-height: 30px;
  color: ${({ theme }) => theme.success};
  ${screenUp('lg')`
    font-size: 20px;
  `};
  span {
    margin-right: 7px;
  }
  &.volume {
    color: ${({ theme }) => theme.orange};
  }
`;

export const StyledPercent = styled.div<{ negative: boolean }>`
  color: ${({ negative, theme }) => (negative ? theme.danger : theme.success)};
  font-size: 14px;
  margin-left: 11px;
  display: flex;
  align-items: center;
  font-weight: normal;
`;

export const StyledPercentImg = styled.img`
  height: 11px;
  width: 7px;
  margin-right: 3px;
`;

export const StyledTime = styled.div`
  margin-top: 4px;
  min-width: 0px;
  font-size: 14px;
  height: 18px;
  color: ${({ theme }) => theme.gray3};
`;

export const StyledFilter = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 10px;
  }
  ${screenUp('lg')`
    > * + * {
      margin-left: 20px;
    }
  `};
`;

export const StyledFilterItem = styled.div<{ active?: boolean }>`
  color: ${({ theme, active }) => (active ? theme.success : theme.gray3)};
  padding-bottom: 1px;
  min-height: 15px;
  min-height: 18px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    color: ${({ theme }) => theme.success};
  }
`;
