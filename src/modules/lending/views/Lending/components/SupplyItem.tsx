import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Button, ButtonLinkOutline } from '../../../../../components/Buttons';
import Spacer from '../../../../../components/Spacer';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { PercentageThreshold, TokenThreshold } from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { Zero } from '@ethersproject/constants';
import {
  StyledActions,
  StyledAsset,
  StyledContainer,
  StyledRow,
  StyledSymbolLink,
  StyledTitle,
} from './MarketRowShare';
import ModalSupply from './Modals/ModalSupply';
import useModal from '../../../../../hooks/useModal';
import {
  StyledAprContainer,
  StyledColumn,
  StyledValue,
} from '../../../components/MarketItemShared';
import { useMarket } from '../../../hooks/useLendingMarkets';

type SupplyItemProps = {
  asset: string;
  isShowZeroBalance: boolean;
};

const SupplyItem: React.FC<SupplyItemProps> = ({ asset, isShowZeroBalance }) => {
  const { account } = useUserWallet();
  const market = useMarket(asset);
  const balance = useTokenBalance(market?.asset);
  const [openSupplyModal] = useModal(<ModalSupply asset={asset} />, 'lending-deposit-modal');

  const isShow = useMemo(() => {
    return (balance && balance.gt(Zero)) || isShowZeroBalance;
  }, [balance, isShowZeroBalance]);

  return isShow ? (
    <CustomStyledContainer>
      <StyledAsset>
        <TokenSymbol symbol={`${market?.asset}`} size={36} />
        <StyledSymbolLink to={`lending/market/${market?.asset?.toLowerCase()}`}>
          {market?.asset}
        </StyledSymbolLink>
      </StyledAsset>
      <StyledColumn>
        <StyledRow>
          <StyledTitle>Wallet balance:</StyledTitle>
          <StyledValue>
            {account ? (
              <>
                <BigNumberValue
                  value={balance}
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
      <StyledActions>
        <Button size="sm" onClick={openSupplyModal}>
          Supply
        </Button>
        <Spacer />
        <ButtonLinkOutline size="sm" to={`lending/market/${market?.asset?.toLowerCase()}`}>
          Details
        </ButtonLinkOutline>
      </StyledActions>
    </CustomStyledContainer>
  ) : null;
};

const CustomStyledContainer = styled(StyledContainer)`
  padding: 0 0 15px 0;
  background-color: ${({ theme }) => theme.box.itemBackground};
  ${screenUp('lg')`
    padding: 18px 16px;
    grid-template-columns: 5fr 4fr 4fr 6fr;
  `}
`;

export default SupplyItem;
