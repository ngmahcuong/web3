import { BigNumber } from '@ethersproject/bignumber';

export type StablePoolConfig = {
  name?: string;
  address: string;
  zap?: string;
  assets?: Array<string>;
  chAssets?: Array<string>;
  lpToken: string;
  basePool?: string;
  basePoolIndex?: number;
};

export type StablePool = {
  id?: string;
  name?: string;
  address?: string;
  zap?: string;
  assets?: Array<string>;
  chAssets?: Array<string>;
  lpToken?: string;

  fee?: BigNumber;
  adminFee?: BigNumber;
  withdrawFee?: BigNumber;
  a?: BigNumber;

  virtualPrice?: BigNumber;
  totalSupply?: BigNumber;
  reserves?: BigNumber[];
  balances?: Record<string, BigNumber>;
  loading?: boolean;
};
