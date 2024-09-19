import { parseUnits } from '@ethersproject/units';
import { Percent } from '@uniswap/sdk-core';
import JSBI from 'jsbi';

export const ExternalLinks = {
  twitter: 'https://twitter.com/chaidotxyz',
  documentation: 'https://docs.chai.xyz',
  code: 'https://github.com/chaiprotocol',
  discord: 'https://discord.gg/chaixyz',
  medium: 'https://medium.com/@chaixyz',
};

export const DefaultSteps = [
  { ratio: 25, label: '25%' },
  { ratio: 50, label: '50%' },
  { ratio: 75, label: '75%' },
  { ratio: 100, label: '100%' },
];

export const MaxTransactionHistory = 20;
export const BlocksPerYear = 12579840; // 2.5s
export const BlocksPerDay = Math.round(BlocksPerYear / 365);

// PRECISION
export const Precision = parseUnits('1', 18);
export const SlippagePrecision = parseUnits('1', 10);
export const PercentagePrecision = parseUnits('100', 6);

export const BonusPrecision = parseUnits('0.0000005', 10); // rounding 0.0001%
export const ImpactPrecision = parseUnits('0.0000005', 10); // rounding 0.0001%

// THRESHOLD
export const TokenThreshold: { [symbol: string]: number } = {
  WBTC: 0.00001,
  ETH: 0.0001,
  WETH: 0.0001,
  NEAR: 0.0001,
  DEFAULT: 0.001,
};
export const CurrencyThreshold = 0.01;
export const PercentageThreshold = 0.0001;

// ADDRESS
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// LENDING
export const LendingPrecision = parseUnits('1', 18);
export const MaxLimitRatio = 99e4;
export const SafeLimitPrecision = parseUnits('1', 18);
export const MarketDecimal = 8;

// DEX
export const MAX_HOPS = 3;
export const PriceUpdateInterval = 15; // seconds

export const ZERO_PERCENT = new Percent('0');
export const ONE_HUNDRED_PERCENT = new Percent('1');
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(50, JSBI.BigInt(10000));

export const MINIMUM_LIQUIDITY = parseUnits('1', 3);
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

export const PRICE_IMPACT_HIGH = -10; // 10%
export const PRICE_IMPACT_VERY_HIGH = -20; // 20%

export const SWAP_FEE = 25; //0.25%
export const STABLE_SWAP_FEE = 20; //0.2%
export const SWAP_FEE_PRECISION = 10000;

export const TIMESTAMP_START = 1651225101;
export const PAGE_SIZE = 1000;

// LIMIT ORDER
export type LimitOrderExpireType = 'never' | '1_hour' | '24_hour' | '1_week' | '30_day';

export const LimitOrderExpiredOptions: { value?: LimitOrderExpireType; label?: string }[] = [
  { value: 'never', label: 'Never' },
  { value: '1_hour', label: '1 Hour' },
  { value: '24_hour', label: '24 Hours' },
  { value: '1_week', label: '1 Week' },
  { value: '30_day', label: '30 Days' },
];
