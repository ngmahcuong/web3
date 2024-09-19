import { Currency, Token } from '@uniswap/sdk-core';
import { ChainId, getWrappedToken } from '../../../config';
import { SerializedToken } from '../models/Pair';

export const serializeToken = (token: Token): SerializedToken => {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
};

export const deserializeToken = (serializedToken: SerializedToken): Token => {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
};

export const equalsCurrency = (left?: Currency, right?: Currency) => {
  if (left && right) {
    if (left.isNative && right.isNative) {
      return true;
    } else if (left.wrapped?.equals(right) || right?.wrapped?.equals(left)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const isWrapNativeToken = (chainId?: ChainId, currency?: Currency) => {
  const wrapToken = getWrappedToken(chainId);
  return currency && wrapToken && currency?.wrapped?.address === wrapToken?.address;
};
