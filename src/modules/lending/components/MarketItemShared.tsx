import styled from 'styled-components';
import { ColorVariant, colorVariant, screenUp } from '../../../utils/styles';

export const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px 14px 14px;
  :not(:last-child) {
    border-bottom: 1px dashed ${(p) => p.theme.box.border2};
  }
  ${screenUp('lg')`
    padding: 0;
    :not(:last-child) {
      border-bottom: none;
    }
  `}
`;

export const StyledValue = styled.div<{
  variant?: ColorVariant;
}>`
  font-size: 16px;
  font-weight: normal;
  ${({ variant }) => variant && colorVariant};
  span {
    padding-left: 4px;
    font-size: 13px;
  }
`;

export const StyledSubValue = styled.div`
  padding-top: 0px;
  font-size: 12px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  ${screenUp('lg')`
    margin-top: 4px;
  `}
`;

export const StyledAprContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${screenUp('lg')`
    flex-direction: column;
    align-items: flex-start;
  `}
`;

export const StyledApr = styled.div`
  width: fit-content;
  margin: 0 0 0 5px;
  display: flex;
  align-items: center;
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px solid ${(p) => p.theme.gray2};
  font-size: 12px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  img {
    border-radius: 100px;
    margin-right: 4px;
  }
  ${screenUp('lg')`
    font-size: 12px;
    margin: 4px 0 0 0 ;
  `}
`;
