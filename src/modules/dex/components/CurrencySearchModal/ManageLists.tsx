import { TokenList, Version } from '@uniswap/token-lists';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Dropdown, DropdownMenu, DropdownToggle } from '../../../../components/Dropdown';
import { Toggle } from '../../../../components/Toggle';
import { AppDispatch, AppState } from '../../../../state';
import {
  acceptListUpdate,
  disableList,
  enableList,
  removeList,
} from '../../../../state/dex/actions';
import { useActiveListUrls, useAllLists, useIsListActive } from '../../../../state/dex/hooks';
import { CHAI_LIST } from '../../config/lists';
import { useFetchListCallback } from '../../hooks/useFetchListCallback';
import uriToHttp from '../../utils/uriToHttp';
import CurrencyModalView from './CurrencyModalView';
import ListSymbol from './ListSymbol';

interface ManageListsProps {
  setModalView: (view: CurrencyModalView) => void;
  setImportList: (list: TokenList) => void;
  setListUrl: (url: string) => void;
}

function listVersionLabel(version: Version): string {
  return `v${version.major}.${version.minor}.${version.patch}`;
}

const ListRow: React.FC<{ listUrl: string }> = ({ listUrl }) => {
  const listsByUrl = useSelector<AppState>((state) => state.dex.tokenListActiveUrl);
  const dispatch = useDispatch<AppDispatch>();
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl];

  const isActive = useIsListActive(listUrl);

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return;
    dispatch(acceptListUpdate(listUrl));
  }, [dispatch, listUrl, pending]);

  const handleRemoveList = useCallback(() => {
    if (window?.confirm('Please confirm you would like to remove this list')) {
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl]);

  const handleEnableList = useCallback(() => {
    dispatch(enableList(listUrl));
  }, [dispatch, listUrl]);

  const handleDisableList = useCallback(() => {
    dispatch(disableList(listUrl));
  }, [dispatch, listUrl]);

  const handleOpenTokenList = useCallback((url) => {
    window.open(`https://tokenlists.org/token-list?url=${url}`);
  }, []);

  return (
    <StyledRowContainer>
      {list.logoURI ? (
        <ListSymbol uris={uriToHttp(list.logoURI)} width={40} alt={list.name} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <StyledListInfo>
        <StyledRow>
          <StyledListName>{list.name}</StyledListName>
          <StyledVersion>{listVersionLabel(list.version)}</StyledVersion>
        </StyledRow>
        <StyledRow>
          <StyledListTokenNumber>{list.tokens.length} Tokens</StyledListTokenNumber>
          <Dropdown>
            <DropdownToggle>
              <StyleSettingContainer>
                <i className="fal fa-cog" />
              </StyleSettingContainer>
            </DropdownToggle>
            <StyledDropdownMenu position="left">
              <StyledButtonWrapper btnType="info" onClick={() => handleOpenTokenList(listUrl)}>
                <i className="far fa-external-link" />
                <span>View list</span>
              </StyledButtonWrapper>
              {listUrl !== CHAI_LIST ? (
                <StyledButtonWrapper btnType="danger" onClick={handleRemoveList}>
                  <i className="far fa-trash" />
                  <span>Remove</span>
                </StyledButtonWrapper>
              ) : null}
              {pending && (
                <StyledButtonWrapper btnType="info" onClick={handleAcceptListUpdate}>
                  <i className="far fa-level-up-alt" />
                  <span>Update</span>
                </StyledButtonWrapper>
              )}
            </StyledDropdownMenu>
          </Dropdown>
        </StyledRow>
      </StyledListInfo>
      {listUrl !== CHAI_LIST ? (
        <Toggle
          checked={isActive}
          onClick={() => {
            if (isActive) {
              handleDisableList();
            } else {
              handleEnableList();
            }
          }}
        />
      ) : null}
    </StyledRowContainer>
  );
};

export const ManageLists: React.FC<ManageListsProps> = ({
  setModalView,
  setImportList,
  setListUrl,
}) => {
  const [listUrlInput, setListUrlInput] = useState<string>('');
  const lists = useAllLists();

  // sort by active but only if not visible
  const activeTokenListUrls = useActiveListUrls();
  const [activeCopy, setActiveCopy] = useState<string[] | undefined>();
  useEffect(() => {
    if (!activeCopy && activeTokenListUrls) {
      setActiveCopy(activeTokenListUrls);
    }
  }, [activeCopy, activeTokenListUrls]);

  const handleInput = useCallback((e) => {
    setListUrlInput(e.target.value);
  }, []);

  const fetchList = useFetchListCallback();

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0;
  }, [listUrlInput]);

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists);
    return listUrls.filter((listUrl) => {
      // only show loaded lists
      return Boolean(lists[listUrl]?.current);
    });
  }, [lists]);

  // temporary fetched list for import flow
  const [tempList, setTempList] = useState<TokenList>();
  const [addError, setAddError] = useState<string | undefined>();

  // check if list is already imported
  const isImported = Object.keys(lists).includes(listUrlInput);

  useEffect(() => {
    async function fetchTempList() {
      fetchList(listUrlInput, false)
        .then((list) => setTempList(list))
        .catch(() => setAddError('Error importing list'));
    }
    // if valid url, fetch details for card
    if (validUrl) {
      if (isImported) {
        setAddError('List already imported');
      }
      fetchTempList();
    } else {
      setTempList(undefined);
      if (listUrlInput !== '') {
        setAddError('Enter valid list location');
      }
    }

    // reset error
    if (listUrlInput === '') {
      setAddError(undefined);
    }
  }, [fetchList, isImported, listUrlInput, validUrl]);

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    if (!tempList || addError) return;
    setImportList(tempList);
    setModalView(CurrencyModalView.importList);
    setListUrl(listUrlInput);
  }, [addError, listUrlInput, setImportList, setListUrl, setModalView, tempList]);

  return (
    <>
      <StyledInputContainer>
        <StyledInput
          type="text"
          id="list-add-input"
          placeholder="https:// or ipfs://"
          autoComplete="off"
          value={listUrlInput}
          onChange={handleInput}
        />
      </StyledInputContainer>
      {addError ? <StyledError>{addError}</StyledError> : null}
      {tempList && (
        <StyledRowContainer hasBorder onClick={handleImport} disabled={!!addError}>
          {tempList?.logoURI && (
            <ListSymbol width={40} uris={uriToHttp(tempList.logoURI)} alt={tempList.name} />
          )}
          <StyledListInfo>
            <StyledRow>
              <StyledListName>{tempList?.name} </StyledListName>
              {tempList && <StyledVersion>{listVersionLabel(tempList.version)}</StyledVersion>}
            </StyledRow>
            <StyledRow>
              <StyledListTokenNumber>{tempList?.tokens.length} tokens</StyledListTokenNumber>
            </StyledRow>
          </StyledListInfo>
        </StyledRowContainer>
      )}
      <StyledListContainer>
        {sortedLists.map((listUrl) => (
          <ListRow key={listUrl} listUrl={listUrl} />
        ))}
      </StyledListContainer>
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
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  margin: 5px 0;
`;

const StyledListContainer = styled.div`
  overflow: hidden;
  overflow-y: auto;
  height: 100%;
  padding-top: 8px;
  > div:nth-child(n + 2) {
    border-top: 1px dashed ${({ theme }) => theme.box.border};
  }
`;

const StyledRowContainer = styled.div<{ hasBorder?: boolean; disabled?: boolean }>`
  align-items: center;
  padding: 1rem 0;
  display: flex;
  flex-direction: row;
  img {
    object-fit: contain;
    height: auto;
  }
  pointer-events: ${({ disabled }) => disabled && 'none'};
  border: solid ${({ theme }) => theme.box.border};
  border-width: ${({ hasBorder }) => (hasBorder ? '1px' : '0px')}; ;
`;

const StyledListInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1;
  margin-left: 1rem;
`;

const StyledListName = styled.div`
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${({ theme }) => theme.text.primary};
`;

const StyledListTokenNumber = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 0.25rem;
  }
  font-size: 0.875rem;
  color: ${({ theme }) => theme.muted};
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 0.25rem;
  }
`;

const StyledVersion = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.muted};
`;

const StyledDropdownMenu = styled(DropdownMenu)`
  padding: 5px;
  min-width: 100px;
  border-radius: 5px;
  display: grid;
  grid-gap: 0.5rem;
  gap: 0.5rem;
  background: ${({ theme }) => theme.box.innerBackground};
`;

const StyleSettingContainer = styled.div`
  margin-left: 5px;
  cursor: pointer;
  color: ${({ theme }) => theme.muted};
  i {
    font-size: 0.75rem;
  }
`;

const StyledButtonWrapper = styled.button<{ btnType: 'danger' | 'info' }>`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 0.5rem;
  }
  font-size: 0.875rem;
  color: ${({ theme, btnType }) => (btnType === 'danger' ? theme.danger : theme.text.primary)};
  i {
    font-size: 0.75rem;
  }
  &:hover {
    color: ${({ theme, btnType }) =>
      btnType === 'danger' ? 'rgb(251 97 97 / 80%)' : theme.muted};
  }
`;
