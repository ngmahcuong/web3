import React from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import { useAllMarkets } from '../../../hooks/useLendingMarkets';
import MarketItem from './MarketItem';
import {
  StyledBox,
  StyledBoxContent,
  StyledBoxContentLoader,
  StyledBoxHeader,
} from './MarketsShare';

const Markets: React.FC = () => {
  const markets = useAllMarkets();

  return (
    <StyledContainer>
      <StyledBox>
        <CustomStyledBoxHeader>
          <span>Asset</span>
          <span>Total Supply</span>
          <span>Supply APY</span>
          <span>Total Borrow</span>
          <span>Borrow APY</span>
        </CustomStyledBoxHeader>
        <CustomStyledBoxContent>
          {!markets?.length ? (
            <CustomStyledBoxContentLoader>
              <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
            </CustomStyledBoxContentLoader>
          ) : (
            markets.map((market) => <MarketItem key={market?.asset} asset={market?.asset} />)
          )}
        </CustomStyledBoxContent>
      </StyledBox>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const CustomStyledBoxContent = styled(StyledBoxContent)`
  background-color: transparent;
  ${({ theme }) => screenUp('lg')`
      background-color: ${theme.box.itemBackground};
    `}
`;

const CustomStyledBoxHeader = styled(StyledBoxHeader)`
  ${screenUp('lg')`
    grid-template-columns:  5fr 4fr 4fr 4fr 4fr 80px;
  `}
`;

const CustomStyledBoxContentLoader = styled(StyledBoxContentLoader)`
  padding: 50px 0px 50px 0;
`;

export default Markets;
