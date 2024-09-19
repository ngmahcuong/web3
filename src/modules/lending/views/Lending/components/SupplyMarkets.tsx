import React, { useMemo } from 'react';
import { difference } from 'lodash';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { CurrencyThreshold, PercentageThreshold } from '../../../../../utils/constants';
import imgActive from '../../../../../assets/icons/ic-active.svg';
import MySupplyItem from './MySupplyItem';
import SupplyItem from './SupplyItem';
import {
  StyledAllMarkets,
  StyledBox,
  StyledBoxContent,
  StyledBoxHeader,
  StyledCheckbox,
  StyledContainer,
  StyledHeader,
  StyledInfo,
  StyledInfoItem,
  StyledMarketBoxHeader,
  StyledMyMarkets,
  StyledTitle,
} from './MarketsShare';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import FormatNumber from '../../../../../components/FormatNumber';
import { useToggleShowZeroBalance } from '../../../../../state/application/hooks';
import { useTokenBalances } from '../../../../../state/user/hooks';
import { Zero } from '@ethersproject/constants';
import { useAllMarketIds, useAllMarkets } from '../../../hooks/useLendingMarkets';
import {
  useLendingUserInfo,
  useLendingUserInfoBalance,
} from '../../../hooks/useUserLendingHook';

const SupplyMarkets: React.FC = () => {
  const { account } = useUserWallet();
  const markets = useAllMarkets();
  const marketIds = useAllMarketIds();
  const user = useLendingUserInfo();
  const { totalSupply, borrowLimit, supplyApy } = useLendingUserInfoBalance();
  const { showZeroBalance: isShowZeroBalance, toggle: onClickShowZeroBalanceCheckbox } =
    useToggleShowZeroBalance();

  const assets = useMemo(() => {
    return markets.map((market) => market.asset) || [];
  }, [markets]);

  const assetBalances = useTokenBalances(assets);

  const filtered = useMemo(() => {
    if (!user) {
      return {
        supplying: [],
        others: marketIds,
        all: marketIds,
      };
    }

    const supplying = Object.keys(user.supplying).filter((t) => user.supplying[t].gt(0));

    return {
      supplying,
      others: difference(marketIds, supplying),
      all: marketIds,
    };
  }, [marketIds, user]);

  const isNoBalance = useMemo(() => {
    return !assets
      ?.map((asset, index) => {
        const assetBalance = assetBalances[asset];
        return { asset, assetBalance };
      })
      ?.filter((x) => x.assetBalance && x.assetBalance.gt(Zero)).length;
  }, [assetBalances, assets]);

  return (
    <StyledContainer>
      {filtered.supplying.length ? (
        <StyledMyMarkets>
          <StyledTitle>Your supplies</StyledTitle>
          <StyledInfo>
            <StyledInfoItem variant="success">
              Supply Balance:
              <span>
                <BigNumberValue
                  value={totalSupply}
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
                  value={Math.abs(supplyApy)}
                  percentage
                  fractionDigits={2}
                  threshold={PercentageThreshold}
                />
              </span>
            </StyledInfoItem>
            <StyledInfoItem>
              <img src={imgActive} alt="icon-collateral" />
              Collateral:
              <span>
                <BigNumberValue
                  value={borrowLimit}
                  decimals={18}
                  currency="USD"
                  threshold={CurrencyThreshold}
                />
              </span>
            </StyledInfoItem>
          </StyledInfo>
          <StyledBox>
            <StyledBoxHeader>
              <span>Asset</span>
              <span>Balance</span>
              <span>APY</span>
              <span>Collateral</span>
            </StyledBoxHeader>
            <StyledBoxContent>
              {filtered.supplying?.map((item) => (
                <MySupplyItem key={item} asset={item} />
              ))}
            </StyledBoxContent>
          </StyledBox>
        </StyledMyMarkets>
      ) : null}
      <StyledAllMarkets>
        <StyledHeader>
          <StyledTitle>Assets to supply</StyledTitle>
          {account && !isNoBalance && (
            <StyledCheckbox>
              <input
                type="checkbox"
                defaultChecked={isShowZeroBalance}
                onChange={onClickShowZeroBalanceCheckbox}
                id="show-zero-balance"
              />
              <label htmlFor="show-zero-balance">Show assets with zero balance</label>
            </StyledCheckbox>
          )}
        </StyledHeader>
        <StyledBox>
          <StyledMarketBoxHeader>
            <span>Asset</span>
            <span>Wallet</span>
            <span>APY</span>
          </StyledMarketBoxHeader>
          <StyledBoxContent>
            {filtered.all?.map((item) => (
              <SupplyItem
                key={item}
                asset={item}
                isShowZeroBalance={(account && isShowZeroBalance) || !account || isNoBalance}
              />
            ))}
          </StyledBoxContent>
        </StyledBox>
      </StyledAllMarkets>
    </StyledContainer>
  );
};

export default SupplyMarkets;
