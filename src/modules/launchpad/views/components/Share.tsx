import styled from 'styled-components';
import { Button } from '../../../../components/Buttons';
import { container, screenUp } from '../../../../utils/styles';

export const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  font-weight: 500;
  color: ${(p) => p.theme.text.primary};
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
    }
  }
`;

export const StyledInputContainer = styled.div`
  margin-bottom: 24px;
`;

export const StyledButton = styled(Button)`
  width: 100%;
  text-transform: uppercase;
  margin-top: 16px;
`;

export const StyledContent = styled.div`
  ${container};
  padding-top: 36px;

  ${screenUp('lg')`
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 30px;
  `}
`;

export const StyledBox = styled.div`
  padding: 16px 10px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

export const StyledPoolInfo = styled(StyledBox)`
  border: 1px solid ${(p) => p.theme.card.border};
  height: fit-content;
`;

export const StyledPoolInfoTitle = styled.div`
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 20px;
`;

export const StyledPoolInfoNotice = styled.div`
  display: flex;
  align-items: center;
  color: ${(p) => p.theme.text.warning};
  margin-bottom: 20px;
  margin-left: 0px;
  i {
    margin-right: 12px;
    font-size: 14px;
  }
`;

export const StyledPoolInfoContent = styled.div`
  background-color: ${({ theme }) => theme.box.innerBackground};
  padding: 12px;
  ${screenUp('lg')`
    padding: 20px 16px;
  `}
`;

export const StyledPoolInfoContentItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px dashed ${(p) => p.theme.box.border3};
  :last-child {
    margin-bottom: 0;
    padding-bottom: 0px;
    border-bottom: none;
  }
  ${screenUp('lg')`
    margin-bottom: 20px;
    padding-bottom: 20px;
  `}
`;

export const StyledLabel = styled.div`
  color: ${(p) => p.theme.gray3};
`;

export const StyledValue = styled.div`
  &.address {
    overflow: hidden;
    color: ${(p) => p.theme.text.highlight};
    i {
      margin-left: 8px;
    }
  }
`;

export const StyledSale = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.box.itemBackground};
  height: fit-content;
  border: 1px solid ${(p) => p.theme.card.border};
`;

export const StyledSaleTop = styled.div`
  padding: 20px 20px 5px 20px;
  background: ${(p) => p.theme.card.header};
`;

export const StyledSaleBottom = styled.div`
  padding: 10px 20px 20px 20px;
`;

export const StyledSaleTokenName = styled.div`
  font-weight: 500;
  font-size: 24px;
  color: ${(p) => p.theme.text.primary};
  margin-bottom: 0px;
`;

export const StyledPresaleDescription = styled.div`
  color: ${(p) => p.theme.text.muted};
  margin-bottom: 6px;
  &.warning {
    color: ${({ theme }) => theme.red};
  }
`;

export const StyledSaleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: ${(p) => p.theme.text.muted};
  font-size: 14px;
  span {
    color: ${({ theme }) => theme.text.primary};
  }
`;

export const StyledBar = styled.div<{ percent: number }>`
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 0;
  background-color: #d8d8d8;
  overflow: hidden;
  margin-top: 12px;
  margin-bottom: 8px;
  z-index: 0;
  &::after {
    content: '';
    top: 0;
    left: 0;
    height: 8px;
    position: absolute;
    transition: width 1.5s cubic-bezier(0.08, 0.82, 0.17, 1);
    width: ${(p) => (p.percent + '%').toString()};
    background-image: linear-gradient(
      to right,
      ${(p) => p.theme.text.highlight} 2%,
      #4a9b70 11%,
      ${(p) => p.theme.text.highlight} 19%
    );
    z-index: 1;
    animation: move 2s ease-in-out 0s infinite forwards;

    @keyframes move {
      from {
        background-position-x: 0px;
      }
      to {
        background-position-x: 500px;
      }
    }
  }
`;

export const StyledSold = styled.div``;

export const StyledTotalSale = styled.div``;

export const StyledSaleInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  ${screenUp('lg')`
    padding: 8px 0px;
  `}
`;

export const StyledNotWhitelist = styled.div`
  margin-top: 20px;
  color: ${(p) => p.theme.text.warning};
  i {
    margin-right: 10px;
  }
`;
