import styled from 'styled-components';
import { Button } from '../../../../../../components/Buttons';
import { ModalContent } from '../../../../../../components/Modal/ModalStyles';
import { colorVariant, ColorVariant } from '../../../../../../utils/styles';

export const CustomModalHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px 20px 20px;
  background-color: ${({ theme }) => theme.box.innerBackground};
`;

export const CustomModalContent = styled(ModalContent)`
  padding: 16px 20px 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

export const StyledModalClose = styled.button`
  position: absolute;
  top: 10px;
  right: 8px;
  cursor: pointer;
  opacity: 0.6;
  font-size: 20px;

  :hover {
    opacity: 1;
  }
`;

export const StyledModalImage = styled.img`
  margin: 0 auto;
  width: 130px;
  padding-bottom: 15px;
`;

export const StyledModalTitle = styled.div`
  padding-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
`;

export const StyledModalDes = styled.div`
  font-size: 14px;
  padding-top: 2px;
  font-weight: normal;
  color: ${({ theme }) => theme.warning};
  text-align: center;
`;

export const StyledImageActive = styled.img`
  width: 12px;
  margin-right: 5px;
`;

export const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 8px;
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${({ theme }) => theme.gray3};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${({ theme }) => theme.text.primary};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${({ theme }) => theme.text.primary};
    }
  }
`;

export const StyledInputContainer = styled.div``;

export const StyledGroupContent = styled.div`
  padding-bottom: 20px;
`;

export const StyledGroupContentTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 12px;
`;

export const StyledRow = styled.div`
  display: flex;
  align-items: baseline;
  :not(:last-child) {
    padding-bottom: 12px;
  }
`;

export const StyledRowTitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.gray3};
`;

export const StyledRowContentWrap = styled.div`
  margin-left: auto;
`;

export const StyledRowContent = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  i {
    font-size: 12px;
    color: ${(p) => p.theme.muted};
    padding: 0px 8px;
  }
`;

export const StyledRowValue = styled.div<{
  variant?: ColorVariant;
}>`
  font-size: 14px;
  ${({ variant }) => variant && colorVariant};
  span {
    padding-left: 4px;
  }
`;

export const StyledRowSubValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: -2px;
  text-align: right;
  font-size: 13px;
  font-weight: normal;
  color: ${({ theme }) => theme.gray3};
  i {
    font-size: 10px;
  }
`;

export const StyledButton = styled(Button)`
  width: 100%;
  text-transform: uppercase;
`;
