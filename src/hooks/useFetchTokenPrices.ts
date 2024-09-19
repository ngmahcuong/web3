import { parseUnits } from '@ethersproject/units';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMultiplePrice } from '../state/tokens/actions';

export const useFetchTokenPrices = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      fetchMultiplePrice({
        CHAI: parseUnits('1', 18).toString(),
      }),
    );
  }, [dispatch]);
};
