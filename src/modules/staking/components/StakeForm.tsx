import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { Button } from '../../../components/Buttons';
import { TokenInputWithMaxButton } from '../../../components/TokenInput';
import { useApprove } from '../../../hooks/useApprove';
import { useModalConnectWallet } from '../../../hooks/useConnectWallet';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useTokenBalance, useWatchTokenBalance } from '../../../state/user/hooks';
import { useStaking } from '../hooks/useStaking';
import { TransactionResponse } from '@ethersproject/providers';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { formatBigNumber, safeParseUnits } from '../../../utils/numbers';
import {
  TransactionStatus,
  useGetTransactionStatus,
} from '../../../hooks/useGetTransactionStatus';
import { CurrencyThreshold, Precision, TokenThreshold } from '../../../utils/constants';
import { Zero } from '@ethersproject/constants';

const StakeForm: React.FC<{ stakedValue: BigNumber }> = ({ stakedValue }) => {
  const { active, account } = useUserWallet();
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const token = useTokenConfig('CHAI');
  const watchTokens = useWatchTokenBalance();
  const [connect] = useModalConnectWallet();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const getTransactionStatus = useGetTransactionStatus();
  const balance = useTokenBalance(token.symbol);
  const staking = useStaking();
  const rewardPrice = useMemo(() => {
    return safeParseUnits('1000', 18);
  }, []);
  const { approve, isApproved, loadingSubmit } = useApprove(token.symbol, staking.address);

  const onClickBalance = useCallback(() => {
    setAmount(balance);
  }, [balance]);

  const totalStaked = useMemo(() => {
    if (stakedValue && amount) return stakedValue?.add(amount);
    return amount || Zero;
  }, [amount, stakedValue]);

  const createTransaction = useCallback(async () => {
    return (await staking.deposit(amount)) as TransactionResponse;
  }, [amount, staking]);

  const onDeposit = useCallback(async () => {
    if (!token || !amount || !account) {
      return;
    }
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Deposit ${formatBigNumber(
          amount,
          token?.decimals,
          {
            fractionDigits: 3,
          },
          TokenThreshold.DEFAULT,
        )} ${token?.name}`,
        createTransaction,
      );
      if (tx) {
        await tx.wait();
        const txStatus = await getTransactionStatus(tx.hash);

        if (txStatus.status === TransactionStatus.SUCCESS) {
          setLoading(false);
          setAmount(undefined);
        } else if (txStatus.status === TransactionStatus.ERROR) {
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    account,
    amount,
    createTransaction,
    getTransactionStatus,
    handleTransactionReceipt,
    token,
  ]);

  useEffect(() => {
    watchTokens([token.address]);
  }, [token?.address, watchTokens, account]);

  return (
    <StyledStakeForm>
      <StyledInputWrapper>
        <StyledInputHeader>
          Stake {token?.symbol}
          <div className="balance">
            Stake able:
            <button onClick={onClickBalance}>
              <BigNumberValue value={balance} decimals={18} fractionDigits={4} />
            </button>
            <span>CHAI</span>
          </div>
        </StyledInputHeader>
        <TokenInputWithMaxButton
          maxValue={balance}
          decimals={token?.decimals}
          value={amount}
          symbol={token?.symbol}
          onChange={setAmount}
          size="lg"
          subValue={
            amount && rewardPrice
              ? `${formatBigNumber(
                  amount.mul(rewardPrice).div(Precision),
                  18,
                  {
                    fractionDigits: 2,
                    currency: 'USD',
                    compact: false,
                  },
                  CurrencyThreshold,
                )}`
              : '$0'
          }
        />
      </StyledInputWrapper>

      <StyledStakeInfo>
        <StyledRowInfo>
          <div className="title">Token Price</div>
          <div className="value">
            {' '}
            <BigNumberValue
              value={rewardPrice}
              decimals={token?.decimals}
              fractionDigits={3}
              currency={'USD'}
            />
          </div>
        </StyledRowInfo>
        <StyledRowInfo>
          <div className="title">Total Stake</div>
          {totalStaked ? (
            <div className="value">
              <BigNumberValue
                value={totalStaked}
                decimals={token?.decimals}
                fractionDigits={3}
              />{' '}
              {token?.symbol}
            </div>
          ) : (
            '-'
          )}
        </StyledRowInfo>

        <StyledButtonWrapper>
          {active ? (
            <>
              {!isApproved && (
                <Button
                  size="lg"
                  block
                  disabled={isApproved || loadingSubmit}
                  onClick={approve}
                  isLoading={loadingSubmit}
                >
                  Approved to continue
                </Button>
              )}
              <Button
                size="lg"
                block
                onClick={onDeposit}
                disabled={
                  !isApproved || loading || amount?.gt(balance) || amount?.eq(Zero) || !amount
                }
                isLoading={loading}
              >
                {amount?.gt(balance) ? 'Insufficient Balance' : `Stake ${token?.symbol}`}
              </Button>
            </>
          ) : (
            <Button size="lg" block onClick={connect}>
              Connect wallet
            </Button>
          )}
        </StyledButtonWrapper>
      </StyledStakeInfo>
    </StyledStakeForm>
  );
};

export default StakeForm;

const StyledStakeForm = styled.div`
  border: solid 1px ${(p) => p.theme.box.border};
  background-color: ${(p) => p.theme.card.body};
  margin-bottom: 14px;
`;

const StyledInputWrapper = styled.div`
  padding: 20px;
  background-color: ${(p) => p.theme.card.secondary};
`;

const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.text.primary};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.text.primary};
    }
  }
`;

const StyledRowInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    font-size: 14px;
    color: ${(p) => p.theme.text.muted};
  }
  .value {
    font-size: 16px;
  }

  margin-bottom: 14px;
`;

const StyledStakeInfo = styled.div`
  padding: 20px;
`;

const StyledButtonWrapper = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 23px;
`;
