export interface Chart {
  date: number;
  dailyVolumeUSD: string;
  totalLiquidityUSD: string;
  dailyVolumeToken0: string;
  dailyVolumeToken1: string;
  reserveUSD: string;
  volumeUSD: string;
  timestamp: string;
}
export interface PriceChart {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface Protocol {
  id: string;
  totalVolumeUSD: string;
  totalLiquidityUSD: string;
  txCount: string;
  pairCount: number;
}

export interface TrackOrder {
  id: string;
  orderCount: string;
}

export interface TokenFields {
  id: string;
  symbol: string;
  name: string;
  derivedETH: string;
  tradeVolumeUSD: string;
  tradeVolume: string;
  txCount: string;
  totalLiquidity: string;
  untrackedVolumeUSD: string;
}

export interface TokenDataResponse {
  tokens: TokenFields[];
  bundles: {
    ethPriceUSD: string;
  }[];
}

export interface Pool {
  id: string;
  stable: boolean;
  pair: Pair;
  stablePool: StablePool;
}

export interface Pair {
  id: string;
  txCount: number;
  token0: {
    id: string;
    symbol: string;
    name: string;
    totalLiquidity: string;
    derivedETH: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    totalLiquidity: string;
    derivedETH: string;
  };
  reserve0: string;
  reserve1: string;
  reserveUSD: string;
  totalSupply: string;
  trackedReserveETH: string;
  reserveETH: string;
  volumeUSD: string;
  untrackedVolumeUSD: string;
  token0Price: string;
  token1Price: string;
  createdAtTimestamp: string;
}
export interface Token {
  id: string;
  symbol: string;
  name: string;
  derivedETH: string;
  tradeVolumeUSD: string;
  tradeVolume: string;
  txCount: string;
  totalLiquidity: string;
  untrackedVolumeUSD: string;
}
export interface EthPrice {
  current: number;
  oneDay: number;
  twoDay: number;
  week: number;
}
export interface TokenPrice {
  tokenAddress: string;
  timestamp: number;
  derivedETH: number;
  ethPrice: number;
}

export type PairHoursDatasResponse = {
  pairHourDatas: {
    id: string;
    hourStartUnix: number;
    reserve0: string;
    reserve1: string;
    reserveUSD: string;
    pair: {
      token0: {
        id: string;
      };
      token1: {
        id: string;
      };
    };
  }[];
};

export type PairDayDatasResponse = {
  pairDayDatas: {
    id: string;
    date: number;
    reserve0: string;
    reserve1: string;
    reserveUSD: string;
    pairAddress: {
      token0: {
        id: string;
      };
      token1: {
        id: string;
      };
    };
  }[];
};

export type PairDataNormalized = {
  time: number;
  token0Id: string;
  token1Id: string;
  reserve0: number;
  reserve1: number;
}[];

export type PairPricesNormalized = {
  time: Date;
  value: number;
}[];

export type DerivedPairDataNormalized = {
  time: number;
  token0Id: string;
  token1Id: string;
  token0DerivedETH: number;
  token1DerivedETH: number;
}[];

export enum TimeWindowEnum {
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

export interface ChartData {
  date: number;
  volumeUSD: number;
  volumeUSDChange: number;
  liquidityUSD: number;
  liquidityUSDChange: number;
}

export interface StablePool {
  id: string;
  coins: {
    token: {
      id: string;
      name: string;
      symbol: string;
    };
  }[];
  txCount: number;
  reserve: string;
  reserveUSD: string;
  volumeUSD: string;
  virtualPrice: string;
  fee: string;
  lpToken: {
    id: string;
    address: string;
  };
}
export type LimitOrderStatus = 'cancelled' | 'executed' | 'created';

export interface LimitOrderData {
  id: string;
  inputAmount?: string;
  inputToken?: {
    id?: string;
    name?: string;
    symbol?: string;
    decimals?: string;
  };
  outputToken?: {
    id?: string;
    name?: string;
    symbol?: string;
    decimals?: string;
  };
  status?: LimitOrderStatus;
  outputAmount?: string;
  actualOutputAmount?: string;
  expiryTimestamp?: string;
  createdAt?: string;
  recipient?: string;
  submitTimestamp?: string;
}
