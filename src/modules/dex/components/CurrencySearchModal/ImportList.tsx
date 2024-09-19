import { TokenList, Version } from '@uniswap/token-lists';
import { FC, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Button } from '../../../../components/Buttons';
import { enableList, removeList } from '../../../../state/dex/actions';
import { useAllLists } from '../../../../state/dex/hooks';
import { useFetchListCallback } from '../../hooks/useFetchListCallback';
import uriToHttp from '../../utils/uriToHttp';
import ListSymbol from './ListSymbol';

interface ImportListProps {
  listUrl: string;
  list: TokenList;
  onImport: () => void;
}

function listVersionLabel(version: Version): string {
  return `v${version.major}.${version.minor}.${version.patch}`;
}

export const ImportList: FC<ImportListProps> = ({ listUrl, list, onImport }) => {
  const dispatch = useDispatch();

  const lists = useAllLists();
  const fetchList = useFetchListCallback();

  // monitor is list is loading
  const adding = Boolean(lists[listUrl]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listUrl)
      .then(() => {
        dispatch(enableList(listUrl));
        onImport();
      })
      .catch((error) => {
        setAddError(error.message);
        dispatch(removeList(listUrl));
      });
  }, [adding, dispatch, fetchList, listUrl, onImport]);

  return (
    <StyledContainer>
      <StyledBox>
        <StyledRow>
          {list?.logoURI && (
            <ListSymbol uris={uriToHttp(list.logoURI)} width={40} alt={list.name} />
          )}
          <StyledColumn>
            <StyledListInfo
              target="_blank"
              href={`https://tokenlists.org/token-list?url=${listUrl}`}
            >
              {list?.name}{' '}
              {list && <StyledVersion>{listVersionLabel(list.version)}</StyledVersion>}
            </StyledListInfo>
            <StyledRow center>
              <StyleText size="sm">{list?.tokens.length} tokens</StyleText>
            </StyledRow>
          </StyledColumn>
        </StyledRow>
      </StyledBox>
      <StyledBox>
        <StyleText size="sm" warning>
          Import at your own risk
        </StyleText>
        <StyleText size="md" warning>
          By adding this list you are implicitly trusting that the data is correct. Anyone can
          create a list, including creating fake versions of existing lists and lists that claim
          to represent projects that do not have one.
        </StyleText>
        <StyleText size="md" warning>
          If you purchase a token from this list, you may not be able to sell it back.
        </StyleText>
      </StyledBox>
      <Button block onClick={handleAddList} size="md">
        Import
      </Button>
      {addError ? (
        <StyleText size="sm" error>
          {addError}
        </StyleText>
      ) : null}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  > * + * {
    margin-top: 1rem;
  }
`;

const StyledBox = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  > * + * {
    margin-top: 1rem;
  }
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.box.border};
  border-radius: 5px;
`;

const StyledRow = styled.div<{ center?: boolean }>`
  display: flex;
  align-items: ${({ center }) => center && 'center'};
  > * + * {
    margin-left: 0.5rem;
  }
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledListInfo = styled.a`
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text.primary};
  &:hover {
    color: ${({ theme }) => theme.success};
  }
`;

const StyledVersion = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.muted};
`;

const StyleText = styled.div<{
  size?: 'md' | 'sm';
  warning?: boolean;
  error?: boolean;
}>`
  font-size: ${({ size }) => (size === 'md' ? '1rem' : size === 'sm' ? '.875rem' : '1rem')};
  color: ${({ warning, theme }) => (warning ? theme.danger : theme.muted)};
  ${({ error, theme }) =>
    error &&
    `
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      color: ${theme.danger};
    `}
`;
