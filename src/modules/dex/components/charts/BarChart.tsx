import { addMonths, addWeeks, fromUnixTime, isAfter } from 'date-fns';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { ResponsiveContainer, BarChart as ChartBar, XAxis, Tooltip, Bar } from 'recharts';
import { useTheme } from 'styled-components';
import { formatDate, unixToDate } from '../../../../utils/times';
import { TimeWindowEnum } from '../../models/Graphql';

type BarChartProps = {
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
  activeWindow?: TimeWindowEnum;
};

const HoverUpdater = ({
  payload,
  setValue,
  setLabel,
  currentLabel,
  value,
  activeWindow,
  valueChange,
  setValueChange,
}) => {
  useEffect(() => {
    const now = Date.now();
    if (setValue && value !== payload.value) {
      setValue(payload.value);
    }
    if (setValueChange && valueChange !== payload.valueChange) {
      setValueChange(payload.valueChange);
    }
    const formattedTime = unixToDate(payload.time, 'MMM d');
    const formattedTimeDaily = unixToDate(payload.time, 'MMM d yyyy');
    const timePlusWeek = addWeeks(fromUnixTime(payload.time), 1);
    const timePlusMonth = addMonths(fromUnixTime(payload.time), 1);

    if (setLabel && currentLabel !== formattedTime) {
      if (activeWindow === TimeWindowEnum.WEEK) {
        const isCurrent = isAfter(timePlusWeek, now);
        setLabel(
          formattedTime +
            '-' +
            (isCurrent ? 'current' : formatDate(timePlusWeek, 'MMM d, yyyy')),
        );
      } else if (activeWindow === TimeWindowEnum.MONTH) {
        const isCurrent = isAfter(timePlusMonth, now);
        setLabel(
          formattedTime +
            '-' +
            (isCurrent ? 'current' : formatDate(timePlusMonth, 'MMM d, yyyy')),
        );
      } else {
        setLabel(formattedTimeDaily);
      }
    }
  }, [
    payload.value,
    payload.time,
    setValue,
    setLabel,
    currentLabel,
    value,
    activeWindow,
    payload.valueChange,
    setValueChange,
    valueChange,
    payload.valueChangePercent,
  ]);

  return null;
};

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  );
};

const BarChart: FC<BarChartProps> = ({
  data,
  color,
  value,
  label,
  valueChange,
  setValue,
  setValueChange,
  setLabel,
  activeWindow,
}: BarChartProps) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartBar
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
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tickFormatter={(time) =>
            typeof time === 'number'
              ? unixToDate(time, activeWindow === TimeWindowEnum.MONTH ? 'MMM' : 'dd')
              : time
          }
          minTickGap={10}
          fontSize={14}
          tickMargin={10}
        />
        <Tooltip
          cursor={{ fill: theme.box.border }}
          contentStyle={{ display: 'none' }}
          formatter={(tooltipValue: number, name: string, props: { payload }) => (
            <HoverUpdater
              payload={props.payload}
              setValue={setValue}
              setLabel={setLabel}
              currentLabel={label}
              value={value}
              activeWindow={activeWindow}
              setValueChange={setValueChange}
              valueChange={valueChange}
            />
          )}
        />
        <Bar
          dataKey="value"
          fill={color || theme.orange}
          shape={(props) => {
            return (
              <CustomBar
                height={props.height}
                width={props.width}
                x={props.x}
                y={props.y}
                fill={color || theme.orange}
              />
            );
          }}
        />
      </ChartBar>
    </ResponsiveContainer>
  );
};

export default BarChart;
