import styled from 'styled-components';
import { ButtonOutline } from '../../../components/Buttons';
import { ReactComponent as Firer } from '../../../assets/icons/ic-firer.svg';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { BigNumber } from 'ethers';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import useModal from '../../../hooks/useModal';
import BoostCaculatorModal from './Modals/BoostCaculatorModal';
import { useMemo } from 'react';

const StakeBoost: React.FC<{
  stakedValue: BigNumber;
  minedValue: BigNumber;
  rate: BigNumber;
  totalSupply: BigNumber;
}> = ({ stakedValue, minedValue, rate, totalSupply }) => {
  const veChaitoken = useTokenConfig('VECHAI');
  const token = useTokenConfig('CHAI');

  const modal = useMemo(() => {
    return <BoostCaculatorModal totalSupply={totalSupply} minedValue={minedValue} />;
  }, [totalSupply, minedValue]);
  const [openBoostCaculatorModal] = useModal(modal, 'boost-caculator-modal');

  return (
    <StyledBoostCard>
      <div className="header">
        <div className="title">Stake {token.symbol} to Boost Yield</div>
        <StyledClaimButton size="sm" onClick={openBoostCaculatorModal}>
          <Firer /> Boost Calculator
        </StyledClaimButton>
      </div>

      <div className="content">
        <StyledRowInfo>
          <div className="title">Staked {token.symbol}</div>
          <div className="value">
            <span>
              <BigNumberValue value={stakedValue} decimals={18} fractionDigits={3} />
            </span>{' '}
            {token.symbol}
          </div>
        </StyledRowInfo>
        <StyledRowInfo>
          <div className="title">{veChaitoken.name} Mine Rate</div>
          <div className="value">
            <span>
              <BigNumberValue
                value={rate}
                decimals={veChaitoken?.decimals}
                fractionDigits={3}
              />
            </span>{' '}
            {veChaitoken.name} / hour
          </div>
        </StyledRowInfo>
        <StyledRowInfo>
          <div className="title">{veChaitoken.name} Mined</div>
          <div className="value">
            <span>
              <BigNumberValue value={minedValue} decimals={18} fractionDigits={7} />
            </span>{' '}
            {veChaitoken.name}
          </div>
        </StyledRowInfo>
      </div>
    </StyledBoostCard>
  );
};

export default StakeBoost;

const StyledClaimButton = styled(ButtonOutline)`
  display: inline-flex;
  gap: 4px;
  border: solid 1px ${(p) => p.theme.success};
  color: ${(p) => p.theme.success};
  svg {
    path {
      fill: ${(p) => p.theme.success};
    }
  }
  &:hover {
    svg {
      path {
        fill: ${(p) => p.theme.white};
      }
    }
  }
`;

const StyledBoostCard = styled.div`
  padding: 21px;
  background-color: ${(p) => p.theme.card.body};
  border: solid 1px ${(p) => p.theme.card.border};
  margin-bottom: 1rem;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    .title {
      font-weight: 500;
      font-size: 20px;
    }
  }

  .content {
    padding: 1rem;
    background-color: ${(p) => p.theme.card.secondary};
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const StyledRowInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 16px;
    font-weight: 400;
    color: ${(p) => p.theme.text.muted};
  }
  .value {
    span {
      font-weight: 500;
    }
  }
`;
