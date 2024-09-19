import styled from 'styled-components';
import { useProtocol } from '../../../hooks/useProtocol';
import icVolume from '../../../../../assets/icons/ic-volume.svg';
import icVolume24 from '../../../../../assets/icons/ic-volume-24.svg';
import icOrder from '../../../../../assets/icons/ic-order.svg';
import icOrder24 from '../../../../../assets/icons/ic-order-24.svg';
import { formatNumber } from '../../../../../utils/numbers';
import PageHeaderContainer, {
  PageHeaderMetaInfo,
  StyledHeaderNavSwitch,
  StyledSwitchItem,
} from '../../../../../components/PageHeaderContainer';
import { screenUp } from '../../../../../utils/styles';
import { Route, Switch } from 'react-router-dom';

const Info: React.FC = () => {
  const protocol = useProtocol();
  return (
    <PageHeaderContainer reverse>
      <StyledHeaderNavSwitch>
        <StyledSwitchItem to="/swap" exact>
          Swap
        </StyledSwitchItem>
        <StyledSwitchItem to="/swap/limit-orders">Limit Order</StyledSwitchItem>
      </StyledHeaderNavSwitch>
      <Switch>
        <Route exact path={'/swap'}>
          <StyledVolumeContainer>
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
            <PageHeaderMetaInfo>
              <img src={icVolume24} alt="trading-volume-24" />
              <div className="info">
                <div className="title">24h Trading Volume</div>
                <span className="value">
                  {protocol ? (
                    formatNumber(protocol?.volumeUSD, {
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
        </Route>
        <Route path="/swap/limit-orders" exact>
          <StyledVolumeContainer>
            <PageHeaderMetaInfo>
              <img src={icOrder} alt="total-order" />
              <div className="info">
                <div className="title">Total Number of Orders</div>
                <span className="value">
                  {protocol ? (
                    formatNumber(protocol?.orderCount, {
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
              <img src={icOrder24} alt="total-order-24" />
              <div className="info">
                <div className="title">Number of Orders in 24h</div>
                <span className="value">
                  {protocol ? (
                    formatNumber(protocol?.orderCount24, {
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
        </Route>
      </Switch>
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
