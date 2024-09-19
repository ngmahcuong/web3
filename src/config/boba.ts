import { ChainConfig } from './type';

const config: ChainConfig = {
  chainDisplayName: 'Boba',
  isMainNet: true,
  providerUrl: 'https://mainnet.boba.network/',
  explorerUrl: 'https://blockexplorer.boba.network',
  multicall: '0x4648Fc16aFAe4f9CbDf78267140092D403bACfC8',
  nativeToken: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  },
  wrappedToken: 'WETH',
  stableCoin: { symbol: 'MJD' },
  lending: {
    comptroller: '0xf61f6FCEf50D51b39A2Ca1fb17b8079c1ca4742A',
    lens: '0x304B1fa7F0ba9d029E0A266e1Bea1b600A7FA095',
    repayDelegate: '0x1264d34B79527D1d3bDe91F5D523e2456A62a272',
    rewardEstimator: '0x1264d34B79527D1d3bDe91F5D523e2456A62a272',
    reward: 'MOJI',
    markets: [
      {
        asset: 'ETH',
        marketName: 'Ether',
        marketAddress: '0x8BF0815f47b4b8C7B3467c5a1bafd5eD7437450F',
        significantDigits: 3,
        isNativeToken: true,
      },
      {
        asset: 'WBTC',
        marketName: 'Wrapped BTC',
        marketAddress: '0x4FC502C8Ac409D21F62B39b40Ad632D4352a0301',
        significantDigits: 4,
      },
      {
        asset: 'USDT',
        marketName: 'Tether USDT',
        marketAddress: '0x33720D0D09cBE658F85bc7aE920676AE9ba9F4f1',
        significantDigits: 0,
      },
      {
        asset: 'USDC',
        marketName: 'USD Coin',
        marketAddress: '0x85EC9ef53208EdCB51ad80c33FB4fFEB0fECA055',
        significantDigits: 0,
      },
      // {
      //   asset: 'MJD',
      //   marketName: 'MJD Stablecoin',
      //   marketAddress: '0xEa314f85C8A9C4f19fFA67A6b70AF7e845f07f45',
      //   significantDigits: 0,
      //   disableSupply: true,
      // },
    ],
  },
  tokens: {
    USDT: {
      address: '0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d',
      decimals: 6,
    },
    USDC: {
      address: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
      decimals: 6,
    },
    WBTC: {
      address: '0xdc0486f8bf31DF57a952bcd3c1d3e166e3d9eC8b',
      decimals: 8,
    },
    MOJI: {
      address: '0xaA0fE8c5e539c5B4cED5587aC61f2DD73B219d4C',
      decimals: 18,
    },
    MJD: {
      address: '0xB3Cf8D0212b141feD81BE44862953A15c4bd7306',
      decimals: 18,
    },
    USDC_MOJI_LP: {
      address: '',
      decimals: 18,
      name: 'USDC/MOJI LP',
    },
  },
  launchpads: [],
};

export default config;
