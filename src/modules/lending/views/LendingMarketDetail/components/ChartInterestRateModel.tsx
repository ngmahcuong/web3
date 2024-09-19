import { Chart, FontSpec } from 'chart.js';
import { useMemo } from 'react';
import { useRef, useEffect, useLayoutEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { useMatchMedia } from '../../../../../hooks/useMatchMedia';
import { screenUp } from '../../../../../utils/styles';
import { UtilizationApyInfo } from '../hooks/useInterestRateModelData';

type ChartProps = {
  data: UtilizationApyInfo[];
};

const ChartInterestRateModel: React.FC<ChartProps> = ({ data }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<Chart<any>>();
  const containerRef = useRef<HTMLCanvasElement>();
  const theme = useTheme();
  const isSmallScreen = useMatchMedia('(max-width: 768px)');

  const current = useMemo(() => {
    return data.find((i) => i.current);
  }, [data]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const utilization = data
      .map((t) => t.util)
      .concat(Array.from(Array(isSmallScreen ? 0 : 18).keys()));
    chartRef.current.data.labels = utilization;
    chartRef.current.data.datasets[0].data = data.map((t) => t.borrowApy);
    chartRef.current.data.datasets[1].data = data.map((t) => t.supplyApy);

    chartRef.current.update();
  }, [data, isSmallScreen, theme]);

  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    chartRef.current = new Chart(containerRef.current, {
      type: 'line',
      data: {
        datasets: [
          {
            data: [],
            borderColor: theme.warning,
            pointHoverBorderWidth: 2,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: theme.warning,
            pointHoverBorderColor: theme.white,
          },
          {
            data: [],
            borderColor: theme.success,
            pointHoverBorderWidth: 2,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: theme.success,
            pointHoverBorderColor: theme.white,
          },
        ],
      },
      options: {
        aspectRatio: isSmallScreen ? 1.5 : 2.2,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          xAxis: {
            display: true,
            position: 'bottom',
            ticks: {
              font: {
                size: 12,
                style: 'normal',
                family: 'Kanit',
              } as FontSpec,
              callback: function (value) {
                return value === 0
                  ? undefined
                  : value === current?.util
                  ? `${value}%`
                  : value === 100
                  ? `100%`
                  : undefined;
              },
              maxRotation: 0,
            },
            grid: {
              display: true,
              borderWidth: 2,
              borderColor: theme.muted,
              color: (ctx) => {
                return ctx.tick.value === current?.util
                  ? '#5490e3'
                  : ctx.tick.value === 100
                  ? theme.muted
                  : '';
              },
              lineWidth: 2,
              borderDash: [5],
            },
          },
          yAxis: {
            display: true,
            ticks: {
              font: {
                size: 12,
                style: 'normal',
                family: 'Kanit',
              } as FontSpec,
              callback: function (value) {
                return `${value}%`;
              },
              maxRotation: 0,
            },
            grid: {
              display: false,
              borderWidth: 2,
              borderColor: theme.muted,
            },
          },
        },
        responsive: true,
        elements: {
          point: {
            radius: 0,
          },
        },
        plugins: {
          tooltip: {
            axis: 'x',
            intersect: false,
            padding: 10,
            enabled: true,
            backgroundColor: theme.box.background,
            bodyFont: {
              size: 14,
              style: 'normal',
              family: 'Kanit',
            } as FontSpec,
            titleFont: {
              size: 14,
              style: 'normal',
              weight: 'normal',
              family: 'Kanit',
            } as FontSpec,
            titleColor: theme.muted,
            caretSize: 4,
            caretPadding: 8,
            displayColors: false,
            cornerRadius: 1,
            callbacks: {
              title: function (context) {
                return context.map((t) => `Utilization rate: ${t.parsed.x}%`)[0];
              },
              label: (ctx) => {
                if (ctx.datasetIndex === 0) {
                  return `Borrow APY: ${ctx.parsed.y.toFixed(2)}%`;
                } else {
                  return `Supply APY: ${ctx.parsed.y.toFixed(2)}%`;
                }
              },
              labelTextColor: function (context) {
                return theme.muted;
              },
            },
          },
        },
      },
    });
    return () => {
      chartRef.current?.destroy();
    };
  }, [current?.util, isSmallScreen, theme]);

  return (
    <StyledContainer>
      <StyledChart>
        <canvas width="100%" ref={containerRef}></canvas>
        <XAxisTitle>Utilization rate</XAxisTitle>
      </StyledChart>
      <StyledDes>
        <StyledDot success />
        <StyledTitle>Supply APY</StyledTitle>
        <div className="space" />
        <StyledDot />
        <StyledTitle>Borrow APY</StyledTitle>
      </StyledDes>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const StyledChart = styled.div`
  position: relative;
`;

const XAxisTitle = styled.div`
  display: none;
  font-size: 12px;
  position: absolute;
  right: 0;
  bottom: 3px;
  color: ${(p) => p.theme.muted};
  ${screenUp('lg')`
    display: inline;
  `}
`;

const StyledDes = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -4px;
  .space {
    width: 20px;
  }
`;

const StyledDot = styled.div<{ success?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 1px;
  background: ${({ success, theme }) => (success ? theme.success : theme.warning)};
`;

const StyledTitle = styled.div`
  padding-left: 8px;
  font-size: 14px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
`;

export default ChartInterestRateModel;
