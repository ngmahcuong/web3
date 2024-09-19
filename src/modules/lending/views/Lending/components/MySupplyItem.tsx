import React, { useMemo } from 'react';
import { useCallback } from 'react';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import {
  StyledColumn,
  StyledValue,
  StyledSubValue,
  StyledAprContainer,
} from '../../../components/MarketItemShared';
import { Button } from '../../../../../components/Buttons';
import { Toggle } from '../../../../../components/Toggle';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import {
  CurrencyThreshold,
  PercentageThreshold,
  Precision,
  TokenThreshold,
} from '../../../../../utils/constants';
import {
  StyledActions,
  StyledAsset,
  StyledContainer,
  StyledRow,
  StyledRowNoMargin,
  StyledSymbolLink,
  StyledTitle,
  StyledToggle,
} from './MarketRowShare';
import ModalWithdraw from './Modals/ModalWithdraw';
import useModal from '../../../../../hooks/useModal';
import ModalEnableCollateral from './Modals/ModalEnableCollateral';
import ModalDisableCollateral from './Modals/ModalDisableCollateral';
import { useMarket } from '../../../hooks/useLendingMarkets';
import {
  useIsEnteredMarket,
  useLendingUserInfoPosition,
} from '../../../hooks/useUserLendingHook';
import { Zero } from '@ethersproject/constants';

type MySupplyItemProps = {
  asset: string;
};

const MySupplyItem: React.FC<MySupplyItemProps> = ({ asset }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const { supplying } = useLendingUserInfoPosition(market?.asset);
  const isCollateralEnabled = useIsEnteredMarket(market?.marketAddress);
  const [openWithdrawModal] = useModal(
    <ModalWithdraw asset={asset} />,
    'lending-withdraw-modal',
  );
  const [openEnableModal] = useModal(
    <ModalEnableCollateral asset={asset} />,
    'lending-enable-modal',
  );

  const [openDisableModal] = useModal(
    <ModalDisableCollateral asset={asset} />,
    'lending-disable-modal',
  );

  const displayValue = useMemo(() => {
    return supplying?.mul(market?.exchangeRate).div(Precision);
  }, [market?.exchangeRate, supplying]);

  const hideCollateral = useMemo(() => {
    return !market || market.collateralFactor.eq(Zero);
  }, [market]);

  const onClickToggle = useCallback(() => {
    if (isCollateralEnabled) {
      return openDisableModal();
    }
    return openEnableModal();
  }, [isCollateralEnabled, openDisableModal, openEnableModal]);

  return (
    <StyledContainer>
      <StyledAsset>
        <TokenSymbol symbol={`${market?.asset}`} size={36} />
        <StyledSymbolLink to={`lending/market/${market?.asset?.toLowerCase()}`}>
          {market?.asset}
        </StyledSymbolLink>
      </StyledAsset>
      <StyledColumn>
        <StyledRow>
          <StyledTitle>Supplying</StyledTitle>
          <StyledValue>
            <BigNumberValue
              value={displayValue}
              fractionDigits={market?.significantDigits || 2}
              decimals={market?.assetDecimals}
              threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
            />
            <span>{market?.asset}</span>
          </StyledValue>
        </StyledRow>
        <StyledRowNoMargin>
          <StyledTitle></StyledTitle>
          <StyledSubValue>
            ~
            <BigNumberValue
              fractionDigits={2}
              value={displayValue?.mul(market?.underlyingPrice).div(Precision)}
              decimals={18}
              currency="USD"
              threshold={CurrencyThreshold}
            />
          </StyledSubValue>
        </StyledRowNoMargin>
      </StyledColumn>
      <StyledColumn>
        <StyledRow>
          <StyledTitle>Supply APY</StyledTitle>
          <StyledValue variant="success">
            <StyledAprContainer>
              <div>
                <StyledValue variant="success">
                  <BigNumberValue
                    value={market?.supplyRatePerYear}
                    decimals={18}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                </StyledValue>
              </div>
              {/* <StyledValue>
                <StyledApr>
                  <TokenSymbol symbol={rewardSymbol} size={15} />
                  <FormatNumber
                    value={market?.supplyDistributionApy || 0}
                    percentage
                    fractionDigits={2}
                    threshold={PercentageThreshold}
                  />
                  &nbsp;APY
                </StyledApr>
              </StyledValue> */}
            </StyledAprContainer>
          </StyledValue>
        </StyledRow>
      </StyledColumn>
      <StyledToggle>
        <StyledRow>
          {!hideCollateral && <StyledTitle>Collateral</StyledTitle>}
          {hideCollateral ? (
            <StyledSubValue></StyledSubValue>
          ) : (
            <Toggle onClick={onClickToggle} disabled={!account} checked={isCollateralEnabled} />
          )}
        </StyledRow>
      </StyledToggle>
      <StyledActions>
        <Button size="sm" onClick={openWithdrawModal}>
          Withdraw
        </Button>
      </StyledActions>
    </StyledContainer>
  );
};

export default MySupplyItem;
