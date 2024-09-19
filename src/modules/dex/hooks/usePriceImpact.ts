import { useCallback, useMemo } from 'react';
import { PRICE_IMPACT_HIGH, PRICE_IMPACT_VERY_HIGH } from '../../../utils/constants';

export type PriceImpactLevel = 'LOW' | 'HIGH' | 'VERY_HIGH';

export const usePriceImpact = (value?: number) => {
  const priceImpactLevel = useMemo((): PriceImpactLevel => {
    if (value < PRICE_IMPACT_VERY_HIGH) return 'VERY_HIGH';
    if (value < PRICE_IMPACT_HIGH) return 'HIGH';
    return 'LOW';
  }, [value]);

  const formatted = useMemo(() => {
    return value !== undefined ? `${Math.abs(value)}%` : `-`;
  }, [value]);

  return useMemo(() => {
    if (value === undefined)
      return {
        priceImpactLevel: undefined,
        formatted: undefined,
      };
    return {
      priceImpactLevel,
      formatted,
    };
  }, [formatted, priceImpactLevel, value]);
};

export const useConfirmSwapWithHighImpact = () => {
  return useCallback((priceImpact?: number) => {
    if (priceImpact === undefined) {
      return true;
    }
    if (priceImpact < PRICE_IMPACT_VERY_HIGH) {
      const confirmWord = 'confirm';
      return (
        // eslint-disable-next-line no-alert
        window.prompt(
          `This swap has a price impact of more than ${PRICE_IMPACT_VERY_HIGH?.toFixed(
            0,
          )}%. Please type the word "${confirmWord}" to continue with this swap.`,
        ) === confirmWord
      );
    } else {
      return true;
    }
  }, []);
};
