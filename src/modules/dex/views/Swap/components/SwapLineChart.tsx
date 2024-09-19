import { Currency } from '@uniswap/sdk-core';
import React, { useMemo, useState } from 'react';
import AreaChart, { getTimeWindowChange } from '../../../components/charts/AreaChart';
import { formatNumber } from '../../../../../utils/numbers';
import icUp from '../../../../../assets/icons/ic_up.svg';
import icDown from '../../../../../assets/icons/ic_down.svg';
import icNodata from '../../../../../assets/images/swap-no-chart-data.png';
import {
  StyledColumn,
  StyledFilter,
  StyledFilterItem,
  StyledLabel,
  StyledPercent,
  StyledPercentImg,
  StyledTime,
  StyledValue,
} from '../../../utils/styles';
import { useFetchPairPrices } from '../../../hooks/useFetchPairPrice';
import styled from 'styled-components';
import { TimeWindowEnum } from '../../../models/Graphql';
import BaseChart from '../../../components/charts/BaseChart';

type SwapLineChartProps = {
  token0Address: string;
  token1Address: string;
  inputCurrency: Currency;
  outputCurrency: Currency;
  currentSwapPrice?: {
    [key: string]: number;
  };
};

const SwapLineChart: React.FC<SwapLineChartProps> = ({
  token0Address,
  token1Address,
  inputCurrency,
  outputCurrency,
  currentSwapPrice,
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindowEnum>(0);

  const { pairPrices = [] } = useFetchPairPrices({
    token0Address,
    token1Address,
    timeWindow,
    currentSwapPrice,
  });
  const [hoverValue, setHoverValue] = useState<number | undefined>();
  const [hoverDate, setHoverDate] = useState<string | undefined>();
  const valueToDisplay = hoverValue || pairPrices[pairPrices.length - 1]?.value;
  const { changePercentage } = getTimeWindowChange(pairPrices);

  const isBadData = useMemo(
    () =>
      !pairPrices?.length ||
      pairPrices.every(
        (price) =>
          !price.value ||
          price.value === 0 ||
          price.value === Infinity ||
          Number.isNaN(price.value),
      ),
    [pairPrices],
  );

  if (isBadData) {
    return (
      <StyledNoData>
        <img src={icNodata} alt="" />
        No chart data
      </StyledNoData>
    );
  }

  return (
    <BaseChart
      minHeight={200}
      topLeft={
        <StyledColumn>
          <StyledLabel>
            <span>
              {formatNumber(valueToDisplay, {
                currency: 'USD',
                fractionDigits: 2,
                compact: false,
              })}
            </span>
            {inputCurrency?.symbol}/{outputCurrency?.symbol}
          </StyledLabel>
          <StyledValue>
            {changePercentage && (
              <StyledPercent negative={changePercentage < 0}>
                <StyledPercentImg src={changePercentage < 0 ? icDown : icUp} />
                {formatNumber(Math.abs(Number(changePercentage)), {
                  fractionDigits: 2,
                  percentage: true,
                  compact: false,
                })}
              </StyledPercent>
            )}
          </StyledValue>
          <StyledTime>
            <span>{hoverDate}</span>
          </StyledTime>
        </StyledColumn>
      }
      topRight={
        <StyledFilter>
          <StyledFilterItem
            active={timeWindow === TimeWindowEnum.DAY}
            onClick={() => setTimeWindow(TimeWindowEnum.DAY)}
          >
            24H
          </StyledFilterItem>
          <StyledFilterItem
            active={timeWindow === TimeWindowEnum.WEEK}
            onClick={() => setTimeWindow(TimeWindowEnum.WEEK)}
          >
            1W
          </StyledFilterItem>
          <StyledFilterItem
            active={timeWindow === TimeWindowEnum.MONTH}
            onClick={() => setTimeWindow(TimeWindowEnum.MONTH)}
          >
            1M
          </StyledFilterItem>
          <StyledFilterItem
            active={timeWindow === TimeWindowEnum.YEAR}
            onClick={() => setTimeWindow(TimeWindowEnum.YEAR)}
          >
            1Y
          </StyledFilterItem>
        </StyledFilter>
      }
    >
      <AreaChart
        data={pairPrices}
        label={hoverDate}
        setValue={setHoverValue}
        setLabel={setHoverDate}
        timeWindow={timeWindow}
      />
    </BaseChart>
  );
};

const StyledNoData = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 422px;
  color: ${(p) => p.theme.text.muted};
  background-color: ${({ theme }) => theme.box.background};
  img {
    margin-bottom: 8px;
  }
`;

export default SwapLineChart;
