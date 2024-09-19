import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { Button } from '../../../components/Buttons';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { getStakingConfig } from '../../../config';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { TokenThreshold } from '../../../utils/constants';
import { formatBigNumber } from '../../../utils/numbers';
import { useStaking } from '../hooks/useStaking';

const ClaimForm: React.FC<{ claimableValue: BigNumber }> = ({ claimableValue }) => {
  const { account } = useUserWallet();
  const { chainId } = useWeb3React();

  const stakingConfig = getStakingConfig(chainId);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const staking = useStaking();
  const veChaiToken = useTokenConfig(stakingConfig?.veToken);
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    return loading || !account || !claimableValue || !claimableValue?.gt(Zero);
  }, [account, claimableValue, loading]);

  const createTransaction = useCallback(async () => {
    return (await staking.claim()) as TransactionResponse;
  }, [staking]);

  const onClaim = useCallback(async () => {
    if (!claimableValue || !veChaiToken || !account) {
      return;
    }
    setLoading(true);

    try {
      const tx = await handleTransactionReceipt(
        `Claim ${formatBigNumber(
          claimableValue,
          veChaiToken?.decimals,
          {
            fractionDigits: 3,
          },
          TokenThreshold.DEFAULT,
        )} ${veChaiToken?.name}`,
        createTransaction,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [claimableValue, veChaiToken, account, handleTransactionReceipt, createTransaction]);

  return (
    <StyledClaimForm>
      <TokenSymbol symbol={veChaiToken.symbol} size={45} />
      <StyledClaimInfo>
        <div className="title">Claimable {veChaiToken.name}</div>
        <div className="value">
          <span>
            <BigNumberValue
              value={claimableValue}
              decimals={veChaiToken.decimals}
              fractionDigits={3}
            />
          </span>{' '}
          {veChaiToken.name}
        </div>
      </StyledClaimInfo>
      <StyledClaimButton disabled={disabled} size={'sm'} isLoading={loading} onClick={onClaim}>
        Claim
      </StyledClaimButton>
    </StyledClaimForm>
  );
};

export default ClaimForm;

const StyledClaimForm = styled.div`
  padding: 21px;
  background-color: ${(p) => p.theme.card.body};
  border: solid 1px ${(p) => p.theme.card.border};
  display: flex;
  gap: 12px;
  align-items: center;
`;

const StyledClaimInfo = styled.div`
  .title {
    font-size: 14px;
    color: ${(p) => p.theme.text.muted};
  }
  .value {
    color: ${(p) => p.theme.text.muted};
    font-size: 14px;
    span {
      color: ${({ theme }) => theme.text.primary};
      font-weight: 600;
      font-size: 16px;
      margin-right: 2px;
    }
  }
`;

const StyledClaimButton = styled(Button)`
  margin-left: auto;
`;
