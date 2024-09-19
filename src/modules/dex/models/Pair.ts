import { Currency, Token } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import { BigNumber } from 'ethers';

export type SerializedToken = {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

export enum PairType {
  OFFICIAL,
  IMPORT,
  COMBINATION,
}
export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export type PairTokens = {
  type?: PairType;
  currencyA: Token;
  currencyB: Token;
};

export type PairInfo = {
  currencyA?: Currency;
  currencyB?: Currency;
  pairState?: PairState;
  liquidityToken?: string;
  liquidityTokenSupply?: BigNumber;
  reserveA?: BigNumber;
  reserveB?: BigNumber;
  pair?: Pair;
  isStablePool: boolean;
};

export type ImportPair = {
  address: string;
  tokens: PairTokens;
  stable: boolean;
};
