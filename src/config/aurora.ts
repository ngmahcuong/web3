import { ChainConfig } from './type';

const config: ChainConfig = {
  chainDisplayName: 'Aurora',
  isMainNet: true,
  providerUrl: 'https://aurora-mainnet.infura.io/v3/f10aa57beec84b8d9b6844d1222436d4',
  explorerUrl: 'https://aurorascan.dev',
  multicall: '0x87586F849ea4Bb7f911c0D2C763fB00FdA95E7eD',
  graphql: 'https://graph.chai.xyz/subgraphs/name/chaiprotocol',
  nativeToken: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  },
  wrappedToken: 'WETH',
  stableCoin: { symbol: '' },
  lending: {
    comptroller: '0xC5Fc88D158F8527927f26692e7530fb0CCc2320B',
    lens: '0x8F94B553e484DA9Dc161325E6fB84b8BbD176d19',
    repayDelegate: '0xBd8018EF5c9498bd1F379f77A60ba376FEc487aF',
    rewardEstimator: '0xD0Ce0c33E9AD6f1Db1B9b73f39Bf7A4dfA7c47C2',
    reward: 'CHAI',
    markets: [
      {
        asset: 'ETH',
        marketName: 'Ether',
        marketAddress: '0x9617564b3C774E1752FD97dE8E1d2d9552dc1B3F',
        significantDigits: 3,
        isNativeToken: true,
      },
      {
        asset: 'WBTC',
        marketName: 'Wrapped BTC',
        marketAddress: '0xA30bFaE4c1b7b55B918c476B3CDaa79a4EbaF651',
        significantDigits: 4,
      },
      {
        asset: 'WNEAR',
        marketName: 'Wrapped NEAR',
        marketAddress: '0xe60Fe6cFd57c3D02Aac0f70bA596eDBe544C5232',
        significantDigits: 3,
      },
      {
        asset: 'USDC',
        marketName: 'USD Coin',
        marketAddress: '0x76303cd5466835FEF4F58B706CBf1E238Ca5fa68',
        significantDigits: 0,
      },
      {
        asset: 'USDT',
        marketName: 'Tether USDT',
        marketAddress: '0xA0482a194f918A70DaFBbd1C3798bDA959A3d3a6',
        significantDigits: 0,
      },
      // {
      //   asset: 'DAI',
      //   marketName: 'DAI',
      //   marketAddress: '0xe3f848dB36FdC40162ce055b2d6e0696566a78ca',
      //   significantDigits: 0,
      // },
      {
        asset: 'USN',
        marketName: 'USN',
        marketAddress: '0x1e4364cCAB9827de5fAd227D1E49119274164B84',
        significantDigits: 0,
      },
    ],
  },
  lockdrop: {
    address: '0x37dA97B2696E2F067a8c2c03CCf96327328D1513',
    totalPool: 16,
  },
  launchpads: [
    {
      address: '0xa081031A7d8A295c1a49175800d57080710560C0',
      paymentToken: 'ETH',
      saleToken: 'CHAI',
    },
  ],
  chef: {
    address: '0x0Fb8dF43d681b6314d22aA1588D04f9cf30465dC',
    totalPool: 2,
    pools: [
      {
        id: 0,
        wantTokens: ['WNEAR', 'USDC'],
        wantSymbol: 'WNEAR_USDC_LP',
        rewardToken: 'CHAI',
        isLp: true,
      },
      {
        id: 1,
        wantTokens: ['WNEAR', 'WETH'],
        wantSymbol: 'WNEAR_WETH_LP',
        rewardToken: 'CHAI',
        isLp: true,
      },
    ],
  },
  staking: {
    address: '0xb6f95D0D92AdF89c9fC76Ece32D9AB7b5a756E95',
    wantToken: 'CHAI',
    veToken: 'VECHAI',
  },
  dex: {
    factory: '0x112C68D1e7DB574b6E48833DfC80C934d1372aEC',
    swapExecutor: '0x3CF54c7Ba0e91cA0F097dA358b75979Ea7862a63',
    aggregationRouter: '0x46e71B59EAc870610533c85fc61b48b890b986AB',
    routeApi: 'https://api.chai.xyz/route',
    swapRouter: '0xD8175C3603b6eC415Df1539dA66D66d8834a962b',
    pairCodeHash: '0xb4843bf99affd13458c25a9ea6b85dfab3ca09f67a11a5d6545f7e7600c09580',
    limitOrder: '0xeD197c865D9343223d1758019977BdEA989e095b',
    baseTokensTrades: ['WNEAR', 'USDC', 'WETH', 'WBTC'],
    commonBases: ['ETH', 'WNEAR', 'USDC', 'USDT', 'WBTC'],
    officialPairs: [
      ['WNEAR', 'WETH'],
      ['WNEAR', 'USDC'],
      ['WNEAR', 'WBTC'],
    ],
    defaultSwapInput: 'ETH',
    defaultSwapOutput: '',
  },
  stablePool: {
    pools: {
      CH2USD: {
        name: 'Chai 2USD Pool',
        address: '0x5442dB4C1E15714e2392fc49E04BC3377BaE00d5',
        zap: '0xe31B9C998DFBdf780AbE1c4A241F2Cd754F41854',
        basePool: '0x177B4157E19733cF2F7c972ce538F760FEf7E209',
        assets: ['USDC', 'USDT'],
        chAssets: ['CH_USDC', 'CH_USDT'],
        lpToken: 'CH2USD', // TODO rename
      },
    },
  },
  tokens: {
    WBTC: {
      address: '0xf4eb217ba2454613b15dbdea6e5f22276410e89e',
      decimals: 8,
    },
    WETH: {
      address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
      decimals: 18,
      name: 'Wrapped Ether',
    },
    WNEAR: {
      address: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d',
      decimals: 24,
    },
    USDC: {
      address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
      decimals: 6,
      name: 'USDC',
    },
    USDT: {
      address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f',
      decimals: 6,
      name: 'USDT',
    },
    DAI: {
      address: '0xe3520349f477a5f6eb06107066048508498a291b',
      decimals: 18,
    },
    USN: {
      address: '0x5183e1b1091804bc2602586919e6880ac1cf2896',
      decimals: 18,
    },
    // Lending CH tokens
    CH_ETH: {
      address: '0x9617564b3C774E1752FD97dE8E1d2d9552dc1B3F',
      decimals: 8,
      name: 'chETH',
    },
    CH_WBTC: {
      address: '0xA30bFaE4c1b7b55B918c476B3CDaa79a4EbaF651',
      decimals: 8,
      name: 'chWBTC',
    },
    CH_NEAR: {
      address: '0xe60Fe6cFd57c3D02Aac0f70bA596eDBe544C5232',
      decimals: 8,
      name: 'chNEAR',
    },
    CH_USDC: {
      address: '0x76303cd5466835FEF4F58B706CBf1E238Ca5fa68',
      decimals: 8,
      name: 'chUSDC',
    },
    CH_USDT: {
      address: '0xA0482a194f918A70DaFBbd1C3798bDA959A3d3a6',
      decimals: 8,
      name: 'chUSDT',
    },
    CH_DAI: {
      address: '0xe3f848dB36FdC40162ce055b2d6e0696566a78ca',
      decimals: 8,
      name: 'chDAI',
    },
    CH_USN: {
      address: '0x1e4364cCAB9827de5fAd227D1E49119274164B84',
      decimals: 8,
      name: 'chUSN',
    },
    // Stable Pools
    CH2USD: {
      address: '0x5442dB4C1E15714e2392fc49E04BC3377BaE00d5',
      decimals: 18,
      name: 'CH2USD',
    },
    CH_MP: {
      address: '0x7DD8e8727EDBbb8F26576865a0e828f014130475',
      decimals: 18,
      name: 'chMP',
    },
    //Staking Token
    VECHAI: {
      address: '0xb6f95D0D92AdF89c9fC76Ece32D9AB7b5a756E95',
      decimals: 18,
      name: 'veCHAI',
    },
    CHAI: {
      address: '0x5DCDD8F224D8F0B41BbC516c87c26EA1333D3D91',
      decimals: 18,
      name: 'CHAI Token',
    },
    //Chef LP Token
    WNEAR_USDC_LP: {
      address: '0x90f2eC79FAB62918B2AFafD9F512BBE8c4df8586',
      decimals: 18,
      name: 'NEAR/USDC LP',
    },
    WNEAR_WETH_LP: {
      address: '0x0B2E6D08e01390eC098A4a4e7BA1495610484A5E',
      decimals: 18,
      name: 'NEAR/ETH LP',
    },
  },
};

export default config;
