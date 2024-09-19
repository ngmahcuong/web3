import { useEffect, useMemo, useState } from 'react';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { useUpdateLendingMarketsState } from '../../../hooks/useUpdateLendingMarketsState';
import { LockPoolInfo } from '../../../models/Lockdrop';
import useFetchLockdropPool from './useFetchLockdropPool';
import useFetchUserLockdropPool from './useFetchUserLockdropPool';

export const useLockDrop = () => {
  const { active } = useUserWallet();
  const { pools, isLoading: isAllPoolLoading } = useFetchLockdropPool();
  const { userPools, isLoading: isUserPoolLoading } = useFetchUserLockdropPool();
  useUpdateLendingMarketsState();
  const [poolsData, setPoolData] = useState<LockPoolInfo[]>([]);

  useEffect(() => {
    let poolsData: LockPoolInfo[] = [...pools];
    if (userPools?.length > 0) {
      poolsData = (pools as LockPoolInfo[]).map((x) => {
        return {
          ...x,
          depositedValue: userPools.find((y) => y.index === x.index).depositedValue,
        };
      });
    }
    setPoolData(poolsData);
  }, [pools, userPools]);

  const isLoading = useMemo(() => {
    return isAllPoolLoading || (isUserPoolLoading && active);
  }, [active, isAllPoolLoading, isUserPoolLoading]);

  return {
    poolsData,
    isLoading,
  };
};
