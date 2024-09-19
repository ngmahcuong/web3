import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import icInverted from '../../../../../assets/icons/ic-inverted.svg';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { Trade } from '../../../../../state/dex/actions';
import { screenUp } from '../../../../../utils/styles';
import { PriceImpactLevel, usePriceImpact } from '../../../hooks/usePriceImpact';

export type SwapSummaryProps = {
  trade?: Trade;
  showSlippage?: boolean;
};

export const SwapSummary: React.FC<SwapSummaryProps> = ({ trade, showSlippage }) => {
  return trade ? (
    <StyledBox>
      <div>
        <SwapPrice trade={trade} />
        <MinimumReceive trade={trade} />
        <PriceImpact priceImpact={trade?.priceImpact} />
        {showSlippage ? <Slippage /> : undefined}
      </div>
    </StyledBox>
  ) : (
    <></>
  );
};
const PriceImpact: React.FC<{
  priceImpact?: number;
}> = ({ priceImpact }) => {
  const { priceImpactLevel, formatted } = usePriceImpact(priceImpact);

  return (
    <SwapSummaryItem
      key={'priceImpact'}
      leftText={priceImpact > 0 ? 'Bonus' : 'Price Impact'}
      rightView={
        priceImpact ? (
          <StyleImpactLevel level={priceImpactLevel}>{formatted}</StyleImpactLevel>
        ) : (
          '-'
        )
      }
    />
  );
};

const MinimumReceive: React.FC<{
  trade?: Trade;
}> = ({ trade }) => {
  return (
    <SwapSummaryItem
      key={'minimumReceive'}
      leftText={'Minimum Received'}
      rightView={
        <BigNumberValue
          value={trade.minAmountOut}
          decimals={trade?.outputCurrency?.decimals}
          fractionDigits={6}
        />
      }
    />
  );
};

export const Slippage: React.FC = () => {
  const slippage = useGetSlippagePrecise();
  return (
    <SwapSummaryItem
      key={'slippage'}
      leftText={'Slippage'}
      rightView={
        <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} />
      }
    />
  );
};

export type SwapPriceProps = {
  trade?: Trade;
};
export const SwapPrice: React.FC<SwapPriceProps> = ({ trade }) => {
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const content = useMemo(() => {
    if (trade?.inputCurrency && trade?.outputCurrency) {
      return showInverted ? (
        <>
          <BigNumberValue value={trade?.priceOutputPerInput} decimals={18} fractionDigits={6} />{' '}
          {trade.outputCurrency.symbol} per {trade.inputCurrency.symbol}
        </>
      ) : (
        <>
          <BigNumberValue value={trade?.priceInputPerOutput} decimals={18} fractionDigits={6} />{' '}
          {trade.inputCurrency.symbol} per {trade.outputCurrency.symbol}
        </>
      );
    } else {
      return '-';
    }
  }, [
    trade?.inputCurrency,
    trade?.outputCurrency,
    trade?.priceOutputPerInput,
    trade?.priceInputPerOutput,
    showInverted,
  ]);

  const onChangeInverted = useCallback(() => {
    setShowInverted(!showInverted);
  }, [showInverted]);

  return (
    <SwapSummaryItemContainer>
      Price
      <span>{content}</span>
      {trade?.inputCurrency && trade?.outputCurrency && (
        <StyledInvertedButton onClick={onChangeInverted}>
          <IconRefresh src={icInverted} />
        </StyledInvertedButton>
      )}
    </SwapSummaryItemContainer>
  );
};

const IconRefresh = styled.img`
  width: 13px;
  ${screenUp('lg')`
    width: 17px ;
  `}
`;

const StyledInvertedButton = styled.button`
  display: block;
  margin: 0 auto 0 auto;
  img {
    filter: opacity(0.8);
    :hover {
      filter: opacity(1);
    }
  }
`;

const SwapSummaryItem: React.FC<{
  leftText?: string;
  rightView?: React.ReactNode | string;
}> = ({ leftText, rightView }) => {
  return (
    <SwapSummaryItemContainer>
      {leftText}
      <span>{rightView}</span>
    </SwapSummaryItemContainer>
  );
};

const StyleImpactLevel = styled.div<{ level?: PriceImpactLevel }>`
  color: ${({ level, theme }) =>
    level ? (level === 'LOW' ? theme.success : theme.danger) : theme.success};
`;

const StyledBox = styled.div``;

const SwapSummaryItemContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.gray3};
  font-size: 14px;
  span {
    margin-left: auto;
    color: ${({ theme }) => theme.box.text};
  }
  button {
    margin: 0;
    padding: 0 0 0 5px;
  }
  :not(:last-child) {
    padding-bottom: 8px;
  }
  ${screenUp('lg')`
   font-size: 16px;
  `}
`;
