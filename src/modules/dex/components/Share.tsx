import styled from 'styled-components';
import { Button } from '../../../components/Buttons';
import { ModalHeader, ModalTitle } from '../../../components/Modal/ModalStyles';
import { screenUp } from '../../../utils/styles';

export const BoxContainer = styled.div`
  margin: auto;
  padding: 0;
  width: 100%;
  ${screenUp('lg')`
    max-width: 600px;
  `}
`;

export const StyledHeaderBox = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 3fr 1fr;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text.primary};
  .setting {
    margin-left: auto;
    display: flex;
    button {
      margin-left: 8px;
    }
  }
`;

export const StyledTitle = styled.div`
  font-weight: 500;
  text-transform: uppercase;
  font-size: 24px;
`;

export const StyledInputContainer = styled.div`
  display: grid;
  position: relative;
`;

export const StyledBox = styled.div`
  padding: 15px 12px;
  background-color: ${({ theme }) => theme.box.background};
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

export const StyledIconSwap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 12px auto;
  cursor: pointer;
  fill: red;
  img {
    filter: opacity(0.8);
    svg {
      path {
        fill: ${(p) => p.theme.muted};
      }
    }
  }
  :hover {
    img {
      filter: opacity(1);
    }
  }
`;

export const StyledFooter = styled(StyledBox)`
  padding: 0px 20px 20px 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

export const StyledButtonWrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1;
  grid-gap: 14px;
  padding-top: 20px;
  button {
    width: 100%;
  }
`;

export const StyledSwapSummaryWrapper = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

export const StyledButtonApprove = styled(Button)`
  font-weight: 500;
  font-size: 16px;
  ${screenUp('lg')`
     font-size: 16px;
  `}
`;

export const StyleRecipientContainer = styled.div`
  margin-top: 20px;
`;

export const StyledModalHeader = styled(ModalHeader)`
  background-color: ${({ theme }) => theme.box.innerBackground};
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 14px 20px;
  button {
    position: absolute;
    right: 24px;
    padding: 0;
  }
`;

export const StyledModalTitle = styled(ModalTitle)`
  font-weight: normal;
  text-align: center;
  line-height: 2;
  margin-top: 7px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${screenUp('lg')`
    font-size: 16px;
  `}
`;

export const StyledTokenReceive = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.success};
  font-weight: bold;
  font-size: 18px;
  .symbol {
    font-weight: 500;
    margin-left: 5px;
    font-size: 14px;
  }
  .name {
    margin-left: 2px;
  }
  ${screenUp('lg')`
    font-size: 20px;
    .symbol {
      font-size: 16px;
    }
  `}
`;

export const StyledModalBody = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  padding: 10px 20px 20px 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  grid-gap: 10px;
  font-size: 14px;
  ${screenUp('lg')`
      font-size: 16px;
  `}
`;

export const StyleTextOverview = styled.div`
  font-weight: 500;
`;

export const StyleTextSwapFrom = styled.div`
  color: ${({ theme }) => theme.gray3};
`;

export const StyledConfirmSwapItemInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0px;
`;

export const StyledInputSymbol = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  .symbol {
    margin-left: 7px;
  }
`;

export const StyledDashed = styled.div`
  border-top: dashed 1px ${({ theme }) => theme.box.border};
`;

export const StyledConfirmSwapTextLeft = styled.div`
  color: ${({ theme }) => theme.gray3};
`;

export const StyledConfirmSwapRightContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledLimitOrderSummaryWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: auto;
  color: ${({ theme }) => theme.gray3};
  font-size: 14px;
  font-weight: 500;
  :not(:last-child) {
    padding-bottom: 8px;
  }
  ${screenUp('lg')`
    font-size: 16px;
    margin-bottom: 8px;
    margin-top: 8px;
    width: 50%;
  `}
`;
