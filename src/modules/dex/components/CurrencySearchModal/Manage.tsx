import { FC, useState } from 'react';
import CurrencyModalView from './CurrencyModalView';
import { Currency, Token } from '@uniswap/sdk-core';
import { ManageTokens } from './ManageTokens';
import styled from 'styled-components';
import { ManageLists } from './ManageLists';
import { TokenList } from '@uniswap/token-lists';

interface ManageProps {
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
  handleCurrencySelect?: (currency: Currency) => void;
  setImportList: (list: TokenList) => void;
  setListUrl: (url: string) => void;
}

enum Tab {
  Lists,
  Tokens,
}

export const Manage: FC<ManageProps> = ({
  setModalView,
  setImportToken,
  handleCurrencySelect,
  setImportList,
  setListUrl,
}) => {
  const [tab, setTab] = useState(Tab.Lists);

  return (
    <>
      <StyledButtonMenu>
        <StyledButtonMenuItem active={tab === Tab.Lists} onClick={() => setTab(Tab.Lists)}>
          Lists
        </StyledButtonMenuItem>
        <StyledButtonMenuItem active={tab === Tab.Tokens} onClick={() => setTab(Tab.Tokens)}>
          Tokens
        </StyledButtonMenuItem>
      </StyledButtonMenu>
      {tab === Tab.Lists ? (
        <ManageLists
          setModalView={setModalView}
          setImportList={setImportList}
          setListUrl={setListUrl}
        />
      ) : tab === Tab.Tokens ? (
        <ManageTokens
          setModalView={setModalView}
          setImportToken={setImportToken}
          handleCurrencySelect={handleCurrencySelect}
        />
      ) : null}
    </>
  );
};

const StyledButtonMenu = styled.div`
  display: flex;
  flex-direction: row;
  margin: -12px -16px 12px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.box.border};
`;

const StyledButtonMenuItem = styled.div<{ active: boolean }>`
  user-select: ${({ active }) => !active && 'none'};
  padding: 10px 0;
  margin-right: 30px;
  border-bottom: solid ${({ theme }) => theme.header.background};
  border-bottom-width: ${({ active }) => (active ? '2px' : 0)};
  color: ${({ theme, active }) => (active ? theme.header.background : theme.muted)};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.header.background};
  }
`;
