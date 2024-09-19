import { Currency, Token } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import styled, { CSSProperties } from 'styled-components';
import { ExplorerLink } from '../../../../components/ExplorerLink';
import {
  useCombinedActiveList,
  useCombinedInactiveList,
  useIsTokenActive,
  useIsUserAddedToken,
} from '../../../../state/dex/hooks';
import { DexTokenSymbol } from '../DexTokenSymbol';
interface ImportRowProps {
  token: Token;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  style?: CSSProperties;
  hasBorder?: boolean;
  handleCurrencySelect?: (currency: Currency) => void;
  showBalance?: boolean;
}

export const ImportRow: React.FC<ImportRowProps> = ({
  token,
  showImportView,
  setImportToken,
  style,
  handleCurrencySelect,
  hasBorder,
}) => {
  const { chainId } = useWeb3React();

  // check if token comes from list
  const inactiveTokenLists = useCombinedInactiveList();
  const activeTokenLists = useCombinedActiveList();
  const inactiveList = chainId && inactiveTokenLists?.[chainId]?.[token.address]?.list;
  const activeList = chainId && activeTokenLists?.[chainId]?.[token.address]?.list;

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token);
  const isActive = useIsTokenActive(token);

  const handleImport = useCallback(() => {
    if (isAdded || activeList || isActive || inactiveList) {
      handleCurrencySelect(token);
    }
    if (setImportToken) {
      setImportToken(token);
    }
    showImportView();
  }, [
    handleCurrencySelect,
    isActive,
    isAdded,
    inactiveList,
    activeList,
    setImportToken,
    showImportView,
    token,
  ]);

  return (
    <StyledContainer style={style} hasBorder={hasBorder}>
      <StyledWrapper onClick={handleImport}>
        <DexTokenSymbol size={36} address={token?.address} />
        <StyledInfo>
          <StyledColumn>
            <StyledContent className="text-secondary">{token.name}</StyledContent>
            <StyledContent size="md" className="text-high-emphesis">
              {token.symbol}
            </StyledContent>
          </StyledColumn>
        </StyledInfo>
      </StyledWrapper>
      <ExplorerLink address={token.address} type="address">
        <StyleButtonExplorer>
          <i className="far fa-external-link" />
        </StyleButtonExplorer>
      </ExplorerLink>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ hasBorder?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  > * + * {
    margin-left: 0.875rem;
  }
  padding: 12px 0;
  color: ${({ theme }) => theme.box.itemBackground};
  height: 65px;
  cursor: pointer;
  :hover {
    .text-high-emphesis {
      color: ${({ theme }) => theme.success};
    }
  }
  &:not(:last-child) {
    border-bottom: dashed ${({ theme }) => theme.box.border};
    border-bottom-width: ${({ hasBorder }) => (hasBorder ? '1px' : 0)};
  }
`;

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  > * + * {
    margin-left: 0.75rem;
  }
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  > * + * {
    margin-top: 3px;
  }
`;

const StyledInfo = styled.div`
  display: flex;
  > * + * {
    margin-left: 0.25rem;
  }
  align-items: center;
`;

const StyledContent = styled.div<{ size?: 'sm' | 'md' }>`
  font-weight: ${({ size }) => size === 'md' && 'bold'};
  font-size: ${({ size }) => (size === 'md' ? '.875rem' : '.75rem')};
  &.text-secondary {
    color: ${({ theme }) => theme.gray3};
  }
  &.text-high-emphesis {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const StyleButtonExplorer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.muted};
  margin-left: 0.625rem;
  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
  i {
    font-size: 0.875rem;
  }
`;
