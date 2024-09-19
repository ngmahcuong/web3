import { BigNumber } from 'ethers';

export type LockdropConfig = {
  address: string;
  totalPool: number;
};

export type StakingConfig = {
  address: string;
  wantToken: string;
  veToken: string;
};

export type LockPoolInfo = {
  index: number;
  token?: string;
  tokenSymbol?: string;
  lockTime?: number;
  unlockTime?: number;
  rewards?: BigNumber;
  totalAmount?: BigNumber;
  durationMonth?: number;
  depositedValue?: BigNumber;
};

export type UserLockPoolInfo = {
  index: number;
  depositedValue?: BigNumber;
};

export type PoolGroupsInfo = {
  token: string;
  pools?: LockPoolInfo[];
};
