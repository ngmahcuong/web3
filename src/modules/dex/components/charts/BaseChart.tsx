import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../utils/styles';

type BaseChartProps = {
  topLeft?: ReactNode | undefined;
  topRight?: ReactNode | undefined;
  bottomLeft?: ReactNode | undefined;
  bottomRight?: ReactNode | undefined;
  minHeight?: number;
};

const BaseChart: FC<BaseChartProps> = ({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  children,
  minHeight = 300,
}) => {
  return (
    <StyleContainer>
      {topLeft || topRight ? (
        <StyledRow>
          {topLeft ?? null}
          {topRight ?? null}
        </StyledRow>
      ) : null}
      <StyleChartWrapper minHeight={minHeight}>{children}</StyleChartWrapper>
      {bottomLeft || bottomRight ? (
        <StyledRow>
          {bottomLeft ?? null}
          {bottomRight ?? null}
        </StyledRow>
      ) : null}
    </StyleContainer>
  );
};

export default BaseChart;

const StyleContainer = styled.div`
  width: 100%;
  padding: 15px 12px;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.box.itemBackground};
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledRow = styled.div`
  margin: 0px;
  min-width: 0;
  width: 100%;
  padding: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 90px;
`;

const StyleChartWrapper = styled.div<{ minHeight: number }>`
  min-height: ${({ minHeight }) => minHeight && `${minHeight}px`};
  height: 220px;
`;
