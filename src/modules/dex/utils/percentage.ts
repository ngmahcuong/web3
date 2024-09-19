import { PercentageThreshold } from '../../../utils/constants';

export const getPercentageDisplay = (value: number) => {
  return 0 < value && value < PercentageThreshold * 100
    ? `< ${PercentageThreshold * 100}%`
    : `${value}%`;
};
