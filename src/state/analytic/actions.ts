import { createAction } from '@reduxjs/toolkit';
import { PoolData } from './reducer';

export const updatePoolsData = createAction<{
  poolsData: PoolData[];
  loading: boolean;
}>('analytic/pool/updatePoolsData');
