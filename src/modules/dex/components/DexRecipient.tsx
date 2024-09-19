import { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useIsExpertMode } from '../../../state/dex/hooks';
import { ExploreAddressView } from './ExploreAddressView';

export type DexRecipientProps = {
  invalid?: boolean;
  recipient?: string;
  onChangeRecipient?: (recipient?: string) => void;
};

export const DexRecipient: React.FC<DexRecipientProps> = ({
  invalid,
  recipient,
  onChangeRecipient,
}) => {
  const isExpertMode = useIsExpertMode();
  const [isOpenRecipient, setOpenRecipient] = useState<boolean>(false);
  const onRecipientClick = useCallback(() => {
    setOpenRecipient(!isOpenRecipient);
    onChangeRecipient(undefined);
  }, [isOpenRecipient, onChangeRecipient]);

  const onInputChange = useCallback(
    (ev?: ChangeEvent<HTMLInputElement>) => {
      onChangeRecipient?.(ev?.target?.value);
    },
    [onChangeRecipient],
  );

  const onRemoveRecipient = useCallback(() => {
    onChangeRecipient(undefined);
  }, [onChangeRecipient]);

  return isExpertMode ? (
    <StyleRecipientContainer>
      {isOpenRecipient ? (
        <StyleRemoveRecipient onClick={onRecipientClick}>
          Recipient
          <StyleRemoveRecipientContent>
            <i className={'fal fa-minus'}></i>
            Remove recipient
          </StyleRemoveRecipientContent>
        </StyleRemoveRecipient>
      ) : (
        <StyleAddRecipient onClick={onRecipientClick}>
          <i className={'fal fa-plus'}></i>
          <span>Add a recipient (optional)</span>
        </StyleAddRecipient>
      )}
      {isOpenRecipient ? (
        <StyledInputContainer invalid={invalid}>
          <StyleInput
            placeholder={'Wallet address'}
            type="text"
            value={recipient ?? ''}
            onChange={onInputChange}
          />
          {recipient?.length > 0 ? (
            <StyleButtonClear onClick={onRemoveRecipient}>
              <i className={'far fa-times'}></i>
            </StyleButtonClear>
          ) : (
            <></>
          )}
        </StyledInputContainer>
      ) : (
        <></>
      )}
      <StyledLink>
        <ExploreAddressView
          visible={isOpenRecipient && recipient && !invalid}
          address={recipient}
        />
      </StyledLink>
    </StyleRecipientContainer>
  ) : (
    <></>
  );
};

const StyledLink = styled.div`
  width: fit-content;
`;

const StyleButtonClear = styled.button`
  color: ${({ theme }) => theme.text.primary};
`;

const StyleAddRecipient = styled.button`
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.success};
  font-weight: 500;
  i {
    margin-right: 4px;
  }
  &:hover {
    color: ${({ theme }) => theme.button.primary.hover};
  }
`;

const StyleRemoveRecipient = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.text.muted};
  cursor: pointer;
`;

const StyleRemoveRecipientContent = styled.button`
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme }) => theme.success};
  i {
    margin-right: 4px;
  }
  &:hover {
    color: ${({ theme }) => theme.button.primary.hover};
  }
`;

const StyleRecipientContainer = styled.div``;

const StyleInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  font-size: '16px';
  color: ${({ theme }) => theme.text.primary};
`;

const StyledInputContainer = styled.div<{ invalid?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.input.background};
  border: ${({ invalid, theme }) =>
    invalid ? `1px solid ${theme?.danger}` : `1px solid ${theme?.input.border}`};
  width: 100%;
  padding: 16px 14px;
  margin: 13px 0px 8px 0px;
`;
