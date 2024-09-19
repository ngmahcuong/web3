import { Currency, Token } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { RefObject, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { useUniswapToken } from '../../hooks/useUniswapToken';
import CurrencyModalView from './CurrencyModalView';
import { ImportRow } from './ImportRow';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { isAddress } from '../../../../utils/addresses';
import { ExplorerLink } from '../../../../components/ExplorerLink';
import { screenUp } from '../../../../utils/styles';
import { DexTokenSymbol } from '../DexTokenSymbol';
import useUserAddedTokens, { useRemoveUserAddedToken } from '../../../../state/dex/hooks';

interface ManageTokensProps {
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
  handleCurrencySelect?: (currency: Currency) => void;
}

export const ManageTokens: React.FC<ManageTokensProps> = ({
  setModalView,
  setImportToken,
  handleCurrencySelect,
}) => {
  const { chainId } = useWeb3React();

  const [searchQuery, setSearchQuery] = useState<string>('');

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
  }, []);

  // if they input an address, use it
  const searchToken = useUniswapToken(searchQuery);

  // all tokens for local list
  const userAddedTokens: Token[] = useUserAddedTokens();
  const removeToken = useRemoveUserAddedToken();

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.forEach((token) => {
        return removeToken(chainId, token.address);
      });
    }
  }, [removeToken, userAddedTokens, chainId]);

  const isAddressValid = searchQuery === '' || isAddress(searchQuery);

  const Row = useCallback(
    ({ index, style }) => {
      const token = userAddedTokens[index];
      return (
        <StyledToken key={index} style={style}>
          <StyledTokenContainer>
            <DexTokenSymbol address={token?.address} size={36} />
            <ExplorerLink address={token.address} type="address">
              <StyleTokenSymbol>{token.symbol}</StyleTokenSymbol>
            </ExplorerLink>
          </StyledTokenContainer>
          <StyledButtonContainer>
            <StyleButtonRemove onClick={() => removeToken(chainId, token.address)}>
              <i className="far fa-trash" />
            </StyleButtonRemove>
            <ExplorerLink address={token.address} type="address">
              <StyleButtonExplorer>
                <i className="far fa-external-link" />
              </StyleButtonExplorer>
            </ExplorerLink>
          </StyledButtonContainer>
        </StyledToken>
      );
    },
    [chainId, removeToken, userAddedTokens],
  );

  return (
    <>
      <StyledInputContainer>
        <StyledInput
          type="text"
          id="token-search-input"
          placeholder="0x..."
          value={searchQuery}
          autoComplete="off"
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
        />
      </StyledInputContainer>
      {!isAddressValid && <StyledError>Enter valid token address</StyledError>}
      {searchToken && (
        <ImportRow
          token={searchToken as Token}
          showImportView={() => setModalView(CurrencyModalView.importToken)}
          setImportToken={setImportToken}
          handleCurrencySelect={handleCurrencySelect}
          hasBorder
        />
      )}
      <>
        <StyledColumn>
          <StyledRow>
            <StyledLabel>
              {userAddedTokens?.length} Custom{' '}
              {userAddedTokens.length === 1 ? 'Token' : 'Tokens'}
            </StyledLabel>
            {userAddedTokens?.length ? (
              <StyledButtonClearAll onClick={handleRemoveAll}>Clear all</StyledButtonClearAll>
            ) : undefined}
          </StyledRow>
        </StyledColumn>
        <StyledTokenList>
          <AutoSizer>
            {({ height, width }) => (
              <StyledList
                height={height}
                width={width}
                itemCount={userAddedTokens?.length}
                itemSize={65}
              >
                {Row}
              </StyledList>
            )}
          </AutoSizer>
        </StyledTokenList>
      </>
      <StyledNote>Custom tokens are stored locally in your browser</StyledNote>
    </>
  );
};

const StyledInputContainer = styled.div`
  padding: 8px 12px 10px;
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.input.border};
  background-color: ${({ theme }) => theme.input.background};
`;

const StyledInput = styled.input`
  width: 100%;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.primary};
`;

const StyledError = styled.div`
  color: ${({ theme }) => theme.danger};
  font-size: 0.75rem;
  font-weight: 500;
`;

const StyledList = styled(List)`
  ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #eae5df;
  }
`;

const StyledTokenList = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1;
  flex-grow: 1;
  min-height: 50vh;
  height: 100%;
  ${screenUp('lg')`
    min-height: fit-content;
 `}
`;

const StyledColumn = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.gray3};
  font-size: 13px;
`;

const StyledButtonClearAll = styled.button`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
  :hover {
    text-decoration: underline;
  }
`;

const StyledToken = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
`;

const StyledTokenContainer = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 0.75rem;
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 0.5rem;
  }
  font-size: 0.875rem;
`;

const StyleTokenSymbol = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  &:hover {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyleButtonRemove = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.muted};
  &:hover {
    color: ${({ theme }) => theme.danger};
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
`;

const StyledNote = styled.div`
  font-size: 0.875rem;
  text-align: center;
  color: ${({ theme }) => theme.gray3};
`;
