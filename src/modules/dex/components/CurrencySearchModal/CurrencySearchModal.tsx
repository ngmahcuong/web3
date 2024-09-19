import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Currency, Token } from '@uniswap/sdk-core';
import CurrencyModalView from './CurrencyModalView';
import { CurrencySearch } from './CurrencySearch';
import { Manage } from './Manage';
import { ImportToken } from './ImportToken';
import { TokenList } from '@uniswap/token-lists';
import { ImportList } from './ImportList';
import Modal from '../../../../components/Modal';
import {
  ModalBackButton,
  ModalCloseButton,
  ModalHeader,
  ModalTitle,
} from '../../../../components/Modal/ModalStyles';
import { screenUp } from '../../../../utils/styles';

interface CurrencySearchModalProps {
  onDismiss?: () => void;
  selectedCurrency?: Currency;
  onCurrencySelect: (currency: Currency) => void;
  isShowCommonBase?: boolean;
}

export const CurrencySearchModal: React.FC<CurrencySearchModalProps> = ({
  onDismiss = () => null,
  onCurrencySelect,
  selectedCurrency,
  isShowCommonBase,
}) => {
  const [view, setView] = useState<CurrencyModalView>(CurrencyModalView.search);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onDismiss?.();
      onCurrencySelect?.(currency);
    },
    [onDismiss, onCurrencySelect],
  );

  // used for import token flow
  const [importToken, setImportToken] = useState<Token | undefined>();

  // used for import list
  const [importList, setImportList] = useState<TokenList | undefined>();
  const [listURL, setListUrl] = useState<string | undefined>();

  const config = {
    [CurrencyModalView.search]: { title: 'Select A Token', onBack: undefined },
    [CurrencyModalView.manage]: {
      title: 'Manage',
      onBack: () => setView(CurrencyModalView.search),
    },
    [CurrencyModalView.importToken]: {
      title: 'Import Tokens',
      onBack: () => setView(CurrencyModalView.search),
    },
    [CurrencyModalView.importList]: {
      title: 'Import List',
      onBack: () => setView(CurrencyModalView.search),
    },
  };

  return (
    <Modal size="xs">
      <StyledModalHeader>
        <StyledModalTitle>
          {config[view].onBack && <ModalBackButton onClick={config[view].onBack} />}
          <StyledTitle>{config[view].title}</StyledTitle>
        </StyledModalTitle>
        <ModalCloseButton onClick={onDismiss} />
      </StyledModalHeader>
      <StyledContainer>
        {view === CurrencyModalView.search ? (
          <CurrencySearch
            onCurrencySelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            showImportView={() => setView(CurrencyModalView.importToken)}
            setImportToken={setImportToken}
            isShowCommonBase={isShowCommonBase}
          />
        ) : view === CurrencyModalView.importToken && importToken ? (
          <ImportToken tokens={[importToken]} handleCurrencySelect={handleCurrencySelect} />
        ) : view === CurrencyModalView.importList && importList && listURL ? (
          <ImportList
            list={importList}
            listUrl={listURL}
            onImport={() => setView(CurrencyModalView.manage)}
          />
        ) : view === CurrencyModalView.manage ? (
          <Manage
            setModalView={setView}
            setImportToken={setImportToken}
            setImportList={setImportList}
            setListUrl={setListUrl}
            handleCurrencySelect={handleCurrencySelect}
          />
        ) : null}
        {view === CurrencyModalView.search && (
          <StyledButtonContainer>
            <StyledButton onClick={() => setView(CurrencyModalView.manage)}>
              <span>Manage List Token</span>
            </StyledButton>
          </StyledButtonContainer>
        )}
      </StyledContainer>
    </Modal>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.box.itemBackground};
  height: 100%;
  color: #fff;
  padding: 12px 16px;
  ${screenUp('lg')`
    height: 550px;
    max-height: 92vh;
  `}
`;

const StyledModalHeader = styled(ModalHeader)`
  padding: 13px 9px 14px 15px;
`;

const StyledTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px 0;
  border-top: 1px solid ${({ theme }) => theme.box.border};
`;

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
  font-size: 16px;
  color: ${({ theme }) => theme.success};
  font-weight: 500;
  i {
    font-size: 20px;
  }
  :hover {
    span {
      text-decoration: underline;
    }
  }
`;

const StyledModalTitle = styled(ModalTitle)`
  display: flex;
  align-items: center;
`;
