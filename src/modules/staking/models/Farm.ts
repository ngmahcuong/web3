import { BigNumber } from 'ethers';

export type FarmPool = {
  index: number;
  token: string;
  allocPoint?: BigNumber;
  lastRewardTimestamp?: BigNumber;
  accChaiPerShare?: BigNumber;
  sumOfFactors?: number;
  accChaiPerFactorShare?: BigNumber;
};
