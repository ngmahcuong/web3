import { Zero } from '@ethersproject/constants';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { useTokenBalance } from '../../../../../state/user/hooks';
import {
  LendingPrecision,
  Precision,
  SafeLimitPrecision,
  TokenThreshold,
} from '../../../../../utils/constants';
import { min } from '../../../../../utils/numbers';
import imgDisable from '../../../../../assets/images/lending-disable-supply.png';
import { screenUp } from '../../../../../utils/styles';
import useModal from '../../../../../hooks/useModal';
import ModalWithdraw from '../../Lending/components/Modals/ModalWithdraw';
import ModalRepay from '../../Lending/components/Modals/ModalRepay';
import { useMarket } from '../../../hooks/useLendingMarkets';
import {
  useIsEnteredMarket,
  useLendingUserInfoBalance,
  useLendingUserInfoPosition,
} from '../../../hooks/useUserLendingHook';

const MyMarketInfo: React.FC = () => {
  const { asset } = useParams<{ asset: string }>();
  const market = useMarket(asset?.toUpperCase());
  const balance = useTokenBalance(market?.assetAddress);
  const { supplying, borrowing } = useLendingUserInfoPosition(market?.asset);
  const { borrowLimit, borrowBalance } = useLendingUserInfoBalance();
  const isCollateralEnabled = useIsEnteredMarket(market?.marketAddress);
  const [openWithdrawModal] = useModal(
    <ModalWithdraw asset={market?.asset} />,
    'lending-withdraw-modal',
  );
  const [openRepayModal] = useModal(
    <ModalRepay asset={market?.asset} />,
    'lending-repay-modal',
  );
  const theme = useTheme();

  const suppliedUnderlying = useMemo(() => {
    return supplying?.mul(market?.exchangeRate).div(Precision);
  }, [market?.exchangeRate, supplying]);

  const availableToBorrow = useMemo(() => {
    if (!market?.underlyingPrice || !borrowLimit || !borrowBalance) {
      return Zero;
    }
    const safeMax = borrowLimit
      .mul(SafeLimitPrecision)
      .sub(borrowBalance.mul(LendingPrecision))
      .div(market?.underlyingPrice);

    if (safeMax.lte(0)) {
      return Zero;
    }

    return min(safeMax, market?.marketLiquidity);
  }, [borrowBalance, borrowLimit, market?.marketLiquidity, market?.underlyingPrice]);

  return (
    <StyledContainer>
      <StyledItemContainer>
        <StyledItemHeader>
          Your Supply
          {!market?.disableSupply && (
            <StyledButton onClick={openWithdrawModal}>Withdraw</StyledButton>
          )}
        </StyledItemHeader>
        {market?.disableSupply ? (
          <StyledNoData>
            <img src={imgDisable} alt="lending-disable" />
            <span>Supply is not available for this market</span>
          </StyledNoData>
        ) : (
          <StyledItemInfo>
            <StyledItemRow>
              Your wallet balance
              <span>
                <BigNumberValue
                  value={balance}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits || 2}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                />
                &nbsp;{market?.asset}
              </span>
            </StyledItemRow>
            <StyledItemRow>
              Your balance in market
              <span>
                <BigNumberValue
                  value={suppliedUnderlying}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits || 2}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                />
                &nbsp;{market?.asset}
              </span>
            </StyledItemRow>
            <StyledItemRow color={isCollateralEnabled ? theme.success : theme.warning}>
              Used as collateral
              <span>{isCollateralEnabled ? 'Yes' : 'No'}</span>
            </StyledItemRow>
          </StyledItemInfo>
        )}
      </StyledItemContainer>
      <StyledItemContainer>
        <StyledItemHeader>
          Your Borrow
          {!market?.disableBorrow && (
            <StyledButton onClick={openRepayModal}>Repay</StyledButton>
          )}
        </StyledItemHeader>
        {market?.disableBorrow ? (
          <StyledNoData>
            <img src={imgDisable} alt="lending-disable" />
            <span>Borrow is not available for this market</span>
          </StyledNoData>
        ) : (
          <StyledItemInfo>
            <StyledItemRow>
              Borrow Balance
              <span>
                <BigNumberValue
                  value={borrowing}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits || 2}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                />
                &nbsp;{market?.asset}
              </span>
            </StyledItemRow>
            <StyledItemRow>
              Available to Borrow
              <span>
                <BigNumberValue
                  value={availableToBorrow}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits || 2}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                />
                &nbsp;{market?.asset}
              </span>
            </StyledItemRow>
          </StyledItemInfo>
        )}
      </StyledItemContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const StyledNoData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 20px 0 20px;
  img {
    width: 55px;
  }
  span {
    padding-top: 8px;
    font-size: 14px;
    font-weight: normal;
    text-align: center;
    color: ${(p) => p.theme.muted};
  }
`;

const StyledItemContainer = styled.div`
  padding: 16px 12px 12px;
  background-color: ${(p) => p.theme.card.body};
  border: 1px solid ${(p) => p.theme.box.border};
  :not(:last-child) {
    margin-bottom: 20px;
  }
  ${screenUp('lg')`
    padding: 16px 20px 20px;
    :not(:last-child) {
      margin-bottom: 25px;
    }
  `}
`;

const StyledItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
`;

const StyledButton = styled.button`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.success};
  :hover {
    text-decoration: underline;
  }
`;

const StyledItemInfo = styled.div`
  padding: 15px;
  background-color: ${(p) => p.theme.box.innerBackground};
  /* background-color: ${(p) => p.theme.box.itemBackground}; */
  ${screenUp('lg')`
    padding: 18px;
  `}
`;

const StyledItemRow = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: normal;
  color: ${(p) => p.theme.muted};
  span {
    margin-left: auto;
    font-size: 14px;
    font-weight: normal;
    color: ${({ color, theme }) => (color ? color : theme.text.primary)};
  }
  :not(:last-child) {
    margin-bottom: 15px;
  }
`;

export default MyMarketInfo;
