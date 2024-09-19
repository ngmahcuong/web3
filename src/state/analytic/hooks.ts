import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '..';
import { updatePoolsData } from './actions';
import { PoolData } from './reducer';

export const usePoolsData = (): [
  { data: PoolData[] | undefined; loading: boolean },
  (poolsData: PoolData[], loading: boolean) => void,
] => {
  const poolsData: { data: PoolData[]; loading: boolean } = useSelector(
    (state: AppState) => state.analytic.pools,
  );

  const dispatch = useDispatch<AppDispatch>();

  const setPoolsData: (poolsData: PoolData[], loading: boolean) => void = useCallback(
    (data: PoolData[], loading: boolean) =>
      dispatch(updatePoolsData({ poolsData: data, loading })),
    [dispatch],
  );

  return [poolsData, setPoolsData];
};
