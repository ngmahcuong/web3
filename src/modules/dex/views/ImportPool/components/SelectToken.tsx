import { Currency } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import styled from 'styled-components';
import useModal from '../../../../../hooks/useModal';
import { screenUp } from '../../../../../utils/styles';
import NO_NAME from '../../../../../assets/tokens/NO_NAME.png';
import { CurrencySearchModal } from '../../../components/CurrencySearchModal/CurrencySearchModal';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';

export type SelectTokenProps = {
  currency: Currency;
  onCurrencySelect?: (currency: Currency) => void;
};
export const SelectToken: React.FC<SelectTokenProps> = ({ currency, onCurrencySelect }) => {
  const currencySearchModal = useMemo(
    () => <CurrencySearchModal onCurrencySelect={onCurrencySelect} />,
    [onCurrencySelect],
  );
  const [showCurrencySearchModal] = useModal(currencySearchModal, 'SelectToken');

  return (
    <StyledToken selectToken={!currency?.symbol} onClick={showCurrencySearchModal}>
      {currency ? (
        <DexTokenSymbol
          address={currency?.isNative ? currency?.symbol : currency?.wrapped?.address}
          size={36}
        />
      ) : (
        <img src={NO_NAME} width={36} alt="Select Token" />
      )}
      <div className="info">
        <div className="symbol">
          {currency?.symbol ? (
            <span>{currency?.symbol}</span>
          ) : (
            <span className="select-token">Select a token</span>
          )}
          <i className="far fa-angle-down"></i>
        </div>
      </div>
    </StyledToken>
  );
};

const StyledToken = styled.button<{ selectToken: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 14px;
  background-color: ${(p) => p.theme.input.background};
  border: solid 1px ${(p) => p.theme.input.border};
  img {
    width: 36px;
    height: 36px;
  }
  .info {
    width: 100%;
    display: flex;
    font-size: 16px;
    color: ${({ theme }) => theme.text.primary};
    margin-left: 8px;
    flex-direction: column;
    align-items: flex-start;
    .symbol {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: bold;
      justify-content: space-between;
      width: 100%;
      i {
        color: ${({ theme }) => theme.gray3};
        margin-left: 5px;
        font-size: 18px;
      }
      .select-token {
        color: ${({ theme }) => theme.success};
      }
      span {
        line-height: 1;
      }
    }
  }
  ${screenUp('lg')`
    .info {
      .symbol {
        font-size: 16px;
      }
    }
  `}
`;
