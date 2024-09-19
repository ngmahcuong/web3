import React, { useEffect, useMemo, useState } from 'react';
import { Chart, ChartData } from '../../../models/Graphql';
import { getChange } from '../../../utils/number';
import BaseChart from '../../../components/charts/BaseChart';
import { formatNumber } from '../../../../../utils/numbers';
import AreaChart from '../../../components/charts/AreaChart';
import { PriceChange } from './PriceChange';
import {
  StyledChartContainer,
  StyledColumn,
  StyledFilter,
  StyledFilterItem,
  StyledLabel,
  StyledTime,
  StyledValue,
} from '../../../utils/styles';
import styled, { useTheme } from 'styled-components';
import BarChart from '../../../components/charts/BarChart';
import { gql } from 'graphql-request';
import { pager } from '../../../../../graphql/pager';
import { useGraphQLClient } from '../../../../../providers/GraphProvider';

const GET_POOLS_CHART = gql`
  query dayDatas($skip: Int!, $address: Bytes!) {
    dailyDatas(where: { pool: $address }) {
      id
      volumeUSD
      reserveUSD
      timestamp
    }
  }
`;

export type PoolChartProps = {
  poolId: string;
};

enum PoolChartType {
  Liquidity,
  Volume,
}

export const PoolChart: React.FC<PoolChartProps> = ({ poolId }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartType, setChartType] = useState(PoolChartType.Liquidity);
  const [hoverValue, setHoverValue] = useState<number | undefined>();
  const [hoverValueChange, setHoverValueChange] = useState<number | undefined>();
  const [timeHoverValue, setTimeHoverValue] = useState<string | undefined>();
  const theme = useTheme();
  const { dexClient: client } = useGraphQLClient();

  useEffect(() => {
    if (!poolId || !client) {
      return;
    }
    setLoadingChart(true);
    pager<{ dailyDatas: Chart[] }>(
      GET_POOLS_CHART,
      {
        address: poolId?.toLowerCase(),
      },
      client,
    )
      .then((data) => {
        const formatted = data?.dailyDatas.reduce(
          (acc: { [date: number]: ChartData }, dayData, i) => {
            const preAcc = Object.values(acc)[i - 1];
            acc[+dayData.timestamp] = {
              date: +dayData.timestamp,
              volumeUSD: parseFloat(dayData.volumeUSD),
              volumeUSDChange: getChange(
                parseFloat(dayData.volumeUSD),
                i > 0 ? preAcc?.volumeUSD : 0,
              ),
              liquidityUSD: parseFloat(dayData.reserveUSD),
              liquidityUSDChange: getChange(
                parseFloat(dayData.reserveUSD),
                i > 0 ? preAcc?.liquidityUSD : 0,
              ),
            };
            return acc;
          },
          {},
        );
        setChartData(Object.values(formatted));
      })
      .finally(() => setLoadingChart(false));
  }, [client, poolId]);

  const chartLiquidityData = useMemo(
    () =>
      chartData.map((c) => {
        return {
          time: c.date,
          value: c.liquidityUSD,
          valueChange: c.liquidityUSDChange,
        };
      }) || [],
    [chartData],
  );

  const chartVolumeData = useMemo(
    () =>
      chartData.map((c) => {
        return {
          time: c.date,
          value: c.volumeUSD,
          valueChange: c.volumeUSDChange,
        };
      }) || [],
    [chartData],
  );

  useEffect(() => {
    if (hoverValue === undefined && chartData?.[chartData.length - 1]) {
      switch (chartType) {
        case PoolChartType.Liquidity: {
          setTimeHoverValue(undefined);
          setHoverValue(chartLiquidityData?.[chartLiquidityData.length - 1].value);
          setHoverValueChange(chartLiquidityData?.[chartLiquidityData.length - 1].valueChange);
          break;
        }
        case PoolChartType.Volume: {
          setTimeHoverValue(undefined);
          setHoverValue(chartVolumeData?.[chartVolumeData.length - 1].value);
          setHoverValueChange(chartVolumeData?.[chartVolumeData.length - 1].valueChange);
          break;
        }
      }
    }
  }, [chartData, chartLiquidityData, chartType, chartVolumeData, hoverValue]);

  const chartLabel = useMemo(() => {
    switch (chartType) {
      case PoolChartType.Liquidity:
        return 'Liquidity';
      case PoolChartType.Volume:
        return 'Trading Volume';
    }
  }, [chartType]);

  return loadingChart ? (
    <StyledLoading>
      <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
    </StyledLoading>
  ) : (
    <StyledChartContainer>
      <BaseChart
        minHeight={310}
        topLeft={
          <StyledColumn>
            <StyledLabel>{chartLabel}</StyledLabel>
            <StyledPoolValue
              color={chartType === PoolChartType.Liquidity ? theme.success : theme.orange}
            >
              {hoverValue && (
                <span>
                  {formatNumber(hoverValue, {
                    currency: 'USD',
                    fractionDigits: 2,
                    compact: false,
                  })}
                </span>
              )}
              {hoverValueChange ? <PriceChange value={hoverValueChange} /> : null}
            </StyledPoolValue>
            <StyledTime>{timeHoverValue && <span>{timeHoverValue} (UTC)</span>}</StyledTime>
          </StyledColumn>
        }
        topRight={
          <StyledFilter>
            <StyledFilterItem
              active={chartType === PoolChartType.Liquidity}
              onClick={() => {
                setChartType(PoolChartType.Liquidity);
                setHoverValue(undefined);
                setHoverValueChange(undefined);
                setTimeHoverValue(undefined);
              }}
            >
              Liquidity
            </StyledFilterItem>
            <StyledFilterItem
              active={chartType === PoolChartType.Volume}
              onClick={() => {
                setChartType(PoolChartType.Volume);
                setHoverValue(undefined);
                setHoverValueChange(undefined);
                setTimeHoverValue(undefined);
              }}
            >
              Trading Volume
            </StyledFilterItem>
          </StyledFilter>
        }
      >
        {chartType === PoolChartType.Liquidity ? (
          <AreaChart
            data={chartLiquidityData}
            value={hoverValue}
            label={timeHoverValue}
            valueChange={hoverValueChange}
            setValue={setHoverValue}
            setLabel={setTimeHoverValue}
            setValueChange={setHoverValueChange}
          />
        ) : chartType === PoolChartType.Volume ? (
          <BarChart
            data={chartVolumeData}
            value={hoverValue}
            valueChange={hoverValueChange}
            label={timeHoverValue}
            setValue={setHoverValue}
            setLabel={setTimeHoverValue}
            setValueChange={setHoverValueChange}
          />
        ) : null}
      </BaseChart>
    </StyledChartContainer>
  );
};

const StyledLoading = styled.div`
  height: 434px;
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

const StyledPoolValue = styled(StyledValue)<{ color?: string }>`
  color: ${({ color }) => color};
`;
