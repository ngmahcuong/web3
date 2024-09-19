export interface Market {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  totalSupplyUsd: string;
  underlyingDecimals: string;
  underlyingName: string;
  underlyingPriceUSD: string;
  underlyingSymbol: string;
  cash: string;
  reserves: string;
  reserveFactor: string;
  totalBorrows: string;
  accrualBlockTimestamp: string;
  borrowIndex: string;
  borrowRate: string;
  supplyRate: string;
  collateralFactor: string;
  exchangeRate: string;
  interestRateModelAddress: string;
  totalInterestAccumulated: string;
}
