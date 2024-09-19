import React, { useMemo } from 'react';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import {
  StyledColumn,
  StyledValue,
  StyledAprContainer,
} from '../../../components/MarketItemShared';
import { Button, ButtonLinkOutline } from '../../../../../components/Buttons';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { PercentageThreshold, Precision, TokenThreshold } from '../../../../../utils/constants';
import {
  StyledActions,
  StyledAsset,
  StyledContainer,
  StyledRow,
  StyledSymbolLink,
  StyledTitle,
} from './MarketRowShare';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import Spacer from '../../../../../components/Spacer';
import { Zero } from '@ethersproject/constants';
import ModalBorrow from './Modals/ModalBorrow';
import useModal from '../../../../../hooks/useModal';
import { min } from '../../../../../utils/numbers';
import { useLendingUserInfoBalance } from '../../../hooks/useUserLendingHook';
import { useMarket } from '../../../hooks/useLendingMarkets';

type BorrowItemProps = {
  asset: string;
};

const BorrowItem: React.FC<BorrowItemProps> = ({ asset }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const { borrowLimit, borrowBalance } = useLendingUserInfoBalance();
  const [openBorrowModal] = useModal(<ModalBorrow asset={asset} />, 'lending-borrow-modal');

  const borrowLimitRemaining = useMemo(() => {
    return borrowLimit && borrowLimit?.gt(Zero) && borrowBalance
      ? borrowLimit.sub(borrowBalance)
      : Zero;
  }, [borrowBalance, borrowLimit]);

  const maxBorrowLimit = useMemo(() => {
    if (!market?.cash || borrowLimitRemaining.lte(Zero)) {
      return Zero;
    }
    const estMax = borrowLimitRemaining.mul(Precision).div(market?.underlyingPrice);
    return min(estMax, market?.cash);
  }, [borrowLimitRemaining, market?.cash, market?.underlyingPrice]);

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
          <StyledTitle>Available:</StyledTitle>
          <StyledValue>
            {account ? (
              <>
                <BigNumberValue
                  value={maxBorrowLimit}
                  decimals={market?.assetDecimals}
                  fractionDigits={market?.significantDigits || 2}
                  threshold={TokenThreshold[market?.asset] || TokenThreshold.DEFAULT}
                />
                <span>{market?.asset}</span>
              </>
            ) : (
              '-'
            )}
          </StyledValue>
        </StyledRow>
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
        <Button size="sm" onClick={openBorrowModal}>
          Borrow
        </Button>
        <Spacer />
        <ButtonLinkOutline size="sm" to={`lending/market/${market?.asset?.toLowerCase()}`}>
          Details
        </ButtonLinkOutline>
      </StyledActions>
    </CustomStyledContainer>
  );
};

const CustomStyledContainer = styled(StyledContainer)`
  padding: 0 0 15px 0;
  background-color: ${({ theme }) => theme.box.itemBackground};
  ${screenUp('lg')`
    padding: 18px 16px;
    grid-template-columns: 5fr 4fr 4fr 5fr
  `}
`;

export default BorrowItem;
