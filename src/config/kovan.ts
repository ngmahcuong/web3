import { ChainConfig } from './type';

const config: ChainConfig = {
  chainDisplayName: 'Aurora',
  isMainNet: true,
  providerUrl: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  explorerUrl: 'https://kovan.etherscan.io',
  multicall: '0xaB46111828f3bD69B534503fDFC57C67C49f4032',
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
        marketAddress: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
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
        asset: 'NEAR',
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
    ],
  },
  lockdrop: {
    address: '0x37dA97B2696E2F067a8c2c03CCf96327328D1513',
    totalPool: 7,
  },
  dex: {
    factory: '0x112C68D1e7DB574b6E48833DfC80C934d1372aEC',
    swapRouter: '0xD8175C3603b6eC415Df1539dA66D66d8834a962b',
    pairCodeHash: '0xb4843bf99affd13458c25a9ea6b85dfab3ca09f67a11a5d6545f7e7600c09580',
    baseTokensTrades: ['NEAR', 'USDC', 'WETH', 'WBTC'],
    commonBases: ['ETH', 'NEAR', 'USDC', 'USDT', 'WBTC'],
    officialPairs: [
      ['NEAR', 'WETH'],
      ['NEAR', 'USDC'],
      ['NEAR', 'WBTC'],
    ],
    defaultSwapInput: 'ETH',
    defaultSwapOutput: '',
  },
  tokens: {
    WBTC: {
      address: '0xf4eb217ba2454613b15dbdea6e5f22276410e89e',
      decimals: 8,
    },
    NEAR: {
      address: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d',
      decimals: 24,
    },
    USDC: {
      address: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      decimals: 6,
    },
    USDT: {
      address: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
      decimals: 6,
    },
    DAI: {
      address: '0xe3520349f477a5f6eb06107066048508498a291b',
      decimals: 18,
    },
    CH_ETH: {
      address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
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
    WETH: {
      address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
      decimals: 18,
      name: 'Wrapped Ether',
    },
    CHAI: {
      address: '0x9cA144e28c85CAFA2c57490087A084F338ccbC1C',
      decimals: 18,
      name: 'CHAI Token',
    },
  },
  launchpads: [
    {
      address: '0xa081031A7d8A295c1a49175800d57080710560C0',
      paymentToken: 'ETH',
      saleToken: 'CHAI',
    },
  ],
};

export default config;
