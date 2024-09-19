import { BigNumber } from 'ethers';
import { PercentageThreshold } from './constants';

export const getPercentageDisplay = (value: number) => {
  return 0 < value && value < PercentageThreshold * 100
    ? `< ${PercentageThreshold * 100}%`
    : `${value}%`;
};

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(3000))).div(BigNumber.from(10000));
}
