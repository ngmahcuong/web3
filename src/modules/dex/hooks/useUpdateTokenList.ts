import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useInterval from '../../../hooks/useInterval';
import { AppDispatch } from '../../../state';
import { acceptListUpdate, initLists } from '../../../state/dex/actions';
import { useAllLists } from '../../../state/dex/hooks';
import { useFetchListCallback } from './useFetchListCallback';

export const useUpdateTokenList = () => {
  const { library } = useWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  // get all loaded lists, and the active urls
  const lists = useAllLists();

  const fetchList = useFetchListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!lists) return;
    Object.keys(lists).forEach((url) =>
      fetchList(url).catch((error) => console.error('interval list fetching error', error)),
    );
  }, [fetchList, lists]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    lists &&
      Object.keys(lists).forEach((listUrl) => {
        const list = lists[listUrl];
        if (!list?.current && !list?.loadingRequestId && !list?.error) {
          fetchList(listUrl).catch((error) =>
            console.debug('list added fetching error', error),
          );
        }
      });
  }, [dispatch, fetchList, library, lists]);

  useEffect(() => {
    dispatch(initLists());
  }, [dispatch, library]);

  // automatically update lists if versions
  useEffect(() => {
    lists &&
      Object.keys(lists).forEach((listUrl) => {
        const list = lists[listUrl];
        if (list?.current && list?.pendingUpdate) {
          const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version);
          switch (bump) {
            case VersionUpgrade.NONE:
              break;
            case VersionUpgrade.PATCH:
            case VersionUpgrade.MINOR:
            case VersionUpgrade.MAJOR:
              dispatch(acceptListUpdate(listUrl));
          }
        }
      });
  }, [dispatch, lists]);
};
