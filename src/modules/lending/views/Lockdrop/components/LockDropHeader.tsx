import { BigNumber } from 'ethers';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import {
  PageHeaderMetaInfo,
  StyledHeaderNavSwitch,
  StyledSwitchItem,
} from '../../../../../components/PageHeaderContainer';
import iconWheel from '../../../../../assets/icons/ic-wheel.svg';
import iconLock from '../../../../../assets/icons/ic-lock-o.svg';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { screenUp } from '../../../../../utils/styles';

const LockDropHeader: React.FC<{
  totalValue: BigNumber;
  totalValueMine: BigNumber;
  isYourTab: boolean;
  isLoading: boolean;
}> = ({ totalValue, totalValueMine, isYourTab, isLoading }) => {
  const { active } = useUserWallet();
  return (
    <>
      <StyledHeaderNavSwitch>
        <StyledSwitchItem to="/lockdrop" isActive={() => !isYourTab}>
          All Lockdrop
        </StyledSwitchItem>
        <StyledSwitchItem to="/lockdrop?filter=your" isActive={() => isYourTab}>
          Your Lockdrop
        </StyledSwitchItem>
      </StyledHeaderNavSwitch>

      <StyledInfoWrapper>
        <PageHeaderMetaInfo>
          <img src={iconWheel} alt="wheel" />
          <div className="info">
            <div className="title">Total value lockdrop</div>
            <span className="value">
              {!isLoading ? (
                <BigNumberValue
                  value={totalValue}
                  decimals={54}
                  fractionDigits={10}
                  currency="USD"
                />
              ) : (
                <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
              )}
            </span>
          </div>
        </PageHeaderMetaInfo>

        {active && (
          <PageHeaderMetaInfo>
            <img src={iconLock} alt="wheel" />
            <div className="info">
              <div className="title"> Your lockdrop</div>
              <span className="value">
                {!isLoading ? (
                  <BigNumberValue
                    value={totalValueMine}
                    decimals={54}
                    fractionDigits={10}
                    currency="USD"
                  />
                ) : (
                  <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
                )}
              </span>
            </div>
          </PageHeaderMetaInfo>
        )}
      </StyledInfoWrapper>
    </>
  );
};

const StyledInfoWrapper = styled.div`
  display: flex;
  gap: 14px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 1.2rem 0;
  ${screenUp('lg')`
    margin: 0;
    flex-direction: row;
    width: fit-content;
    gap: 70px;
  `}
`;

export default LockDropHeader;
