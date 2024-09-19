import { Currency } from '@uniswap/sdk-core';
import React from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { screenUp } from '../../../../../utils/styles';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import { CurrencyThreshold } from '../../../../../utils/constants';

export type PoolPositionCardProps = {
  currencyA: Currency;
  currencyB: Currency;
  reserveA: BigNumber;
  reserveB: BigNumber;
};

export const PoolPositionCard: React.FC<PoolPositionCardProps> = ({
  currencyA,
  currencyB,
  reserveA,
  reserveB,
}) => {
  return (
    <StyledBox>
      <div className="label">Pool Allocation</div>
      <StyledTokenDeposited>
        <StyledTokenDepositedInfo>
          <DexTokenSymbol size={30} address={currencyA?.wrapped.address} />
          <div className="name">{currencyA?.symbol}</div>
        </StyledTokenDepositedInfo>
        <div className="value">
          <BigNumberValue
            value={reserveA}
            decimals={currencyA?.decimals}
            fractionDigits={6}
            threshold={CurrencyThreshold}
            keepCommas
          />
        </div>
      </StyledTokenDeposited>
      <StyledTokenDeposited>
        <StyledTokenDepositedInfo>
          <DexTokenSymbol size={30} address={currencyB?.wrapped.address} />
          <div className="name">{currencyB?.symbol}</div>
        </StyledTokenDepositedInfo>
        <div className="value">
          <BigNumberValue
            value={reserveB}
            decimals={currencyB?.decimals}
            fractionDigits={6}
            threshold={CurrencyThreshold}
            keepCommas
          />
        </div>
      </StyledTokenDeposited>
    </StyledBox>
  );
};

const StyledBox = styled.div`
  padding: 12px 10px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  .label {
    color: ${({ theme }) => theme.gray3};
    font-size: 14px;
  }
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledTokenDeposited = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
`;

const StyledTokenDepositedInfo = styled.div`
  display: flex;
  align-items: center;
  .name {
    margin-left: 7px;
  }
`;
