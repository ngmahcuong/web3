import { nanoid } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import getTokenList from '../utils/fetchTokenList';
import { TokenList } from '@uniswap/token-lists';
import { AppDispatch } from '../../../state';
import { fetchTokenList } from '../../../state/dex/actions';

export function useFetchListCallback(): (
  listUrl: string,
  sendDispatch?: boolean,
) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>();

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid();
      sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      return getTokenList(listUrl)
        .then((tokenList) => {
          sendDispatch &&
            dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }));
          return tokenList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          sendDispatch &&
            dispatch(
              fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }),
            );
          throw error;
        });
    },
    [dispatch],
  );
}
