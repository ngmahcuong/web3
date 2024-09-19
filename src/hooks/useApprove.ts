import { MaxUint256, Zero } from '@ethersproject/constants';
import { useEffect } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUserWallet } from '../providers/UserWalletProvider';
import { useIsApprovalPending } from '../state/transactions/hooks';
import { allowanceChanged } from '../state/user/actions';
import { useAllowance } from '../state/user/hooks';
import { useErc20 } from './useErc20';
import { useHandleTransactionReceipt } from './useHandleTransactionReceipt';
import { useTokenConfig } from './useTokenConfig';

export const useApprove = (symbol: string, spender: string) => {
  const { account } = useUserWallet();
  const dispatch = useDispatch();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const token = useTokenConfig(symbol);
  const allowance = useAllowance(token?.symbol, token?.address, spender);
  const [approveSubmitted, setApproveSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const isPending = useIsApprovalPending(token?.address, spender);

  const tokenContract = useErc20(token?.address);

  const isApproved = useMemo(() => {
    return allowance?.gt(Zero);
  }, [allowance]);

  const loading = useMemo(() => {
    return !allowance;
  }, [allowance]);

  const approve = useCallback(async () => {
    if (!tokenContract) {
      return;
    }
    const summary = `Approve ${token?.name}`;
    setLoadingSubmit(true);
    setApproveSubmitted(true);
    try {
      const tx = await handleTransactionReceipt(
        summary,
        () => tokenContract.approve(spender, MaxUint256),
        {
          approval: {
            token: tokenContract.address,
            spender,
          },
        },
      );
      if (tx) {
        await tx.wait();
        dispatch(
          allowanceChanged({
            token: token?.address,
            spender,
            amount: MaxUint256.toHexString(),
          }),
        );
        setLoadingSubmit(false);
      }
    } catch (error) {
      setApproveSubmitted(false);
      setLoadingSubmit(false);
    }
  }, [tokenContract, token?.name, token?.address, handleTransactionReceipt, spender, dispatch]);

  useEffect(() => {
    if (!tokenContract || !account || !spender) {
      return;
    }
    tokenContract?.allowance(account, spender).then((amount) => {
      dispatch(
        allowanceChanged({
          token: token?.address,
          spender,
          amount: amount.toHexString(),
        }),
      );
    });
  }, [account, dispatch, spender, symbol, token?.address, tokenContract]);

  return {
    approve,
    loading,
    loadingSubmit: isPending || loadingSubmit,
    isApproved,
    approveSubmitted,
  };
};
