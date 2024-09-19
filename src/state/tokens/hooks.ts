import { BigNumber } from '@ethersproject/bignumber';
import { mapValues } from 'lodash';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '..';
import { toBigNumber } from '../../utils/numbers';
import { startObserveTokens } from './actions';

export const useStartObserveTokens = () => {
  const dispatch = useDispatch();

  return useCallback(
    (tokens: string[]) => {
      dispatch(startObserveTokens(tokens));
    },
    [dispatch],
  );
};

export const useTokenPrice = (token: string) => {
  const price = useSelector<AppState, string>((s) => s.tokens.priceInUsd[token?.toUpperCase()]);

  return useMemo(() => {
    return price ? BigNumber.from(price) : null;
  }, [price]);
};

export const useAllTokenPrice = () => {
  const tokens = useSelector((s: AppState) => s.tokens.priceInUsd);

  return useMemo(() => mapValues(tokens, toBigNumber), [tokens]);
};
