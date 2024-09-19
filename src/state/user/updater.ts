import { createSelector } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '..';
import useDebounce from '../../hooks/useDebounce';
import { useMulticall } from '@reddotlabs/multicall-react';
import { useUserWallet } from '../../providers/UserWalletProvider';
import { useLastUpdated } from '../application/hooks';
import { balanceChanged, multipleTokenBalanceFetched } from './actions';
import { isAddress } from '../../utils/addresses';
import { getAddress } from '@ethersproject/address';
import { useNativeToken } from '../../hooks/useNativeToken';

const selectObservedTokens = createSelector(
  [(s: AppState) => s.user.observedTokens],
  (tokens) => {
    return Object.entries(tokens)
      .filter(([, count]) => count > 0)
      .map((t) => t[0]);
  },
);

export default function Updater(): any {
  const { account, chainId, library } = useUserWallet();
  const multicall = useMulticall();
  const dispatch = useDispatch();
  const symbols = useSelector(selectObservedTokens);
  const lastUpdated = useLastUpdated();
  const nativeToken = useNativeToken();

  useEffect(() => {
    if (!nativeToken?.symbol) {
      return;
    }
    if (!account || !chainId) {
      dispatch(
        balanceChanged({
          token: nativeToken?.symbol,
          amount: undefined,
        }),
      );
      return;
    }
    let mounted = true;
    library
      .getSigner(account)
      .getBalance()
      .then((res) => {
        if (mounted) {
          dispatch(
            balanceChanged({
              token: nativeToken?.symbol,
              amount: res.toString(),
            }),
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [account, dispatch, library, lastUpdated, nativeToken, chainId]);
  // to check if the list is realy changed
  const watchedTokenHashed = useMemo(() => {
    return sortBy(symbols).join(':');
  }, [symbols]);

  const watchedTokenHashedDebouced = useDebounce(watchedTokenHashed, 500);

  useEffect(() => {
    let tokens = watchedTokenHashedDebouced ? watchedTokenHashedDebouced.split(':') : [];
    tokens = tokens.filter((t) => isAddress(t)).map((t) => getAddress(t));

    if (!account || !multicall || !tokens || !tokens.length) {
      if (!account && tokens) {
        dispatch(
          dispatch(
            multipleTokenBalanceFetched(
              tokens,
              tokens.map(() => undefined),
            ),
          ),
        );
      }
      return;
    }

    const mounted = true;
    multicall(
      tokens.map((t) => {
        return {
          target: t,
          signature: 'balanceOf(address user) view returns (uint256)',
          params: [account],
        };
      }),
    )
      .then((response) => {
        if (mounted && response) {
          const balances = response.map((t) => t?.[0]?.toHexString());
          dispatch(multipleTokenBalanceFetched(tokens, balances));
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  }, [account, dispatch, multicall, lastUpdated, watchedTokenHashedDebouced, chainId]);

  return null;
}
