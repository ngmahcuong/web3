import { Currency, NativeCurrency, Token } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getNativeToken, getWrappedToken } from '../../../config';

export const useDexNativeToken = () => {
  const { chainId } = useWeb3React();
  return useMemo(() => {
    return chainId && new NATIVE(chainId);
  }, [chainId]);
};

class NATIVE extends NativeCurrency {
  constructor(chainId: number) {
    const nativeToken = getNativeToken(chainId);
    super(chainId, nativeToken.decimals, nativeToken.symbol, nativeToken.name);
  }

  public get wrapped(): Token {
    const wrapped = getWrappedToken(this.chainId);
    if (wrapped)
      return new Token(
        this.chainId,
        wrapped.address,
        wrapped.decimals,
        wrapped.symbol,
        wrapped.name,
      );
    throw new Error('Unsupported chain ID');
  }

  private static _cache: { [chainId: number]: NATIVE } = {};

  public static onChain(chainId: number): NATIVE {
    return this._cache[chainId] ?? (this._cache[chainId] = new NATIVE(chainId));
  }

  public equals(other: Currency): boolean {
    return other?.isNative && other?.chainId === this?.chainId;
  }
}
