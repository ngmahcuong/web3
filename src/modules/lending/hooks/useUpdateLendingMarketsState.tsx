import { BigNumber } from 'ethers';
import { mapValues } from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useContractRegistry from '../../../hooks/useContractRegistry';
import { useLastUpdated } from '../../../state/application/hooks';
import { listMarket } from '../../../state/markets/actions';
import { IMarket } from '../types/interfaces/IMarket';
import { useGetLendingAssetBalance } from './useGetLendingAssetBalance';
export const useUpdateLendingMarketsState = () => {
  const dispatch = useDispatch();
  const lastUpdate = useLastUpdated();
  const contractRegistry = useContractRegistry();
  useGetLendingAssetBalance();

  useEffect(() => {
    if (!contractRegistry) {
      return;
    }
    let mounted = true;
    Promise.all(
      contractRegistry.markets.map((market: IMarket) => {
        return market.info();
      }),
    )
      .then((results) => {
        if (mounted) {
          dispatch(
            listMarket(
              results.map((t) => {
                return mapValues(t, (v) => {
                  if (BigNumber.isBigNumber(v)) {
                    return v.toString();
                  }
                  return v;
                }) as any;
              }),
            ),
          );
        }
      })
      .catch((error) => {
        console.warn('Get markets error', error);
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, lastUpdate, contractRegistry]);
};
