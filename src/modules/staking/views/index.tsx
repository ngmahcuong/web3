import styled from 'styled-components';
import PageHeaderContainer from '../../../components/PageHeaderContainer';
import { screenUp } from '../../../utils/styles';
import ClaimForm from '../components/ClaimForm';
import StakeBoost from '../components/StakeBoost';
import StakeForm from '../components/StakeForm';
import iconBg from '../../../assets/images/bg-stake.svg';
import { TokenSymbol } from '../../../components/TokenSymbol';
import useFetchStakingInfo from '../hooks/useFetchStakingInfo';
import useFetchUserStakingInfo from '../hooks/useFetchUserStakingInfo';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import { useWeb3React } from '@web3-react/core';
import { getStakingConfig } from '../../../config';

const Staking: React.FC = () => {
  const { totalBalance, totalSupply, rate } = useFetchStakingInfo();
  const { stakedValue, minedValue, claimableValue } = useFetchUserStakingInfo();
  const { chainId } = useWeb3React();
  const stakingConfig = getStakingConfig(chainId);
  const token = useTokenConfig(stakingConfig?.wantToken);
  return (
    <>
      <PageHeaderContainer title={'Staking'} iconBg={iconBg}>
        <StyledTotal>
          <span className="label"> Total staked:</span>
          <TokenSymbol symbol={token?.symbol} size={24} />
          <span className="value">
            {totalBalance ? (
              <BigNumberValue value={totalBalance} decimals={18} fractionDigits={3} />
            ) : (
              <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
            )}
          </span>
          <span>{token?.symbol}</span>
        </StyledTotal>
      </PageHeaderContainer>
      <StakingContainer>
        <StakingLeft>
          <StakeBoost
            stakedValue={stakedValue}
            minedValue={minedValue}
            rate={rate}
            totalSupply={totalSupply}
          />
          <StyledStakingDescription>
            <div className="title">Stake Information</div>
            <div className="content">
              Stake CHAI into veCHAI to increase your CHAI rewards in 'Boost' Farms. When you
              claim veCHAI you will automatically apply a 'Boost APR'.'Boost APR' will be
              additional yield earned on top of 'CHAI APR' and 'Pool APR'.
              <br />
              The amount of veCHAI you have will determine your share of the boosted rewards. If
              you unstake any amount of CHAI from veCHAI you will lose all of your accrued
              veCHAI.
            </div>
          </StyledStakingDescription>
        </StakingLeft>
        <StakingRight>
          <StakeForm stakedValue={stakedValue}></StakeForm>
          <ClaimForm claimableValue={claimableValue}></ClaimForm>
        </StakingRight>
      </StakingContainer>
    </>
  );
};

export default Staking;

const StyledTotal = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  margin-top: 20px;
  .label {
    opacity: 0.6;
    font-weight: 400;
  }

  .value {
    font-size: 20px;
    font-weight: 600;
    i {
      font-size: 14px;
    }
  }
`;

const StakingContainer = styled.div`
  width: min(100vw - 2rem, 1198px);
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-top: 47px;

  ${screenUp('lg')`
    grid-template-columns: 1fr 1fr;
  `}
`;

const StakingLeft = styled.div``;

const StakingRight = styled.div``;

const StyledStakingDescription = styled.div`
  padding: 21px;
  background-color: ${(p) => p.theme.card.body};
  border: solid 1px ${(p) => p.theme.card.border};
  .title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .content {
    font-size: 14px;
    line-height: 1.5;
    color: ${(p) => p.theme.text.muted};
  }
`;
