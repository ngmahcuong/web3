import PageHeaderContainer, {
  PageHeaderMetaInfo,
  StyledHeaderNavSwitch,
  StyledSwitchItem,
} from '../../../../../components/PageHeaderContainer';
import icVolume from '../../../../../assets/icons/ic-volume.svg';
import icLiquidity from '../../../../../assets/icons/ic_liquidity.svg';
import { formatNumber } from '../../../../../utils/numbers';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import { useProtocol } from '../../../hooks/useProtocol';

const Info: React.FC = () => {
  const protocol = useProtocol();

  return (
    <PageHeaderContainer reverse>
      <StyledHeaderNavSwitch>
        <StyledSwitchItem to="/pools" exact>
          All Pools
        </StyledSwitchItem>
        <StyledSwitchItem to="/pools/my-pools">My Pools</StyledSwitchItem>
      </StyledHeaderNavSwitch>
      <StyledVolumeContainer>
        <PageHeaderMetaInfo>
          <img src={icLiquidity} alt="total-liquidity" />
          <div className="info">
            <div className="title">Total Liquidity</div>
            <span className="value">
              {protocol ? (
                formatNumber(protocol?.liquidityUSD, {
                  currency: 'USD',
                  fractionDigits: 0,
                  thousandGrouping: false,
                  compact: false,
                })
              ) : (
                <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
              )}
            </span>
          </div>
        </PageHeaderMetaInfo>
        <PageHeaderMetaInfo>
          <img src={icVolume} alt="trading-volume" />
          <div className="info">
            <div className="title">Total Trading Volume</div>
            <span className="value">
              {protocol ? (
                formatNumber(protocol?.totalVolumeUSD, {
                  currency: 'USD',
                  fractionDigits: 0,
                  thousandGrouping: false,
                  compact: false,
                })
              ) : (
                <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
              )}
            </span>
          </div>
        </PageHeaderMetaInfo>
      </StyledVolumeContainer>
    </PageHeaderContainer>
  );
};

export default Info;

const StyledVolumeContainer = styled.div`
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
    grid-column-gap: 70px;
  `}
`;
