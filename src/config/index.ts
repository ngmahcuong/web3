import { Token } from '@uniswap/sdk-core';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import { computePairAddress } from '../modules/dex/utils/pair';
import { MarketConfig } from '../modules/lending/models/Lending';
import { StablePoolConfig } from '../modules/stablepool/models/StablePool';
import ropsten from './ropsten';
import { ChainId, ChefPoolItem, Configuration } from './type';

export * from './type';

export const config: Configuration = {
  chainConfig: {
    [ChainId.ropsten]: ropsten,
  },
  defaultChainId: ChainId.ropsten,
};

export const supportedChainIds = Object.keys(config.chainConfig).map((t) => +t);

export const getChainConfig = (chainId: number) => {
  return {
    chainId,
    chainName: get(config.chainConfig, [chainId, 'chainDisplayName']),
    nativeCurrency: get(config.chainConfig, [chainId, 'nativeToken']),
    rpcUrl: get(config.chainConfig, [chainId, 'providerUrl']),
    blockExplorerUrl: get(config.chainConfig, [chainId, 'explorerUrl']),
    isMainnet: get(config.chainConfig, [chainId, 'isMainNet']),
  };
};

export const networkUrls = mapValues(config.chainConfig, (t) => t.providerUrl);

export const getChainName = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'chainDisplayName']);
};

export const getExplorerUrl = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'explorerUrl']);
};

export const getMulticallAddress = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'multicall']);
};

export const getNativeToken = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'nativeToken']);
};

export const getWrappedToken = (chainId: ChainId) => {
  const wrapped = get(config.chainConfig, [chainId, 'wrappedToken']);
  return getTokenConfig(chainId, wrapped);
};

export const getStableCoinSymbol = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'stableCoin', 'symbol']);
};

export const getStableCoinAddress = (chainId: number) => {
  return getTokenAddress(chainId, getStableCoinSymbol(chainId));
};

export const getNativeTokenSymbol = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'nativeToken', 'symbol']);
};

export const getTokenConfig = (chainId: ChainId, tokenSymbol: string) => {
  if (!tokenSymbol) {
    return undefined;
  }
  const tokenConfig = get(config.chainConfig, [chainId, 'tokens', tokenSymbol]) as {
    decimals: number;
    address: string;
    logo?: string;
    name?: string;
  };

  return { ...(tokenConfig || {}), symbol: tokenSymbol };
};

export const getTokenByAddress = (chainId: ChainId, tokenAddress: string) => {
  if (!tokenAddress) {
    return undefined;
  }

  const tokens = get(config.chainConfig, [chainId, 'tokens']);
  const tokenSymbol = Object.keys(tokens).find(
    (key) => tokens[key].address.toLowerCase() === tokenAddress.toLowerCase(),
  );
  return getTokenConfig(chainId, tokenSymbol);
};

export const getTokenAddress = (chainId: ChainId, tokenSymbol: string) => {
  return get(config.chainConfig, [chainId, 'tokens', tokenSymbol, 'address']);
};

// LENDING

export const getAllMarketsConfig = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'lending', 'markets']) as MarketConfig[];
};

export const getMarketFromMarketAdrress = (chainId: number, marketAddress?: string) => {
  const markets = getAllMarketsConfig(chainId) || [];

  return markets.find(
    (m) => m?.marketAddress?.toLowerCase() === marketAddress?.toLocaleLowerCase(),
  );
};

export const getComptrollerAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'lending', 'comptroller']);
};

export const getLensAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'lending', 'lens']);
};

export const getLendingRewardSymbol = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'lending', 'reward']);
};

export const getREtherRepayDelegateAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'lending', 'repayDelegate']);
};

export const getLendingRewardEstimator = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'lending', 'rewardEstimator']);
};

export const getLockdropConfig = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'lockdrop']);
};

export const getLockdropAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'lockdrop', 'address']);
};

// Staking
export const getStakingConfig = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'staking']);
};

export const getStakingAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'staking', 'address']);
};

// DEX

export const getFactoryAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'dex', 'factory']);
};

export const getSwapExecutorAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'dex', 'swapExecutor']);
};

