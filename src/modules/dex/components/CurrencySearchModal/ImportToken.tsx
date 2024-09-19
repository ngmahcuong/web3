import { Currency, Token } from '@uniswap/sdk-core';
import { FC } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/Buttons';
import { ExplorerLink } from '../../../../components/ExplorerLink';
import { useAddUserToken } from '../../../../state/dex/hooks';
import { shortenAddress } from '../../../../utils/addresses';
import { DexTokenSymbol } from '../DexTokenSymbol';

interface ImportProps {
  tokens: Token[];
  handleCurrencySelect?: (currency: Currency) => void;
}

export const ImportToken: FC<ImportProps> = ({ tokens, handleCurrencySelect }) => {
  const addToken = useAddUserToken();

  // use for showing import source on inactive tokens
  return (
    <StyledContainer>
      <StyledWarning>
        <StyledWarningTitle>
          This token doesn't appear on the active token list(s). Make sure this is the token
          that you want to trade.
        </StyledWarningTitle>
        {tokens.map((token, index) => {
          return (
            <StyleWarningTokenWrapper key={index}>
              <StyledWarningToken>
                <DexTokenSymbol address={token?.address} size={36} />
                <StyledTokenInfo>
                  <StyledTokenAddressWrapper>
                    <ExplorerLink address={token.address} type="address">
                      <StyledTokenAddress>{shortenAddress(token.address)}</StyledTokenAddress>
                    </ExplorerLink>
                  </StyledTokenAddressWrapper>
                  <StyledTokenNameWrapper>
                    {token.symbol}
                    <StyledName>{token.name}</StyledName>
                  </StyledTokenNameWrapper>
                </StyledTokenInfo>
                <ExplorerLink address={token.address} type="address">
                  <StyleButtonExplorer>
                    <i className="far fa-external-link" />
                  </StyleButtonExplorer>
                </ExplorerLink>
              </StyledWarningToken>
            </StyleWarningTokenWrapper>
          );
        })}
      </StyledWarning>
      <Button
        block
        onClick={() => {
          tokens.forEach((token) => addToken(token));
          if (handleCurrencySelect) {
            handleCurrencySelect(tokens[0]);
          }
        }}
        size="md"
      >
        Import
      </Button>
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

const StyledWarning = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.gray1};
  border-radius: 2px;
  > * + * {
    margin-top: 1rem;
  }
`;

const StyledWarningTitle = styled.div`
  line-height: 1.5;
  font-size: 14px;
  color: ${({ theme }) => theme.danger};
`;

const StyleWarningTokenWrapper = styled.div`
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.gray1};
`;

const StyledWarningToken = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 1rem;
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

const StyledTokenInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  > * + * {
    margin-top: 2px;
  }
`;

const StyledTokenAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 0.5rem;
  }
`;

const StyledTokenAddress = styled.span`
  line-height: 1.5rem;
  color: ${({ theme }) => theme.text.primary};
`;

const StyledTokenNameWrapper = styled.span`
  color: ${({ theme }) => theme.gray3};
`;

const StyledName = styled.span`
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.muted};
`;
