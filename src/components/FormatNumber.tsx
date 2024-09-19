import { useMemo } from 'react';
import { formatNumber, FormatOption } from '../utils/numbers';

const FormatNumber: React.FC<{ value: number; negative?: boolean } & Partial<FormatOption>> = ({
  value,
  negative,
  ...options
}) => {
  const { threshold } = options;
  const str = useMemo(() => {
    if (threshold && value > 0 && value < threshold) {
      return `< ${negative ? '-' : ''}${formatNumber(threshold, {
        ...options,
        significantDigits: 1,
      })}`;
    }
    return `${negative ? '-' : ''}` + (value > 1e4 ? '\u221E' : formatNumber(value, options));
  }, [negative, options, threshold, value]);
  return <>{str}</>;
};

export default FormatNumber;