export const getAggregationRouterAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'dex', 'aggregationRouter']);
};

export const getSwapRouterAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'dex', 'swapRouter']);
};

export const getLimitOrderAddress = (chainId: number) => {
  return get(config.chainConfig, [chainId, 'dex', 'limitOrder']);
};

export const getPairCodeHash = (chainId: ChainId) =>
  get(config.chainConfig, [chainId, 'dex', 'pairCodeHash']);

export const getBaseTokensToCheckTrades = (chainId: ChainId): Token[] => {
  const baseTokensTrades = get(config.chainConfig, [chainId, 'dex', 'baseTokensTrades']);
  return baseTokensTrades?.map((symbol) => {
    const token = getTokenConfig(chainId, symbol);
    return new Token(chainId, token.address, token.decimals, token.symbol, token.name);
  });
};

export const getOfficialPairs = (chainId: ChainId): Token[][] => {
  const officialPairs = get(config.chainConfig, [chainId, 'dex', 'officialPairs']);
  return (
    officialPairs?.map((symbols) =>
      symbols.map((symbol) => {
        const token = getTokenConfig(chainId, symbol);
        return new Token(chainId, token.address, token.decimals, token.symbol, token.name);
      }),
    ) || []
  );
};

export const getOfficialPairsAddresses = (chainId: ChainId): string[] =>
  getOfficialPairs(chainId)?.map((tokens) =>
    computePairAddress(chainId, tokens?.[0], tokens?.[1]),
  );

export const getDefaultSwapToken = (chainId: ChainId) => {
  return {
    defaultSwapInput: get(config.chainConfig, [chainId, 'dex', 'defaultSwapInput']),
    defaultSwapOutput: get(config.chainConfig, [chainId, 'dex', 'defaultSwapOutput']),
  };
};

export const getCustomBaseToken = (chainId: ChainId) => {
  const ret: { string?: Token[] } = {};
  get(config.chainConfig, [chainId, 'dex', 'customBaseTokens'])?.forEach((tk) => {
    const tokens = tk?.tokens?.map((t) => {
      const token = getTokenConfig(chainId, t);
      return new Token(chainId, token.address, token.decimals, token.symbol, token.name);
    });
    ret[tk.tokenAddress] = tokens;
  });
  return ret;
};

export const getCommonBases = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'dex', 'commonBases']);
};

export const getRouterApi = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'dex', 'routeApi']);
};

//launchpad
export const getLaunchpadConfigs = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'launchpads']);
};

export const getLaunchpadAddress = (chainId: number, index: number) => {
  return get(config.chainConfig, [chainId, 'launchpads', index, 'address']);
};

export const getGraph = (chainId: ChainId) => get(config.chainConfig, [chainId, 'graphql']);

//chef
export const getChefConfigs = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'chef']);
};

export const getChefAddress = (chainId: number, index: number) => {
  return get(config.chainConfig, [chainId, 'chef', index, 'address']);
};

export const getAllChefPoolsConfig = (chainId: ChainId) => {
  const chefConfig = getChefConfigs(chainId);
  return chefConfig?.pools
    .filter((p) => !p.isTimeLock)
    .map((p) => {
      return {
        ...p,
        minichef: chefConfig.address,
      };
    }) as ChefPoolItem[];
};

// STABLE POOLS

export const getStablePoolConfig = (chainId: ChainId, poolId: string) => {
  return get(
    config.chainConfig,
    [chainId, 'stablePool', 'pools', poolId],
    null,
  ) as StablePoolConfig;
};

export const getAllStablePoolConfig = (chainId: ChainId) => {
  return get(config.chainConfig, [chainId, 'stablePool', 'pools']) as Record<
    string,
    StablePoolConfig
  >;
};

export const getAllStablePools = (chainId: ChainId) => {
  const pools = get(config.chainConfig, [chainId, 'stablePool', 'pools']);
  return Object.values(pools)?.map((pool) => {
    return {
      ...pool,
      chAssetAddresses: pool.chAssets?.map((t) => {
        const tokenAddress = getTokenConfig(chainId, t)?.address;
        return tokenAddress;
      }),
    };
  });
};
