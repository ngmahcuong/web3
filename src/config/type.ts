import { LendingConfig } from '../modules/lending/models/Lending';
import { LockdropConfig, StakingConfig } from '../modules/lending/models/Lockdrop';
import { StablePoolConfig } from '../modules/stablepool/models/StablePool';

export type ConnectorName = 'network' | 'injected' | 'walletconnect';

export enum ChainId {
  boba = 288,
  bobaTestnet = 28,
  kovan = 42,
  aurora = 1313161554,
  ropsten = 3,
}

export type ChainConfig = {
  chainDisplayName: string;
  isMainNet: boolean;
  providerUrl: string;
  explorerUrl: string;
  multicall?: string;
  nativeToken: {
    symbol: string;
    name: string;
    decimals: number;
  };
  wrappedToken: string;
  stableCoin: {
    symbol: string;
  };
  lending?: LendingConfig;
  lockdrop?: LockdropConfig;
  staking?: StakingConfig;
  dex?: {
    factory?: string;
    swapExecutor?: string;
    aggregationRouter?: string;
    routeApi?: string;
    swapRouter?: string;
    limitOrder?: string;
    pairCodeHash?: string;
    baseTokensTrades?: string[];
    commonBases?: string[];
    officialPairs?: string[][];
    defaultSwapInput?: string;
    defaultSwapOutput?: string;
    /**
     * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
     * tokens.
     */
    customBaseTokens?: { tokenAddress: string; tokens: string[] }[];
  };
  stablePool?: {
    pools: Record<string, StablePoolConfig>;
  };
  tokens: {
    [symbol: string]: {
      address: string;
      name?: string;
      decimals: number;
      logo?: string;
    };
  };
  chef?: ChefConfig;
  launchpads: LaunchPadConfig[];
  graphql?: string;
};

export type ChefConfig = {
  address: string;
  totalPool?: number;
  pools?: ChefPoolItem[];
};
export type ChefPoolItem = {
  id?: number;
  address?: string;
  wantTokens: string[];
  wantSymbol: string;
  rewardToken: string;
  isLp: boolean;
  minichef?: string;
  inactive?: boolean;
  startRewardTime?: number;
  rewardPerDay?: number | string;
  name?: string;
  isTimeLock?: boolean;
};

export type LaunchPadConfig = {
  address: string;
  paymentToken?: string;
  saleToken?: string;
  fileName?: string;
};
export type Configuration = {
  defaultChainId: ChainId;
  chainConfig: Partial<Record<ChainId, ChainConfig>>;
};
