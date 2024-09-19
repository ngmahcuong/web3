import { Token } from '@uniswap/sdk-core';
import { Fragment, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import iconWarning from '../../../../../../assets/icons/ic-warning.svg';
import { Button } from '../../../../../../components/Buttons';
import { Checkbox } from '../../../../../../components/Checkbox';
import Modal from '../../../../../../components/Modal';
import { ModalCloseButton, ModalProps } from '../../../../../../components/Modal/ModalStyles';
import { useAddUserToken } from '../../../../../../state/dex/hooks';
import { screenUp } from '../../../../../../utils/styles';
import { DexTokenSymbol } from '../../../../components/DexTokenSymbol';
import { ExploreAddressView } from '../../../../components/ExploreAddressView';

export type ImportTokenModalProps = ModalProps & {
  onCancel?: () => void;
  tokens?: Token[];
};

export const ImportTokenModal: React.FC<ImportTokenModalProps> = ({
  onDismiss,
  onCancel,
  tokens,
}) => {
  const [isUnderstand, setIsUnderstand] = useState(false);
  const addToken = useAddUserToken();

  const onContinue = useCallback(() => {
    tokens?.forEach((token) => addToken(token));
    onDismiss();
  }, [addToken, onDismiss, tokens]);

  const onCancelImport = useCallback(() => {
    onDismiss();
    onCancel();
  }, [onDismiss, onCancel]);

  useEffect(() => {
    if (!tokens.length) {
      onDismiss();
    }
  }, [onDismiss, tokens]);

  return (
    <Modal size="xs">
      <StyleHeader>
        <span>Token import</span>
        <StyledModalCloseButton onClick={onCancelImport} />
      </StyleHeader>
      <StyledModalBody>
        {[
          `Anyone can create a token on Aurora with any name, including creating fake versions of
          existing tokens and tokens that claim to represent projects that do not have a token.`,
          `This interface can load arbitrary tokens by token addresses. Please take extra
          caution and do your research when interacting with arbitrary tokens.`,
          `If you purchase an arbitrary token, you may be unable to sell it back.`,
        ].map((item, index) => {
          return (
            <StyledWarning key={`warning-content-${index}`}>
              <img src={iconWarning} alt={'import-warning'} width={18} />
              <StyledText>{item}</StyledText>
            </StyledWarning>
          );
        })}
        <StyleTokenWrapper>
          {tokens.map((token, index) => {
            return (
              <Fragment key={`wrapper-${index}`}>
                <StyledTokenInput>
                  <div className="left">
                    <DexTokenSymbol size={30} address={token?.wrapped?.address} />
                    {token?.name ? `${token?.name} (${token?.symbol})` : `(${token?.symbol})`}
                  </div>
                  <ExploreAddressView visible address={token?.wrapped?.address} />
                </StyledTokenInput>
                {tokens.length > 1 && index !== tokens.length - 1 && <StyledSeparate />}
              </Fragment>
            );
          })}
        </StyleTokenWrapper>
        <StyledCheckboxWrapper>
          <Checkbox
            text="I understand"
            onClick={() => setIsUnderstand(!isUnderstand)}
            active={isUnderstand}
          />
        </StyledCheckboxWrapper>
        <StyledButtonContinue block size="md" disabled={!isUnderstand} onClick={onContinue}>
          Continue
        </StyledButtonContinue>
      </StyledModalBody>
    </Modal>
  );
};

const StyledModalBody = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  padding: 12px 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  grid-gap: 10px;
  font-size: 14px;
  ${screenUp('lg')`
      font-size: 16px;
  `}
`;

const StyleHeader = styled.div`
  background-color: ${({ theme }) => theme.box.innerBackground};
  display: flex;
  padding: 13px 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  span {
    flex: 1;
  }
`;

const StyledTokenInput = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  img {
    margin-right: 8px;
  }
  .left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
  }
`;

const StyleTokenWrapper = styled.div`
  background-color: ${({ theme }) => theme.box.innerBackground};
`;

const StyledSeparate = styled.div`
  border-top: solid 1px ${({ theme }) => theme.box.border};
  margin: 0px 10px;
`;

const StyledModalCloseButton = styled(ModalCloseButton)`
  color: ${({ theme }) => theme.gray3};
`;

const StyledCheckboxWrapper = styled.div`
  margin-top: 10px;
`;

const StyledWarning = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.text.primary};
  margin-left: 8px;
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const StyledButtonContinue = styled(Button)`
  height: 42px;
  margin: 10px 0px 5px 0px;
  ${screenUp('lg')`
      font-size: 16px;
      height: 46px;
  `}
`;
