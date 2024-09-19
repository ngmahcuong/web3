import { useCallback, useMemo } from 'react';
import {
  addPopup,
  PopupContent,
  removePopup,
  setSlippageTolerance,
  setTransactionDeadline,
  toggleMainNav,
  toggleTheme,
  updateAppData,
  toggleShowZeroBalance,
} from './actions';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, AppState } from '../index';
import { useWeb3React } from '@web3-react/core';
import { parseUnits } from '@ethersproject/units';
import useDebounce from '../../hooks/useDebounce';

export function useBlockNumber(): number | undefined {
  const { chainId } = useWeb3React();
  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1]);
}

export function useIsDarkTheme(): boolean {
  return useSelector((t: AppState) => t.application.theme) === 'light';
}

export const useLastUpdated = () => {
  const { chainId } = useWeb3React();
  const lastUpdated = useSelector(
    (state: AppState) => state.application.lastUpdated[chainId ?? -1],
  );
  return useDebounce(lastUpdated, 100);
};

export const useUpdateAppData = () => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch();
  return useCallback(() => {
    if (!chainId) {
      return;
    }
    dispatch(updateAppData(Date.now(), chainId));
  }, [chainId, dispatch]);
};

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  key?: string,
  waiting?: boolean,
) => void {
  const dispatch = useDispatch();

  return useCallback(
    (content: PopupContent, key?: string, waiting?: boolean) => {
      const removeAfterMs = content.type === 'waiting' || waiting ? null : 8e3;
      dispatch(addPopup({ content, key, removeAfterMs }));
    },
    [dispatch],
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch],
  );
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList);
  return useMemo(() => list.filter((item) => item.show), [list]);
}

export function useSetSlippageTolerance(): (slippage: number) => void {
  const dispatch = useDispatch();
  return useCallback(
    (slippage: number) => {
      dispatch(setSlippageTolerance({ slippage }));
    },
    [dispatch],
  );
}
export function useSetTransactionDeadline(): (deadline: number) => void {
  const dispatch = useDispatch();
  return useCallback(
    (deadline: number) => {
      dispatch(setTransactionDeadline({ deadline }));
    },
    [dispatch],
  );
}

export function useGetSlippageTolerance(): number {
  const slippage = useSelector((state: AppState) => state.application.slippageTolerance);
  return slippage;
}

export function useGetTransactionDeadline(): number {
  const transactionDeadline = useSelector(
    (state: AppState) => state.application.transactionDeadline,
  );
  return transactionDeadline;
}

export function useTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>();
  const transactionDeadline = useSelector<
    AppState,
    AppState['application']['transactionDeadline']
  >((state) => {
    return state.application.transactionDeadline;
  });

  const setDeadline = useCallback(
    (deadline: number) => {
      dispatch(setTransactionDeadline({ deadline }));
    },
    [dispatch],
  );

  return [transactionDeadline, setDeadline];
}

export const useTransactionSettings = () => {
  const appState = useSelector((t: AppState) => t.application);
  return useMemo(() => {
    return {
      slippageTolerance: appState.slippageTolerance,
      transactionDeadline: appState.transactionDeadline,
    };
  }, [appState?.slippageTolerance, appState?.transactionDeadline]);
};

export const useGetDeadline = () => {
  const deadline = useSelector((state: AppState) => state.application.transactionDeadline);
  return useCallback(() => {
    return Math.floor(Date.now() / 1000) + deadline * 60;
  }, [deadline]);
};

export const useGetSlippagePrecise = () => {
  const slippage = useSelector((s: AppState) => s.application.slippageTolerance);

  return useMemo(() => {
    return parseUnits(slippage.toFixed(10), 10);
  }, [slippage]);
};

export const useTrasactionSettings = () => {
  const appState = useSelector((t: AppState) => t.application);
  return useMemo(() => {
    return {
      slippageTolerance: appState.slippageTolerance,
      transactionDeadline: appState.transactionDeadline,
    };
  }, [appState?.slippageTolerance, appState?.transactionDeadline]);
};
export const useIsMainNavOpen = () => {
  return useSelector<AppState, boolean>((s) => s.application.mainNavOpen);
};

export const useToggleMainNav = () => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(toggleMainNav({ isOpen: null }));
  }, [dispatch]);
};

export const useSetMainNavOpen = () => {
  const dispatch = useDispatch();
  return useCallback(
    (isOpen: boolean) => {
      dispatch(toggleMainNav({ isOpen }));
    },
    [dispatch],
  );
};

export const useToggleTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((s: AppState) => s.application.theme);
  const toggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return [theme, toggle] as const;
};

export const useToggleShowZeroBalance = () => {
  const dispatch = useDispatch();
  const showZeroBalance = useSelector((s: AppState) => s.application.showZeroBalance);
  const toggle = useCallback(() => {
    dispatch(toggleShowZeroBalance());
  }, [dispatch]);

  return useMemo(() => {
    return {
      showZeroBalance,
      toggle,
    };
  }, [showZeroBalance, toggle]);
};
