import { MaxUint256 } from '@ethersproject/constants';
import { useWeb3React } from '@web3-react/core';
import { get, mapValues, pick } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '..';
import { getNativeTokenSymbol, getTokenAddress } from '../../config';
import { toBigNumber } from '../../utils/numbers';
import { disconnectAccount, watchToken } from './actions';
import { Currency, Token } from '@uniswap/sdk-core';
import { isAddress } from '../../utils/addresses';
import { BigNumber } from 'ethers';
import { useNativeToken } from '../../hooks/useNativeToken';

export const useSavedConnector = () => {
  return useSelector((s: AppState) => s.user.connector);
};

export const useCurrentAccount = () => {
  return useSelector((s: AppState) => s.user.currentAccount);
};

export const useTokenBalance = (token: string) => {
  const { chainId } = useWeb3React();
  const tokenAddress = useMemo(
    () => isAddress(getTokenAddress(chainId, token) || token) || token,
    [chainId, token],
  );
  const balance = useSelector(
    (s: AppState) => s.user.balances && s.user.balances[tokenAddress],
  );
  return useMemo(() => toBigNumber(balance), [balance]);
};

export const useTokenBalances = (tokens: string[]) => {
  const { chainId } = useWeb3React();
  const formatedTokens = tokens?.map(
    (token) => isAddress(getTokenAddress(chainId, token) || token) || token,
  );
  const balances = useSelector((s: AppState) => s.user.balances);
  return mapValues(pick(balances, formatedTokens), toBigNumber);
};

export function useCurrencyBalances(
  currencies?: (Currency | undefined)[],
): (BigNumber | undefined)[] {
  const { chainId } = useWeb3React();
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies],
  );

  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens],
  );

  const nativeToken = getNativeTokenSymbol(chainId);

  const tokenBalances = useTokenBalances(validatedTokenAddresses);
  const ethBalance = useTokenBalance(nativeToken);

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!currency) return undefined;
        if (currency instanceof Token) return tokenBalances?.[currency.address];
        if (currency.isNative) return ethBalance;
        return undefined;
      }) ?? [],
    [currencies, ethBalance, tokenBalances],
  );
}

export function useCurrencyBalance(currency?: Currency): BigNumber | undefined {
  return useCurrencyBalances([currency])[0];
}

export const useAllowance = (symbol: string, address: string, spender: string) => {
  const allowance = useSelector((s: AppState) => get(s.user.allowances, [address, spender]));
  const nativeToken = useNativeToken();

  return useMemo(() => {
    if (symbol === nativeToken?.symbol) {
      return MaxUint256;
    } else {
      return toBigNumber(allowance) || undefined;
    }
  }, [allowance, nativeToken?.symbol, symbol]);
};

export const useDisconnectAccount = () => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(disconnectAccount());
  }, [dispatch]);
};

export const useWatchTokenBalance = () => {
  const dispatch = useDispatch();
  return useCallback(
    (tokens: string[]) => {
      dispatch(watchToken(tokens));
    },
    [dispatch],
  );
};
