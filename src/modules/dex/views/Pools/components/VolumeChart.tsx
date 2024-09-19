import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartData, TimeWindowEnum } from '../../../models/Graphql';
import BaseChart from '../../../components/charts/BaseChart';
import { formatNumber } from '../../../../../utils/numbers';
import {
  StyledChartContainer,
  StyledColumn,
  StyledFilter,
  StyledFilterItem,
  StyledLabel,
  StyledTime,
  StyledValue,
} from '../../../utils/styles';
import styled from 'styled-components';
import { PriceChange } from '../../PoolDetail/components/PriceChange';
import BarChart from '../../../components/charts/BarChart';
import { useTransformedVolumeData } from '../../../hooks/useTransformedVolumeData';
import { addMonths, addWeeks, fromUnixTime, isAfter } from 'date-fns';
import { formatDate, unixToDate } from '../../../../../utils/times';

export type VolumeChartProps = {
  chartData: ChartData[];
  loading: boolean;
};

export const VolumeChart: React.FC<VolumeChartProps> = ({ chartData, loading }) => {
  const [volumeWindow, setVolumeWindow] = useState(TimeWindowEnum.DAY);
  const [volumeHoverValue, setVolumeHoverValue] = useState<number | undefined>();
  const [volumeHoverValueChange, setVolumeHoverValueChange] = useState<number | undefined>();
  const [volumeHoverValueChangePercent, setVolumeHoverValueChangePercent] = useState<
    number | undefined
  >();
  const [timeHoverValue, setTimeHoverValue] = useState<string | undefined>();

  const chartWeekVolumeData = useTransformedVolumeData(chartData, 'week');
  const chartMonthVolumeData = useTransformedVolumeData(chartData, 'month');

  const chartVolumeData = useMemo(
    () =>
      chartData?.map((c) => {
        return {
          time: c.date,
          value: c.volumeUSD,
          valueChange: c.volumeUSDChange,
        };
      }) || [],
    [chartData],
  );

  const updateTimeLabel = useCallback(() => {
    const now = Date.now();
    const initTime =
      volumeWindow === TimeWindowEnum.MONTH
        ? chartMonthVolumeData?.[chartMonthVolumeData.length - 1]?.time
        : volumeWindow === TimeWindowEnum.WEEK
        ? chartWeekVolumeData?.[chartWeekVolumeData.length - 1]?.time
        : chartVolumeData?.[chartVolumeData.length - 1]?.time;
    const formattedTime = initTime && unixToDate(initTime, 'MMM d');
    const formattedTimeDaily = initTime && unixToDate(initTime, 'MMM d yyyy');
    const timePlusWeek = initTime && addWeeks(fromUnixTime(initTime), 1);
    const timePlusMonth = initTime && addMonths(fromUnixTime(initTime), 1);
    if (volumeWindow === TimeWindowEnum.WEEK) {
      const isCurrent = isAfter(timePlusWeek, now);
      setTimeHoverValue(
        formattedTime + '-' + (isCurrent ? 'current' : formatDate(timePlusWeek, 'MMM d, yyyy')),
      );
    } else if (volumeWindow === TimeWindowEnum.MONTH) {
      const isCurrent = isAfter(timePlusMonth, now);
      setTimeHoverValue(
        formattedTime +
          '-' +
          (isCurrent ? 'current' : formatDate(timePlusMonth, 'MMM d, yyyy')),
      );
    } else {
      setTimeHoverValue(formattedTimeDaily);
    }
  }, [chartMonthVolumeData, chartVolumeData, chartWeekVolumeData, volumeWindow]);

  const onChangeVolumeWindow = useCallback(
    (volumeWindow: TimeWindowEnum) => {
      setVolumeWindow(volumeWindow);
      setVolumeHoverValue(
        volumeWindow === TimeWindowEnum.MONTH
          ? chartMonthVolumeData?.[chartMonthVolumeData.length - 1]?.value
          : volumeWindow === TimeWindowEnum.WEEK
          ? chartWeekVolumeData?.[chartWeekVolumeData.length - 1]?.value
          : chartVolumeData?.[chartVolumeData.length - 1]?.value,
      );
      setVolumeHoverValueChange(
        volumeWindow === TimeWindowEnum.MONTH
          ? chartMonthVolumeData?.[chartMonthVolumeData.length - 1]?.valueChange
          : volumeWindow === TimeWindowEnum.WEEK
          ? chartWeekVolumeData?.[chartWeekVolumeData.length - 1]?.valueChange
          : chartVolumeData?.[chartVolumeData.length - 1]?.valueChange,
      );
      updateTimeLabel();
    },
    [chartMonthVolumeData, chartVolumeData, chartWeekVolumeData, updateTimeLabel],
  );

  useEffect(() => {
    if (volumeHoverValue === undefined) {
      setVolumeHoverValue(
        volumeWindow === TimeWindowEnum.MONTH
          ? chartMonthVolumeData?.[chartMonthVolumeData.length - 1]?.value
          : volumeWindow === TimeWindowEnum.WEEK
          ? chartWeekVolumeData?.[chartWeekVolumeData.length - 1]?.value
          : chartVolumeData?.[chartVolumeData.length - 1]?.value,
      );
    }
    if (volumeHoverValueChange === undefined) {
      setVolumeHoverValueChange(
        volumeWindow === TimeWindowEnum.MONTH
          ? chartMonthVolumeData?.[chartMonthVolumeData.length - 1]?.valueChange
          : volumeWindow === TimeWindowEnum.WEEK
          ? chartWeekVolumeData?.[chartWeekVolumeData.length - 1]?.valueChange
          : chartVolumeData?.[chartVolumeData.length - 1]?.valueChange,
      );
    }
    if (timeHoverValue === undefined) {
      updateTimeLabel();
    }
  }, [
    chartData,
    chartMonthVolumeData,
    chartVolumeData,
    chartWeekVolumeData,
    timeHoverValue,
    updateTimeLabel,
    volumeHoverValue,
    volumeHoverValueChange,
    volumeHoverValueChangePercent,
    volumeWindow,
  ]);

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
            <StyledLabel>Trading Volume</StyledLabel>
            <StyledValue className="volume">
              <span>
                {formatNumber(volumeHoverValue, {
                  currency: 'USD',
                  fractionDigits: 0,
                  compact: false,
                })}
              </span>
              {volumeHoverValueChange ? <PriceChange value={volumeHoverValueChange} /> : null}
            </StyledValue>
            <StyledTime>{timeHoverValue && <span>{timeHoverValue} (UTC)</span>}</StyledTime>
          </StyledColumn>
        }
        topRight={
          <StyledFilter>
            <StyledFilterItem
              active={volumeWindow === TimeWindowEnum.DAY}
              onClick={() => onChangeVolumeWindow(TimeWindowEnum.DAY)}
            >
              Day
            </StyledFilterItem>
            <StyledFilterItem
              active={volumeWindow === TimeWindowEnum.WEEK}
              onClick={() => onChangeVolumeWindow(TimeWindowEnum.WEEK)}
            >
              Week
            </StyledFilterItem>
            <StyledFilterItem
              active={volumeWindow === TimeWindowEnum.MONTH}
              onClick={() => onChangeVolumeWindow(TimeWindowEnum.MONTH)}
            >
              Month
            </StyledFilterItem>
          </StyledFilter>
        }
      >
        <BarChart
          data={
            volumeWindow === TimeWindowEnum.MONTH
              ? chartMonthVolumeData
              : volumeWindow === TimeWindowEnum.WEEK
              ? chartWeekVolumeData
              : chartVolumeData
          }
          value={volumeHoverValue}
          label={timeHoverValue}
          valueChange={volumeHoverValueChange}
          valueChangePercent={volumeHoverValueChangePercent}
          setValue={setVolumeHoverValue}
          setLabel={setTimeHoverValue}
          setValueChange={setVolumeHoverValueChange}
          setValueChangePercent={setVolumeHoverValueChangePercent}
          activeWindow={volumeWindow}
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
