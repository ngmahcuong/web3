import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useParams, useHistory } from 'react-router-dom';
import { PoolInfo } from './components/PoolInfo';
import { ModalBackButton } from '../../../../components/Modal/ModalStyles';
import AddLiquidity from './components/AddLiquidity';
import RemoveLiquidity from './components/RemoveLiquidity';
import Setting from '../../components/Setting/Setting';
import { screenUp } from '../../../../utils/styles';
import { useWeb3React } from '@web3-react/core';
import { getStablePoolConfig, getTokenByAddress } from '../../../../config';
import { useFetchPairStableInfo } from './hook/useFetchPairStableInfo';
import { Toggle } from '../../../../components/Toggle';
import CreatePoolInfo from '../PoolDetail/components/CreatePoolInfo';
import { useUpdateLendingState } from '../../../lending/hooks/useUpdateUserLendingState';
import { useUpdateLendingMarketsState } from '../../../lending/hooks/useUpdateLendingMarketsState';
import { ExplorerLink } from '../../../../components/ExplorerLink';
import { TokenSymbol } from '../../../../components/TokenSymbol';
import { useAssetsInfo } from './hook/useAssetsInfo';

enum TABS {
  AddLP,
  RemoveLP,
}

const StablePool: React.FC = () => {
  useUpdateLendingState();
  useUpdateLendingMarketsState();
  const { poolAddress } = useParams<{ poolAddress?: string }>();
  const history = useHistory();
  const [tab, setTab] = useState<TABS>(
    history?.location?.pathname?.includes('remove') ? TABS.RemoveLP : TABS.AddLP,
  );
  const { chainId } = useWeb3React();
  const token = getTokenByAddress(chainId, poolAddress);
  const poolConfig = getStablePoolConfig(chainId, token?.name);
  const poolInfo = useFetchPairStableInfo(poolConfig);
  const [usingZap, setUsingZap] = useState(true);
  const fromMyPool = (history.location.state as any)?.fromMyPool;
  const tokenInfos = useAssetsInfo(poolConfig?.chAssets);

  const tokens = useMemo(() => {
    return usingZap ? poolConfig?.assets : poolConfig?.chAssets;
  }, [usingZap, poolConfig?.assets, poolConfig?.chAssets]);

  const goBack = useCallback(() => {
    fromMyPool ? history.push(`/pools/my-pools`) : history.push(`/pools`);
  }, [fromMyPool, history]);

  const onToggle = useCallback(() => {
    setUsingZap((usingZap) => !usingZap);
  }, []);

  const onSelectAddTab = useCallback(() => {
    if (tab === TABS.RemoveLP) {
      history.push(`/pools/stable/add/${poolAddress}`, { fromMyPool });
      setTab(TABS.AddLP);
    }
  }, [fromMyPool, history, poolAddress, tab]);

  const onSelectRemoveTab = useCallback(() => {
    if (tab === TABS.AddLP) {
      setTab(TABS.RemoveLP);
      history.push(`/pools/stable/remove/${poolAddress}`, { fromMyPool });
    }
  }, [fromMyPool, history, poolAddress, tab]);

  return (
    <BoxContainer>
      <ModalBackButton onClick={goBack}>Back to pools</ModalBackButton>
      <StyledPoolHeader>
        <StyledPoolTokens>
          <div className="icon">
            {poolConfig?.chAssets?.map((item, index) => (
              <TokenSymbol symbol={item} size={36} key={index} />
            ))}
          </div>
          <div className="right">
            <div className="token">
              <div className="name">{tokenInfos?.map((t) => t.name)?.join('/')}</div>
              <StyledExplorerLink>
                <ExplorerLink type="token" address={poolConfig?.address}>
                  <i className="far fa-external-link"></i>
                </ExplorerLink>
              </StyledExplorerLink>
            </div>
            <span className="label">STABLE</span>
          </div>
        </StyledPoolTokens>
      </StyledPoolHeader>
      <StyledContent>
        {poolInfo?.loading ? (
          <StyledLoading>
            <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
          </StyledLoading>
        ) : (
          <>
            {poolConfig?.lpToken ? (
              <StyledPoolDetail>
                <PoolInfo
                  tokenInfo={token}
                  symbols={poolConfig?.chAssets}
                  poolInfo={poolInfo}
                  liquidityToken={poolConfig?.address}
                />
              </StyledPoolDetail>
            ) : (
              <>
                <CreatePoolInfo />
              </>
            )}
          </>
        )}
        <StyledActions>
          <StyledActionHeader>
            <StyledSwitch>
              <StyledSwitchItem onClick={onSelectAddTab} active={tab === TABS.AddLP}>
                Add Liquidity
              </StyledSwitchItem>
              {true && (
                <StyledSwitchItem onClick={onSelectRemoveTab} active={tab === TABS.RemoveLP}>
                  Remove Liquidity
                </StyledSwitchItem>
              )}
            </StyledSwitch>
            <Setting />
          </StyledActionHeader>
          <StyledActionContent>
            {!poolConfig?.basePoolIndex && (
              <StyledSelectReceive>
                <Toggle
                  checked={!usingZap}
                  onClick={() => {
                    onToggle();
                  }}
                />
                <StyledToggleLabel
                  onClick={() => {
                    onToggle();
                  }}
                >
                  Using Interest-bearing Token (chToken)
                </StyledToggleLabel>
              </StyledSelectReceive>
            )}

            {tab === TABS.AddLP && (
              <AddLiquidity
                poolConfig={poolConfig}
                poolInfo={poolInfo}
                usingZap={usingZap}
                tokens={tokens}
              />
            )}
            {tab === TABS.RemoveLP && (
              <RemoveLiquidity
                poolConfig={poolConfig}
                poolInfo={poolInfo}
                usingZap={usingZap}
                tokens={tokens}
              />
            )}
          </StyledActionContent>
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

const StyledFlexResponsive = styled.div`
  display: flex;
  flex-direction: column;
  align-items: unset;
  ${screenUp('lg')`
    flex-direction: row;
    align-items: center;
  `}
`;

const StyledExplorerLink = styled.div`
  a {
    color: ${({ theme }) => theme.success};
    :hover {
      color: ${({ theme }) => theme.text.primary};
    }
  }
  i {
    margin-left: 5px;
    font-size: 14px;
  }
`;

const StyledPoolHeader = styled(StyledFlexResponsive)`
  justify-content: space-between;
  display: flex;
  padding: 16px 0;
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledPoolTokens = styled(StyledFlex)`
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
  .right {
    margin-left: 9px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .label {
      font-weight: normal;
      font-size: 14px;
      color: ${({ theme }) => theme.badge.color};
      padding: 0 7px;
      background-color: ${({ theme }) => theme.badge.background};
      border-radius: 5px;
      line-height: 1.5;
      margin-top: 3px;
    }
  }
  .token {
    display: flex;
    align-items: center;
  }
  .name {
    font-weight: 500;
    font-size: 20px;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
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
const StyledActionContent = styled.div`
  border: solid 1px ${({ theme }) => theme.box.border};
  background-color: ${({ theme }) => theme.box.background};
`;
const StyledSelectReceive = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 10px 0 10px;
  ${screenUp('lg')`
    padding: 20px 20px 0 20px;
  `}
`;

const StyledToggleLabel = styled.span`
  color: ${({ theme }) => theme.muted};
  margin-left: 6px;
  cursor: pointer;
`;

export default StablePool;
