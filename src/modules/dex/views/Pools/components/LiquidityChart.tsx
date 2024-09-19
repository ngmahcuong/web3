import React, { useEffect, useMemo, useState } from 'react';
import { ChartData } from '../../../models/Graphql';
import BaseChart from '../../../components/charts/BaseChart';
import { formatNumber } from '../../../../../utils/numbers';
import AreaChart from '../../../components/charts/AreaChart';
import {
  StyledChartContainer,
  StyledColumn,
  StyledLabel,
  StyledTime,
  StyledValue,
} from '../../../utils/styles';
import styled from 'styled-components';
import { PriceChange } from '../../PoolDetail/components/PriceChange';

export type LiquidityChartProps = {
  chartData: ChartData[];
  loading: boolean;
};

export const LiquidityChart: React.FC<LiquidityChartProps> = ({ chartData, loading }) => {
  const [liquidityHoverValue, setLiquidityHoverValue] = useState<number | undefined>();
  const [liquidityHoverValueChange, setLiquidityHoverValueChange] = useState<
    number | undefined
  >();
  const [liquidityHoverValueChangePercent, setLiquidityHoverValueChangePercent] = useState<
    number | undefined
  >();
  const [timeHoverValue, setTimeHoverValue] = useState<string | undefined>();

  useEffect(() => {
    if (liquidityHoverValue === undefined) {
      setLiquidityHoverValue(chartData?.[chartData.length - 1]?.liquidityUSD);
    }
    if (liquidityHoverValueChange === undefined) {
      setLiquidityHoverValueChange(chartData?.[chartData.length - 1]?.liquidityUSDChange);
    }
  }, [
    chartData,
    liquidityHoverValue,
    liquidityHoverValueChange,
    liquidityHoverValueChangePercent,
  ]);

  const chartLiquidityData = useMemo(
    () =>
      chartData?.map((c) => {
        return {
          time: c.date,
          value: c.liquidityUSD,
          valueChange: c.liquidityUSDChange,
        };
      }) || [],
    [chartData],
  );

  return loading ? (
    <StyledLoading>
      <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
    </StyledLoading>
  ) : (
    <StyledChartContainer>
      <BaseChart
        minHeight={213}
        topLeft={
          <StyledColumn>
            <StyledLabel>Liquidity</StyledLabel>
            <StyledValue>
              <span>
                {formatNumber(liquidityHoverValue, {
                  currency: 'USD',
                  fractionDigits: 0,
                  compact: false,
                })}
              </span>
              {liquidityHoverValueChange ? (
                <PriceChange value={liquidityHoverValueChange} />
              ) : null}
            </StyledValue>
            <StyledTime>{timeHoverValue && <span>{timeHoverValue} (UTC)</span>}</StyledTime>
          </StyledColumn>
        }
      >
        <AreaChart
          data={chartLiquidityData}
          value={liquidityHoverValue}
          label={timeHoverValue}
          valueChange={liquidityHoverValueChange}
          valueChangePercent={liquidityHoverValueChangePercent}
          setValue={setLiquidityHoverValue}
          setLabel={setTimeHoverValue}
          setValueChange={setLiquidityHoverValueChange}
          setValueChangePercent={setLiquidityHoverValueChangePercent}
        />
      </BaseChart>
    </StyledChartContainer>
  );
};

const StyledLoading = styled.div`
  height: 434px;
  width: 100%;
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.box.itemBackground};
  span {
    color: ${({ theme }) => theme.gray3};
    font-weight: 500;
  }
`;
