import React, { useMemo } from 'react';
import styled from 'styled-components';
import { difference } from 'lodash';
import { screenUp } from '../../../../../utils/styles';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { CurrencyThreshold, PercentageThreshold } from '../../../../../utils/constants';
import imgBorrowLimitUsed from '../../../../../assets/images/lending-borrow-limit.png';
import MyBorrowItem from './MyBorrowItem';
import BorrowItem from './BorrowItem';
import {
  StyledAllMarkets,
  StyledBox,
  StyledBoxContent,
  StyledBoxHeader,
  StyledContainer,
  StyledInfo,
  StyledInfoItem,
  StyledMyMarkets,
  StyledTitle,
} from './MarketsShare';
import FormatNumber from '../../../../../components/FormatNumber';
import { useAllMarketIds } from '../../../hooks/useLendingMarkets';
import {
  useLendingUserInfo,
  useLendingUserInfoBalance,
} from '../../../hooks/useUserLendingHook';

const BorrowMarkets: React.FC = () => {
  const marketIds = useAllMarketIds();
  const user = useLendingUserInfo();
  const { borrowBalance, borrowLimitPercentage, borrowApy } = useLendingUserInfoBalance();

  const filtered = useMemo(() => {
    if (!user) {
      return {
        supplying: [],
        others: marketIds,
        all: marketIds,
      };
    }

    const supplying = Object.keys(user.supplying).filter((t) => user.borrowing[t].gt(0));

    return {
      supplying,
      others: difference(marketIds, supplying),
      all: marketIds,
    };
  }, [marketIds, user]);

  return (
    <StyledContainer>
      {filtered.supplying.length ? (
        <StyledMyMarkets>
          <StyledTitle>Your borrows</StyledTitle>
          <StyledInfo>
            <StyledInfoItem variant="warning">
              Borrow Balance:
              <span>
                <BigNumberValue
                  value={borrowBalance}
                  decimals={18}
                  currency="USD"
                  threshold={CurrencyThreshold}
                />
              </span>
            </StyledInfoItem>
            <StyledInfoItem>
              APY:
              <span>
                <FormatNumber
                  value={Math.abs(borrowApy)}
                  percentage
                  fractionDigits={3}
                  threshold={PercentageThreshold}
                />
              </span>
            </StyledInfoItem>
            <StyledInfoItem>
              <img src={imgBorrowLimitUsed} alt="icon-collateral" />
              Borrow Limit Used:
              <span>
                <BigNumberValue
                  value={borrowLimitPercentage}
                  decimals={18}
                  percentage
                  fractionDigits={2}
                  threshold={PercentageThreshold}
                />
              </span>
            </StyledInfoItem>
          </StyledInfo>
          <StyledBox>
            <CustomStyledBoxHeader>
              <span>Asset</span>
              <span>Borrow</span>
              <span>APY</span>
            </CustomStyledBoxHeader>
            <StyledBoxContent>
              {filtered.supplying?.map((item) => (
                <MyBorrowItem key={item} asset={item} />
              ))}
            </StyledBoxContent>
          </StyledBox>
        </StyledMyMarkets>
      ) : null}
      <StyledAllMarkets>
        <StyledTitle>Assets to borrow</StyledTitle>
        <StyledBox>
          <CustomStyledMarketBoxHeader>
            <span>Asset</span>
            <span>Available</span>
            <span>APY</span>
          </CustomStyledMarketBoxHeader>
          <StyledBoxContent>
            {filtered.all?.map((item) => (
              <BorrowItem key={item} asset={item}></BorrowItem>
            ))}
          </StyledBoxContent>
        </StyledBox>
      </StyledAllMarkets>
    </StyledContainer>
  );
};

const CustomStyledBoxHeader = styled(StyledBoxHeader)`
  ${screenUp('lg')`
    grid-template-columns: 5fr 4fr 4fr 5fr;
  `}
`;

const CustomStyledMarketBoxHeader = styled(CustomStyledBoxHeader)``;

export default BorrowMarkets;
