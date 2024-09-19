import React from 'react';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import {
  StyledColumn,
  StyledValue,
  StyledSubValue,
  StyledAprContainer,
} from '../../../components/MarketItemShared';
import { Button } from '../../../../../components/Buttons';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
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
} from './MarketRowShare';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import ModalRepay from './Modals/ModalRepay';
import useModal from '../../../../../hooks/useModal';
import { useMarket } from '../../../hooks/useLendingMarkets';
import { useLendingUserInfoPosition } from '../../../hooks/useUserLendingHook';

type MyBorrowItemProps = {
  asset: string;
};

const MyBorrowItem: React.FC<MyBorrowItemProps> = ({ asset }) => {
  const market = useMarket(asset);
  const { borrowing } = useLendingUserInfoPosition(market?.asset);
  const [openRepayModal] = useModal(<ModalRepay asset={asset} />, 'lending-repay-modal');

  return (
    <CustomStyledContainer>
      <StyledAsset>
        <TokenSymbol symbol={`${market?.asset}`} size={36} />
        <StyledSymbolLink to={`lending/market/${market?.asset?.toLowerCase()}`}>
          {market?.asset}
        </StyledSymbolLink>
      </StyledAsset>
      <StyledColumn>
        <StyledRow>
          <StyledTitle>Borrow:</StyledTitle>
          <StyledValue>
            <BigNumberValue
              value={borrowing}
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
              value={borrowing?.mul(market?.underlyingPrice).div(Precision)}
              decimals={18}
              currency="USD"
              threshold={CurrencyThreshold}
            />
          </StyledSubValue>
        </StyledRowNoMargin>
      </StyledColumn>
      <StyledColumn>
        <StyledRow>
          <StyledTitle>Borrow APY</StyledTitle>
          <StyledValue variant="success">
            <StyledAprContainer>
              <div>
                <StyledValue variant="warning">
                  <BigNumberValue
                    value={market?.borrowRatePerYear}
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
                    value={market?.borrowDistributionApy | 0}
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
      <StyledActions>
        <Button size="sm" onClick={openRepayModal}>
          Repay
        </Button>
      </StyledActions>
    </CustomStyledContainer>
  );
};

const CustomStyledContainer = styled(StyledContainer)`
  padding: 0 0 15px 0;
  ${screenUp('lg')`
    padding: 14px 16px;
    grid-template-columns: 5fr 4fr 4fr 5fr;
  `}
`;

export default MyBorrowItem;
