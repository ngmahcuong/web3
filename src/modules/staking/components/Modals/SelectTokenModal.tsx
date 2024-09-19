import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import Modal, {
  ModalCloseButton,
  ModalHeader,
  ModalTitle,
} from '../../../../components/Modal/ModalStyles';
import { screenUp } from '../../../../utils/styles';
import { ChefPoolItem, getTokenConfig } from '../../../../config';
import { useWeb3React } from '@web3-react/core';
import { TokenSymbol } from '../../../../components/TokenSymbol';

export type SelectTokenModalProps = {
  onDismiss?: () => void;
  lpTokens: ChefPoolItem[];
  onTokenSelect: (index: number) => void;
};

const SelectTokenModal: React.FC<SelectTokenModalProps> = ({
  onDismiss = () => null,
  lpTokens,
  onTokenSelect,
}) => {
  const [tokens, setTokens] = useState<ChefPoolItem[]>(undefined);
  const [searchKey, setSearchKey] = useState<string>(undefined);

  const { chainId } = useWeb3React();
  const handleSelectToken = (index: number) => {
    onTokenSelect(index);
    onDismiss();
  };

  useEffect(() => {
    setTokens(lpTokens);
  }, [lpTokens]);

  const handleInput = useCallback(
    (event) => {
      setSearchKey(event.target.value);
      const result = lpTokens?.filter(
        (x) =>
          x.wantSymbol === event.target.value ||
          getTokenConfig(chainId, x.wantSymbol)
            ?.name?.toLocaleLowerCase()
            .includes(event.target.value.toLocaleLowerCase()) ||
          getTokenConfig(chainId, x.wantSymbol)
            ?.symbol?.toLocaleLowerCase()
            .includes(event.target.value.toLocaleLowerCase()),
      );
      setTokens(result);
    },
    [chainId, lpTokens],
  );
  return (
    <Modal size="xs">
      <StyledModalHeader>
        <StyledModalTitle>
          <StyledTitle>Select a Token</StyledTitle>
        </StyledModalTitle>
        <ModalCloseButton onClick={onDismiss} />
      </StyledModalHeader>
      <StyledContainer>
        <StyledInputContainer>
          <StyledInput
            type="text"
            id="token-search-input"
            placeholder="Search name or paste address"
            autoComplete="off"
            value={searchKey}
            onChange={handleInput}
          />
        </StyledInputContainer>
        <StyledTokenList>
          {tokens?.length > 0 &&
            tokens?.map((x, index) => (
              <StyledTokenItem key={index} onClick={() => handleSelectToken(index)}>
                <TokenSymbol symbol={x.wantTokens[0]} size="32" />
                <TokenSymbol symbol={x.wantTokens[1]} size="32" />
                <span>
                  {x.wantTokens[0]}/{x.wantTokens[1]}
                </span>
                <StyledBalance></StyledBalance>
              </StyledTokenItem>
            ))}
        </StyledTokenList>
      </StyledContainer>
    </Modal>
  );
};

export default SelectTokenModal;

const StyledTokenList = styled.div``;

const StyledTokenItem = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  padding: 4px;
  margin-bottom: 12px;
  align-items: center;
  color: ${(p) => p.theme.text.primary};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.success};
  }
  img {
    & + img {
      position: absolute;
      left: 30px;
    }
  }
  span {
    margin-left: 25px;
  }
`;
const StyledBalance = styled.div`
  margin-left: auto;
`;
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
  color: ${({ theme }) => theme.text.primary};
`;

const StyledInputContainer = styled.div`
  padding: 8px 0 10px 12px;
  background-color: ${({ theme }) => theme.input.background};
  display: flex;
  align-items: center;
  border: 1px solid #e2e0e0;
  margin-bottom: 12px;
`;

const StyledInput = styled.input`
  width: 100%;
  font-size: 16px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  ::placeholder {
    color: ${({ theme }) => theme.gray3};
    font-size: 1em;
  }
`;

const StyledModalTitle = styled(ModalTitle)`
  display: flex;
  align-items: center;
`;
