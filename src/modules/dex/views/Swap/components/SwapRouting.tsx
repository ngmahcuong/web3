import { isEmpty } from 'lodash';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import icParamid from '../../../../../assets/icons/ic-left-paramid.svg';
import { useUniswapToken } from '../../../hooks/useUniswapToken';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import { Path } from '../../../../../state/dex/actions';

export type SwapRoutingProps = {
  route?: Path[];
};
export const SwapRouting: React.FC<SwapRoutingProps> = ({ route }) => {
  return route?.length ? (
    <StyledRouterContainer>
      <StyledRouterTitle>Routing</StyledRouterTitle>
      <StyledRouterBody>
        <StyleRouterTokenContainer>
          <RoutingNode path={route} />
        </StyleRouterTokenContainer>
      </StyledRouterBody>
    </StyledRouterContainer>
  ) : (
    <></>
  );
};

export const RoutingTokenRound: React.FC<{
  address?: string;
}> = ({ address }) => {
  const token = useUniswapToken(address);
  return (
    <StyleRouterTokenRound rounded>
      <DexTokenSymbol address={token?.wrapped?.address} size={25} />
      <span>{token?.symbol}</span>
    </StyleRouterTokenRound>
  );
};

export const RoutingNode: React.FC<{ path?: Path[] }> = ({ path }) => {
  return isEmpty(path) ? (
    <></>
  ) : (
    <RoutingNodeContainer>
      {path.map((item, index, path) => {
        const isLast = index === path.length - 1;
        return (
          <Fragment key={`container-${index}`}>
            <RoutingTokenRound address={item.source} key={`path-start-${index}`} />
            <RouteNodePathLine key={`path-line-${index}`} item={item} />
            {isLast ? (
              <RoutingTokenRound address={item.target} key={`path-end-${index}`} />
            ) : undefined}
          </Fragment>
        );
      })}
    </RoutingNodeContainer>
  );
};

export const RouteNodePathLine: React.FC<{ item }> = ({ item }) => {
  return (
    <RoutingNodeLineWrapper>
      {item?.type === 'stableswap' && <StyledStableswap>Stableswap</StyledStableswap>}
      <RoutingNodeLineContainer>
        <RoutingNodeLine />
        <img src={icParamid} alt="paramid" />
      </RoutingNodeLineContainer>
    </RoutingNodeLineWrapper>
  );
};

const StyledRouterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  padding: 10px;
  ${screenUp('lg')`
    padding:  20px
  `}
`;
const StyledRouterTitle = styled.div`
  font-size: 1px;
  ${screenUp('lg')`
    font-size: 16px;
  `}
`;

const StyledRouterBody = styled.div`
  margin-top: 5px;
  ${screenUp('lg')`
    margin-top: 10px ;
  `}
`;

const StyleRouterTokenContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
`;

const StyleRouterTokenRound = styled.div<{ rounded?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.box.itemBackground};
  border: ${({ theme }) => `solid 1px ${theme.box.border}`};
  padding: 4px 8px 4px 4px;
  border-radius: 1px;
  font-size: 13px;
  span {
    margin-left: 4px;
  }
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const RoutingNodeLineContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  margin: 0px 1px;
`;

const RoutingNodeLine = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.box.border};
  flex: 1;
  span {
    margin-left: 5px;
  }
`;
const RoutingNodeLineWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const StyledStableswap = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: normal;
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  padding: 0 7px;
  border-radius: 5px;
  line-height: 1.5;
  bottom: 5px;
  display: none;
  ${screenUp('lg')`
    display: block;
  `}
`;

const RoutingNodeContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-wrap: wrap;
  grid-row-gap: 10px;
  align-items: center;
`;
