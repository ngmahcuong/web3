import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../../../../../components/Buttons';
import { getTokenByAddress } from '../../../../../config';
import { useHandleTransactionReceipt } from '../../../../../hooks/useHandleTransactionReceipt';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { TokenThreshold } from '../../../../../utils/constants';
import { formatBigNumber } from '../../../../../utils/numbers';
import { useLockdrop } from '../../../hooks/useLockdrop';
import { useLockDropMarketAsset } from '../hooks/useLockDropMarketAsset';

interface LockdropButtonWithdrawAllProps {
  poolId: number;
  balance: BigNumber;
  tokenAddress: string;
}

const LockdropButtonWithdrawAll: React.FC<LockdropButtonWithdrawAllProps> = ({
  poolId,
  balance,
  tokenAddress,
}) => {
  const { account } = useUserWallet();
  const { chainId } = useWeb3React();
  const token = getTokenByAddress(chainId, tokenAddress);
  const { market } = useLockDropMarketAsset(tokenAddress);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const lockDrop = useLockdrop();

  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    return loading || !account || !balance || balance?.eq(Zero);
  }, [account, balance, loading]);

  const createTransaction = useCallback(async () => {
    return (await lockDrop.withdraw(poolId, account)) as TransactionResponse;
  }, [account, lockDrop, poolId]);

  const onWithdraw = useCallback(async () => {
    if (!tokenAddress || !balance || !token) {
      return;
    }
    setLoading(true);

    try {
      const tx = await handleTransactionReceipt(
        `Withdraw ${formatBigNumber(
          balance,
          token?.decimals,
          {
            fractionDigits: market?.significantDigits || 3,
          },
          TokenThreshold[market?.asset] || TokenThreshold.DEFAULT,
        )} ${token?.name}`,
        createTransaction,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [tokenAddress, balance, handleTransactionReceipt, token, market, createTransaction]);

  return (
    <Button isLoading={loading} size="sm" disabled={disabled} onClick={onWithdraw}>
      Withdraw
    </Button>
  );
};

export default LockdropButtonWithdrawAll;
