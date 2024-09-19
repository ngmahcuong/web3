import { format, fromUnixTime, getWeek, getYear } from 'date-fns';
import { useMemo } from 'react';
import { ChartData } from '../models/Graphql';
import { getChange } from '../utils/number';

function unixToType(unix: number, type: 'month' | 'week') {
  const date = fromUnixTime(unix);

  switch (type) {
    case 'month':
      return format(date, 'yyyy-MM');
    case 'week': {
      const week = getWeek(date);
      return `${getYear(date)}-${week}`;
    }
  }
}

export function useTransformedVolumeData(
  chartData: ChartData[] | undefined,
  type: 'month' | 'week',
) {
  return useMemo(() => {
    if (chartData) {
      const data: Record<string, { time: number; value: number }> = {};

      chartData.forEach(({ date, volumeUSD }) => {
        const group = unixToType(date, type);
        if (data[group]) {
          data[group].value += volumeUSD;
        } else {
          data[group] = {
            time: date,
            value: volumeUSD,
          };
        }
      });

      return Object.values(data)?.map((d, i) => {
        const valueChange = i > 0 ? getChange(d.value, Object.values(data)[i - 1].value) : 0;
        return {
          ...d,
          valueChange,
        };
      });
    } else {
      return [];
    }
  }, [chartData, type]);
}
