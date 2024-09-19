import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as IconBack } from '../../../../assets/icons/ic-back.svg';
import MarketLiquidityInfo from './components/MarketLiquidityInfo';
import MyMarketInfo from './components/MyMarketInfo';
import MarketInfo from './components/MarketInfo';
import { container, screenUp } from '../../../../utils/styles';
import { Button, ButtonOutline } from '../../../../components/Buttons';
import Spacer from '../../../../components/Spacer';
import ChartInterestRateModel from './components/ChartInterestRateModel';
import useInterestRateModelData from './hooks/useInterestRateModelData';
import ModalSupply from '../Lending/components/Modals/ModalSupply';
import ModalBorrow from '../Lending/components/Modals/ModalBorrow';
import useModal from '../../../../hooks/useModal';
import { ExplorerLink } from '../../../../components/ExplorerLink';
import { shortenAddress } from '../../../../utils/addresses';
import MetamaskLogo from '../../../../assets/images/wallets/Metamask.png';
import { useAddTokenMetamask } from '../../../../hooks/useAddTokenToMetamask';
import { useMarket } from '../../hooks/useLendingMarkets';
import { useTokenConfig } from '../../../../hooks/useTokenConfig';

const LendingMarketDetail: React.FC = () => {
  const { asset } = useParams<{ asset: string }>();
  const history = useHistory();
  const market = useMarket(asset?.toUpperCase());
  const utilizationApyStats = useInterestRateModelData(market?.asset);
  const shortAssetAddress = shortenAddress(market?.assetAddress, 8, 6);
  const addToken = useAddTokenMetamask();
  const tokenConfig = useTokenConfig(market?.asset);

  const [openBorrowModal] = useModal(
    <ModalBorrow asset={market?.asset} />,
    'lending-borrow-modal',
  );
  const [openSupplyModal] = useModal(
    <ModalSupply asset={market?.asset} />,
    'lending-deposit-modal',
  );

  const onAddToken = useCallback(() => {
    addToken(tokenConfig?.symbol, tokenConfig?.address, tokenConfig?.decimals);
  }, [addToken, tokenConfig]);

  const onGoBack = useCallback(() => {
    return history.replace('/lending/markets');
  }, [history]);

  return (
    <StyledContainer>
      <StyledBackButton onClick={onGoBack}>
        <IconBack />
        Back to Markets
      </StyledBackButton>
      <StyledHeader>
        <StyledMarketTitle>
          <StyledMarketName>
            <StyledMarketAssetSymbol>
              {market?.asset && <span>{market?.asset}</span>}
            </StyledMarketAssetSymbol>
            <StyledMarketAssetName>{market?.marketName}</StyledMarketAssetName>
          </StyledMarketName>
          {market?.asset !== 'ETH' && shortAssetAddress && (
            <>
              <StyledExplorerLink>
                <ExplorerLink address={market?.assetAddress}>
                  <i className="far fa-external-link"></i>
                </ExplorerLink>
              </StyledExplorerLink>
              <Spacer />
              <ButtonAdd onClick={onAddToken}>
                <img src={MetamaskLogo} alt="metamask" />
              </ButtonAdd>
            </>
          )}
        </StyledMarketTitle>
        <StyledButtons>
          {!market?.disableBorrow && (
            <ButtonOutline size="sm" onClick={openBorrowModal}>
              Borrow
            </ButtonOutline>
          )}
          <Spacer />
          {!market?.disableSupply && (
            <Button size="sm" onClick={openSupplyModal}>
              Supply
            </Button>
          )}
        </StyledButtons>
      </StyledHeader>
      <StyledContent>
        <div>
          <MarketLiquidityInfo />
          <MarketInfo />
          {!market?.disableSupply && !market?.disableBorrow ? (
            <StyleChartInterestRateModel>
              {utilizationApyStats.length ? (
                <ChartInterestRateModel data={utilizationApyStats} />
              ) : (
                <StyledChartLoading>
                  <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
                </StyledChartLoading>
              )}
            </StyleChartInterestRateModel>
          ) : null}
        </div>
        <MyMarketInfo />
      </StyledContent>
    </StyledContainer>
  );
};

const StyledChartLoading = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
  i {
    color: ${({ theme }) => theme.muted};
    font-size: 30px;
  }
`;

const StyleChartInterestRateModel = styled.div`
  padding: 15px 12px 15px 12px;
  background-color: ${(p) => p.theme.box.background};
  border: 1px solid ${(p) => p.theme.box.border};
  margin-bottom: 20px;
  .title {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    padding-bottom: 15px;
  }
  ${screenUp('lg')`
    margin-top: 25px;
    margin-bottom: 0px;
    padding: 16px 20px 20px 20px;
  `}
`;

const StyledContainer = styled.div`
  ${container};
  padding-top: 32px;
`;

const StyledBackButton = styled.button`
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 15px;
  padding: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray3};
  svg {
    width: 22px;
    margin-right: 10px;
    fill: ${({ theme }) => theme.gray3};
  }
  :hover {
    color: ${({ theme }) => theme.success};
    svg {
      fill: ${({ theme }) => theme.success};
    }
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-end;
  padding-top: 5px;
  padding-bottom: 20px;
`;

const StyledMarketTitle = styled.div`
  display: flex;
  align-items: flex-end;
`;
const StyledMarketName = styled.div``;

const StyledMarketAssetName = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1;
  ${screenUp('lg')`
    font-size: 24px;
  `}
`;

const StyledMarketAssetSymbol = styled.div`
  color: ${({ theme }) => theme.gray4};
  font-weight: 500;
  font-size: 14px;
`;

const StyledContent = styled.div`
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: 5fr 3fr;
    grid-gap: 25px;
  `}
`;

const StyledButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
`;

const StyledExplorerLink = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.success};
  i {
    margin-left: 8px;
    font-size: 14px;
  }
  :hover {
    text-decoration: underline;
  }
`;

const ButtonAdd = styled.a`
  display: flex;
  cursor: pointer;
  opacity: 0.8;
  img {
    width: 20px;
  }
  :hover {
    opacity: 1;
  }
`;

export default LendingMarketDetail;
