import { createAction } from '@reduxjs/toolkit';
import { MarketState } from './reducer';

export const listMarket = createAction<MarketState[]>('market/list');
