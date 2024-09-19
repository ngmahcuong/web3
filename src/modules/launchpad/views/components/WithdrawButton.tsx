import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import React, { useCallback, useState } from 'react';
import { useHandleTransactionReceipt } from '../../../../hooks/useHandleTransactionReceipt';
import { TokenThreshold } from '../../../../utils/constants';
import { formatBigNumber } from '../../../../utils/numbers';
import { useLaunchpad } from '../../hooks/useLaunchpad';
import { StyledButton } from './Share';

export type WithdrawButtonProps = {
  index: number;
  paymentAmount: BigNumber;
  paymentToken: any;
};

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({ index, paymentAmount, paymentToken }) => {
  const launchpadContract = useLaunchpad(index);
  const [loading, setLoading] = useState(false);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const withdrawTransaction = useCallback(async () => {
    return (await launchpadContract.withdraw()) as TransactionResponse;
  }, [launchpadContract]);

  const onWithdraw = useCallback(async () => {
    if (!paymentAmount) {
      return;
    }
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Withdraw ${formatBigNumber(
          paymentAmount,
          paymentToken?.decimals,
          {
            fractionDigits: 3,
          },
          TokenThreshold[paymentToken?.symbol] || TokenThreshold.DEFAULT,
        )} ${paymentToken?.symbol}`,
        withdrawTransaction,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [paymentAmount, handleTransactionReceipt, paymentToken, withdrawTransaction]);

  return (
    <StyledButton
      size="md"
      isLoading={loading}
      disabled={loading}
      onClick={onWithdraw}
    >
      Withdraw
    </StyledButton>
  )
};
