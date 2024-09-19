import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { ResponsiveContainer, XAxis, Tooltip, AreaChart as ChartArea, Area } from 'recharts';
import { useTheme } from 'styled-components';
import { unixToDate } from '../../../../utils/times';
import { TimeWindowEnum } from '../../models/Graphql';

const MIN_VALUE_DISPLAYED = 0.001;

export const getTimeWindowChange = (lineChartData) => {
  if (lineChartData.length > 0) {
    const firstValue = lineChartData.find(({ value }) => !!value && value > 0)?.value ?? 0;
    const lastValue = lineChartData[lineChartData.length - 1].value;
    const changeValue = lastValue - firstValue;

    return {
      changeValue:
        changeValue > 0
          ? Math.max(changeValue, MIN_VALUE_DISPLAYED)
          : Math.min(changeValue, MIN_VALUE_DISPLAYED * -1),
      changePercentage: ((changeValue / firstValue) * 100).toFixed(2),
    };
  }

  return {
    changeValue: 0,
    changePercentage: 0,
  };
};

export type LineChartProps = {
  data: unknown[];
  color?: string | undefined;
  setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setValueChange?: Dispatch<SetStateAction<number | undefined>>; // used for value change on hover
  setValueChangePercent?: Dispatch<SetStateAction<number | undefined>>; // used for value change percent on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for label of value
  value?: number;
  valueChange?: number;
  valueChangePercent?: number;
  label?: string;
  timeWindow?: TimeWindowEnum;
} & React.HTMLAttributes<HTMLDivElement>;

const HoverUpdater = ({
  payload,
  setValue,
  setValueChange,
  setLabel,
  currentLabel,
  value,
  valueChange,
}) => {
  useEffect(() => {
    if (setValue && value !== payload.value) {
      setValue(payload.value);
    }
    if (setValueChange && valueChange !== payload.valueChange) {
      setValueChange(payload.valueChange);
    }
    const formattedTime = unixToDate(payload.time, 'MMM d, yyyy');
    if (setLabel && currentLabel !== formattedTime) setLabel(formattedTime);
  }, [
    payload.value,
    payload.time,
    setValue,
    setLabel,
    currentLabel,
    value,
    setValueChange,
    payload.valueChange,
    valueChange,
    payload.valueChangePercent,
  ]);

  return null;
};

const AreaChart: FC<LineChartProps> = ({
  data,
  color,
  value,
  label,
  valueChange,
  setValue,
  setValueChange,
  setLabel,
  timeWindow,
}: LineChartProps) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartArea
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 5,
          bottom: 5,
        }}
        onMouseLeave={() => {
          setLabel && setLabel(undefined);
          setValue && setValue(undefined);
          setValueChange && setValueChange(undefined);
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color || theme.success} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color || theme.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tickFormatter={(time) =>
            typeof time === 'number'
              ? timeWindow === TimeWindowEnum.DAY
                ? unixToDate(time, 'hh:mm')
                : unixToDate(time, 'MMM dd')
              : time
          }
          minTickGap={4}
          fontSize={13}
          tickMargin={10}
        />
        <Tooltip
          cursor={{ stroke: theme.box.border, strokeDasharray: '5 5' }}
          contentStyle={{ display: 'none' }}
          formatter={(tooltipValue: number, name: string, props) => (
            <HoverUpdater
              payload={props.payload}
              setValue={setValue}
              setLabel={setLabel}
              setValueChange={setValueChange}
              currentLabel={label}
              value={value}
              valueChange={valueChange}
            />
          )}
        />
        <Area
          dataKey="value"
          type="linear"
          stroke={color || theme.success}
          fill="url(#gradient)"
          strokeWidth={2}
        />
      </ChartArea>
    </ResponsiveContainer>
  );
};

export default AreaChart;
