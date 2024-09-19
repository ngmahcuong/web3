import { MaxUint256, Zero } from '@ethersproject/constants';
import { useEffect } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useErc20 } from '../../../hooks/useErc20';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useIsApprovalPending } from '../../../state/transactions/hooks';
import { allowanceChanged } from '../../../state/user/actions';
import { useAllowance } from '../../../state/user/hooks';
import { isAddress } from '../../../utils/addresses';
import { useUniswapToken } from '../../dex/hooks/useUniswapToken';

export const useDexApprove = (address: string, spender: string) => {
  const { account } = useUserWallet();
  const dispatch = useDispatch();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const token = useUniswapToken(address);
  const allowance = useAllowance(token?.symbol, address, spender);
  const [approveSubmitted, setApproveSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const isPending = useIsApprovalPending(address, spender);

  const tokenContract = useErc20(isAddress(address) || undefined);

  const isApproved = useMemo(() => {
    return allowance?.gt(Zero);
  }, [allowance]);

  const loading = useMemo(() => {
    return !allowance;
  }, [allowance]);

  useEffect(() => {
    if (address && spender) {
      setLoadingSubmit(false);
      setApproveSubmitted(false);
    }
  }, [address, spender]);

  const approve = useCallback(async () => {
    if (!tokenContract) {
      return;
    }
    const summary = `Approve ${token?.symbol}`;
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
            token: token?.wrapped.address,
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
  }, [
    tokenContract,
    token?.symbol,
    token?.wrapped.address,
    handleTransactionReceipt,
    spender,
    dispatch,
  ]);

  useEffect(() => {
    if (!tokenContract || !account || !spender) {
      return;
    }
    tokenContract?.allowance(account, spender).then((amount) => {
      dispatch(
        allowanceChanged({
          token: address,
          spender,
          amount: amount.toHexString(),
        }),
      );
    });
  }, [account, dispatch, address, spender, tokenContract]);

  return {
    approve,
    loading,
    loadingSubmit: isPending || loadingSubmit,
    isApproved,
    approveSubmitted,
  };
};
