import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useContractRegistry from '../../../hooks/useContractRegistry';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useLastUpdated } from '../../../state/application/hooks';
import {
  fetchCompleted,
  fetchEnteredMarkets,
  reset,
  userLiquidityFetched,
  userMarketPositionFetched,
} from '../../../state/lending/actions';
import { IMarket } from '../types/interfaces/IMarket';

export const useUpdateLendingState = () => {
  const dispatch = useDispatch();
  const { account } = useUserWallet();
  const lastUpdate = useLastUpdated();

  const registry = useContractRegistry();

  const getUserMarketPosition = useCallback(
    async (account: string) => {
      return await Promise.all(
        registry.markets.map((market: IMarket) => {
          return market.userInfo(account);
        }),
      );
    },
    [registry],
  );

  useEffect(() => {
    if (!account || !registry || !registry.markets?.length) {
      dispatch(reset());
      return;
    }

    let mounted = true;
    Promise.all([getUserMarketPosition(account), registry.comptroller.userInfo(account)]).then(
      (res) => {
        if (!mounted) {
          return;
        }

        const [userMarket, { assetsIn, accountLiquidity }] = res;
        dispatch(userMarketPositionFetched(userMarket || []));
        dispatch(fetchEnteredMarkets({ markets: assetsIn }));
        dispatch(
          userLiquidityFetched({
            liquidity: accountLiquidity.liquidity.toString(),
            shortfall: accountLiquidity.shortfall.toString(),
          }),
        );
        dispatch(fetchCompleted());
      },
    );

    return () => {
      mounted = false;
    };
  }, [registry, account, getUserMarketPosition, dispatch, lastUpdate]);
};
