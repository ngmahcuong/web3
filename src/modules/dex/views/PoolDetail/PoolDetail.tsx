import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useParams, useHistory } from 'react-router-dom';
import { useUniswapToken } from '../../hooks/useUniswapToken';
import { useFetchPairInfo } from '../../hooks/useFetchPairInfo';
import CreatePoolInfo from './components/CreatePoolInfo';
import { PairState } from '../../models/Pair';
import { PoolInfo } from './components/PoolInfo';
import { ModalBackButton } from '../../../../components/Modal/ModalStyles';
import AddLiquidity from '../AddLiquidity/AddLiquidity';
import RemoveLiquidity from '../RemoveLiquidity/RemoveLiquidity';
import Setting from '../../components/Setting/Setting';
import { screenUp } from '../../../../utils/styles';
import { DexTokenSymbol } from '../../components/DexTokenSymbol';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import { ExplorerLink } from '../../../../components/ExplorerLink';
import { calcPrice } from '../../utils/liquidity';

enum TABS {
  AddLP,
  RemoveLP,
}

const PoolDetail: React.FC = () => {
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA?: string;
    currencyIdB?: string;
  }>();
  const history = useHistory();
  const [tab, setTab] = useState<TABS>(
    history?.location?.pathname?.includes('remove') ? TABS.RemoveLP : TABS.AddLP,
  );
  const fromMyPool = (history.location.state as any)?.fromMyPool;

  const currencyA = useUniswapToken(currencyIdA);
  const currencyB = useUniswapToken(currencyIdB);
  const pairInfo = useFetchPairInfo(currencyA, currencyB);
  const { pairState, reserveA, reserveB, liquidityToken } = pairInfo;

  const goBack = useCallback(() => {
    fromMyPool ? history.push(`/pools/my-pools`) : history.push(`/pools`);
  }, [fromMyPool, history]);

  const onSelectAddTab = useCallback(() => {
    if (tab === TABS.RemoveLP) {
      history.push(`/pools/add/${currencyIdA}/${currencyIdB}`, { fromMyPool });
      setTab(TABS.AddLP);
    }
  }, [currencyIdA, currencyIdB, fromMyPool, history, tab]);

  const onSelectRemoveTab = useCallback(() => {
    if (tab === TABS.AddLP) {
      setTab(TABS.RemoveLP);
      history.push(`/pools/remove/${currencyIdA}/${currencyIdB}`, { fromMyPool });
    }
  }, [currencyIdA, currencyIdB, fromMyPool, history, tab]);

  const priceInputPerOutput = calcPrice(
    reserveA,
    reserveB,
    currencyA?.decimals,
    currencyB?.decimals,
  );
  const priceOutputPerInput = calcPrice(
    reserveB,
    reserveA,
    currencyB?.decimals,
    currencyA?.decimals,
  );

  return (
    <BoxContainer>
      <ModalBackButton onClick={goBack}>Back to pools</ModalBackButton>
      <StyledPoolHeader>
        <StyledPoolTokens>
          <div className="icon">
            <DexTokenSymbol address={currencyA?.wrapped.address} size={36} />
            <DexTokenSymbol address={currencyB?.wrapped.address} size={36} />
          </div>
          <div className="name">
            {currencyA?.symbol}/{currencyB?.symbol}
          </div>
          <StyledExplorerLink>
            <ExplorerLink type="token" address={liquidityToken}>
              <i className="far fa-external-link"></i>
            </ExplorerLink>
          </StyledExplorerLink>
        </StyledPoolTokens>
        <StyledFlexResponsive>
          <StyledTokenPrice>
            <DexTokenSymbol address={currencyA?.wrapped.address} size={20} />
            <span>
              1 {currencyA?.symbol} = &nbsp;
              <BigNumberValue value={priceOutputPerInput} decimals={6} fractionDigits={6} />
              &nbsp;{currencyB?.symbol}
            </span>
          </StyledTokenPrice>
          <StyledTokenPrice>
            <DexTokenSymbol address={currencyB?.wrapped.address} size={20} />
            <span>
              1 {currencyB?.symbol} = &nbsp;
              <BigNumberValue value={priceInputPerOutput} decimals={6} fractionDigits={6} />
              &nbsp;{currencyA?.symbol}
            </span>
          </StyledTokenPrice>
        </StyledFlexResponsive>
      </StyledPoolHeader>
      <StyledContent>
        <StyledPoolDetail>
          {pairState === PairState.LOADING && (
            <StyledLoading>
              <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
            </StyledLoading>
          )}
          {(pairState === PairState.NOT_EXISTS || pairState === PairState.INVALID) && (
            <CreatePoolInfo />
          )}
          {pairState === PairState.EXISTS && (
            <PoolInfo
              currencyA={currencyA}
              currencyB={currencyB}
              reserveA={reserveA}
              reserveB={reserveB}
              liquidityToken={liquidityToken}
            />
          )}
        </StyledPoolDetail>
        <StyledActions>
          <StyledActionHeader>
            <StyledSwitch>
              <StyledSwitchItem onClick={onSelectAddTab} active={tab === TABS.AddLP}>
                Add Liquidity
              </StyledSwitchItem>
              {pairState === PairState.EXISTS && (
                <StyledSwitchItem onClick={onSelectRemoveTab} active={tab === TABS.RemoveLP}>
                  Remove Liquidity
                </StyledSwitchItem>
              )}
            </StyledSwitch>
            <Setting />
          </StyledActionHeader>

          {tab === TABS.AddLP && (
            <AddLiquidity currencyA={currencyA} currencyB={currencyB} pairInfo={pairInfo} />
          )}
          {tab === TABS.RemoveLP && pairState === PairState.EXISTS && (
            <RemoveLiquidity
              currencyA={currencyA}
              currencyB={currencyB}
              pairInfo={pairInfo}
              onAdd={onSelectAddTab}
            />
          )}
        </StyledActions>
      </StyledContent>
    </BoxContainer>
  );
};

