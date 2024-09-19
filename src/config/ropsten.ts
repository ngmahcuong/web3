import { ChainConfig } from './type';

const config: ChainConfig = {
  chainDisplayName: 'Ropsten',
  isMainNet: false,
  providerUrl: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  explorerUrl: 'https://ropsten.etherscan.io',
  multicall: '0xc9C0f267Fc7B4BA85eb289350C5B6B2d738E9843',
  graphql: 'https://api.thegraph.com/subgraphs/name/gemini18',
  nativeToken: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  },
  wrappedToken: 'WETH',
  stableCoin: { symbol: '' },
  lending: {
    comptroller: '0xffafeedacab2a2c1c26030008a446631d1dae2fb',
    lens: '0x4d64B695c826d795A2e2fcDcA7bDf4c0C97fF88c',
    repayDelegate: '0xCb0D11F6C7724A377ef8Ba9ae30797A632931Bd3',
    rewardEstimator: '0xA71AdA1e55ad325bCE94C977889DF3B21A0B0ADb',
    reward: 'CHAI',
    markets: [
      {
        asset: 'ETH',
        marketName: 'Ether',
        marketAddress: '0xe50d446322fD76f086583dd0AA8a7bf37f400Bec',
        significantDigits: 3,
        isNativeToken: true,
      },
      {
        asset: 'WBTC',
        marketName: 'Wrapped BTC',
        marketAddress: '0x1155C6774a9A9F90E17D4b2874Bd176180076a85',
        significantDigits: 4,
      },
      {
        asset: 'USDC',
        marketName: 'USD Coin',
        marketAddress: '0x1F766566db4299197868a35e127AacD697e82537',
        significantDigits: 0,
      },
      {
        asset: 'USDT',
        marketName: 'Tether USDT',
        marketAddress: '0x2655a498BdF4624128Ee4F97Ce234453C6cc6FB8',
        significantDigits: 0,
      },
    ],
  },
  dex: {
    factory: '0x3bBfa2074776833bfbDCBCcC9Bc441FF2bd58322',
    swapExecutor: '0xBcb6e8deDeA6D0C26b7784cb36F7b88C925a8725',
    aggregationRouter: '0x5d1bf8295C20E2f64Cd1E2f9A34D08C6A74586B1',
    routeApi: 'https://api.chai.xyz/ropsten/route',
    swapRouter: '0x420E428D92fC20c91B67f49207e84feDbBD816e0',
    pairCodeHash: '0xb4843bf99affd13458c25a9ea6b85dfab3ca09f67a11a5d6545f7e7600c09580',
    limitOrder: '0x22b400Db3779Fde2525CAe2ef74e453984cBdD6d',
    baseTokensTrades: ['USDC', 'WETH', 'WBTC'],
    commonBases: ['ETH', 'USDC', 'USDT', 'WBTC'],
    officialPairs: [
      ['USDC', 'WETH'],
      ['USDT', 'WETH'],
      ['WBTC', 'WETH'],
    ],
    defaultSwapInput: 'ETH',
    defaultSwapOutput: '',
  },
  stablePool: {
    pools: {
      chBP: {
        name: 'USDC/USDT',
        address: '0x585994b30b0e2a36Dbba2eB69b3b54C9BaF9e3c5',
        basePool: '0x0A2DD72DF5E697af21Bb91FCdA4eCdA581f0c020',
        zap: '0x405aee0e691B7B93D171755d4d9f626b570A7Ac7',
        assets: ['USDC', 'USDT'],
        chAssets: ['CH_USDC', 'CH_USDT'],
        lpToken: 'CH_BP', // TODO rename
      },
      chMP: {
        name: 'USDC/USDT/USN',
        address: '0x40113B418ffaA0106f762a1a2247809c6A1890Ae',
        basePool: '0x0Eeb575894254856AbeCB504989C340814D324F8',
        chAssets: ['CH_BP', 'USN'],
        lpToken: 'USN_CHBP', // TODO rename
        basePoolIndex: 1,
      },
    },
  },
  lockdrop: {
    address: '0x58f2F3310F3b52507E6265f7cE731C43bA0994c0',
    totalPool: 5,
  },
  chef: {
    address: '0xe5C754fd4F7ad6D9F2858ffB2ece4E523d930303',
    totalPool: 2,
    pools: [
      {
        id: 0,
        wantTokens: ['WETH', 'USDC'],
        wantSymbol: 'WETH_USDC_LP',
        rewardToken: 'CHAI',
        isLp: true,
      },
      {
        id: 1,
        wantTokens: ['USDT', 'WETH'],
        wantSymbol: 'USDT_WETH_LP',
        rewardToken: 'CHAI',
        isLp: true,
      },
    ],
  },
  staking: {
    address: '0xBE02B85daf9093eDAb3e4dd2DaC76d3F49766Dc4',
    wantToken: 'CHAI',
    veToken: 'VECHAI',
  },
  launchpads: [
    {
      address: '0xb2B4160F2F836cCB82f8d55CD0f3dB827B26Fdf1',
      paymentToken: 'ETH',
      saleToken: 'CHAI',
      fileName: 'merkletree.json',
    },
  ],
  tokens: {
    WBTC: {
      address: '0x51624e2EA8B5c5190392AD7D23B118Ec23a2045C',
      decimals: 8,
      name: 'testWBTC',
    },
    WETH: {
      address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      decimals: 18,
    },
    USDC: {
      address: '0xD782BbE5B20841dfDe10baF7e86e299A5D973c0c',
      decimals: 6,
      name: 'testUSDC',
    },
    USDT: {
      address: '0x853d50861703C4Cce0FE85466D20279FC729cc77',
      decimals: 6,
      name: 'testUSDT',
    },
    USN: {
      address: '0xD27b32BDB928901751fce692D066e0931F034ED7',
      decimals: 18,
      name: 'testUSN',
    },
    CH_ETH: {
      address: '0xe50d446322fD76f086583dd0AA8a7bf37f400Bec',
      decimals: 8,
      name: 'chETH',
    },
    CH_WBTC: {
      address: '0x1155C6774a9A9F90E17D4b2874Bd176180076a85',
      decimals: 8,
      name: 'chWBTC',
    },
    CH_USDC: {
      address: '0x1F766566db4299197868a35e127AacD697e82537',
      decimals: 8,
      name: 'chUSDC',
    },
    CH_USDT: {
      address: '0x2655a498BdF4624128Ee4F97Ce234453C6cc6FB8',
      decimals: 8,
      name: 'chUSDT',
    },
    CH_BP: {
      address: '0x585994b30b0e2a36Dbba2eB69b3b54C9BaF9e3c5',
      decimals: 18,
      name: 'chBP',
    },
    USN_CHBP: {
      address: '0x40113B418ffaA0106f762a1a2247809c6A1890Ae',
      decimals: 18,
      name: 'chMP',
    },
    CHAI: {
      address: '0x0EF344140cAD483f355A95FBd5fC724620606d81',
      decimals: 18,
      name: 'CHAI Token',
    },
    VECHAI: {
      address: '0xBE02B85daf9093eDAb3e4dd2DaC76d3F49766Dc4',
      decimals: 18,
      name: 'veCHAI',
    },
    WETH_USDC_LP: {
      address: '0xbaAf2985249970d66E7D6DC557E8273f8997b34f',
      decimals: 18,
      name: 'ETH USDC_LP',
    },
    USDT_WETH_LP: {
      address: '0xC1A462066E47ad46FFB9391601728Fc01B4CCd8F',
      decimals: 18,
      name: 'WETH_USDT_LP',
    },
  },
};

export default config;
