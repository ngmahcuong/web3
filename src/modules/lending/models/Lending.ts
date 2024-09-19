import { BigNumber } from '@ethersproject/bignumber';

export type MarketConfig = {
  marketName: string;
  asset: string;
  marketAddress: string;
  isNativeToken?: boolean;
  significantDigits: number;
  disableSupply?: boolean;
  disableBorrow?: boolean;
  disableCanBeCollateral?: boolean;
};

export type LendingConfig = {
  comptroller: string;
  lens: string;
  reward: string;
  repayDelegate: string;
  rewardEstimator?: string;
  markets: MarketConfig[];
};



export type UserPositionInMarket = {
  marketAddress: string;
  underlying: string;
  underlyingSymbol: string;
  xTokenBalance: BigNumber;
  borrowBalance: BigNumber;
};

export type LendingUserInfo = {
  enteredMarkets: string[];
  supplying: Record<string, BigNumber>;
  borrowing: Record<string, BigNumber>;
  liquidity: BigNumber;
  shortfall: BigNumber;
  loading?: boolean;
};

export type Market = {
  marketName: string;
  isListed: boolean;
  asset: string;
  assetAddress: string;
  assetDecimals: number;
  marketAddress: string;
  significantDigits: number;
  isNativeToken: boolean;
  exchangeRate: BigNumber;
  cash: BigNumber;
  totalSupply: BigNumber;
  totalUnderlyingSupply: BigNumber;
  totalSupplyValue: BigNumber;
  totalBorrows: BigNumber;
  totalBorrowValue: BigNumber;
  supplyRatePerBlock: BigNumber;
  supplyRatePerYear: BigNumber;
  supplyApy: number;
  borrowRatePerBlock: BigNumber;
  borrowRatePerYear: BigNumber;
  borrowApy: number;
  totalReserves: BigNumber;
  underlyingPrice: BigNumber;
  collateralFactor: BigNumber;
  compSpeed: BigNumber;
  reserveFactor: BigNumber;
  borrowCap: BigNumber;
  supplyDistributionApy?: number;
  borrowDistributionApy?: number;
  marketLiquidity: BigNumber;
  disableSupply?: boolean;
  disableBorrow?: boolean;
  disableCanBeCollateral?: boolean;
  liquidationThreshold: BigNumber;
  liquidationIncentive: BigNumber;
  mintPaused: boolean;
  borrowPaused: boolean;
};

export type ComptrollerState = {};