const BoxContainer = styled.div`
  color: ${({ theme }) => theme.text.primary};
  padding-top: 30px;
`;

const StyledFlex = styled.div`
  display: flex;
  align-items: center;
`;

const StyledExplorerLink = styled.div`
  a {
    color: ${({ theme }) => theme.success};
    :hover {
      color: ${({ theme }) => theme.text.primary};
    }
  }
  i {
    margin-left: 8px;
  }
`;

const StyledFlexResponsive = styled.div`
  display: flex;
  flex-direction: column;
  align-items: unset;
  ${screenUp('lg')`
    flex-direction: row;
    align-items: center;
  `}
`;

const StyledPoolHeader = styled(StyledFlexResponsive)`
  justify-content: space-between;
  display: flex;
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledPoolTokens = styled(StyledFlex)`
  margin-top: 16px;
  .icon {
    display: flex;
    img {
      z-index: 1;
      &:last-child {
        margin-left: -4px;
        z-index: 0;
      }
    }
  }
  .name {
    margin-left: 9px;
    font-weight: 500;
    font-size: 20px;
  }
  ${screenUp('lg')`
    margin-top: 0;
  `}
`;

const StyledTokenPrice = styled(StyledFlex)`
  padding: 6px 10px;
  border: solid 1px ${({ theme }) => theme.box.border};
  margin-left: 0;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray3};
  margin-top: 10px;
  img {
    margin-right: 4px;
  }
  ${screenUp('lg')`
   justify-content: flex-start;
   margin-left: 12px;
   margin-top: 0;
  `}
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
  padding-top: 16px;
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: 5fr 3fr;
    grid-gap: 30px;
  `}
`;

const StyledPoolDetail = styled.div`
  height: 100%;
`;

const StyledLoading = styled.div`
  height: 100%;
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`;

const StyledActions = styled.div``;
const StyledActionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 48px;
  margin-bottom: -1px;
  z-index: 7;
`;

const StyledSwitchItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  background-color: ${({ theme, active }) =>
    active ? theme.box.background : theme.background};
  color: ${({ theme, active }) => (active ? theme.success : theme.gray3)};
  font-weight: 500;
  border: solid 1px ${({ theme }) => theme.box.border};
  border-bottom: none;
  height: 100%;
  cursor: pointer;
  :hover {
    color: ${({ theme, active }) => (active ? theme.button.primary.hover : theme.success)};
  }
  &:last-child {
    border-left: none;
  }
`;

export default PoolDetail;
