import React from 'react';
import styled from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { screenUp } from '../../../../../utils/styles';

const PriceInfo: React.FC<{
  priceA: BigNumber;
  priceB: BigNumber;
  currencyA: string;
  currencyB: string;
}> = ({ priceA, priceB, currencyA, currencyB }) => {
  return (
    <StyledContainer>
      <div className="label">Rates</div>
      <StyledInfoBox>
        <div className="item">
          <div className="value">
            <BigNumberValue value={priceB} decimals={6} fractionDigits={6} />
          </div>
          <div className="label">
            {currencyB} per {currencyA}
          </div>
        </div>
        <div className="item">
          <div className="value">
            <BigNumberValue value={priceA} decimals={6} fractionDigits={6} />
          </div>
          <div className="label">
            {currencyA} per {currencyB}
          </div>
        </div>
      </StyledInfoBox>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-bottom: 20px;
  .label {
    color: ${({ theme }) => theme.gray3};
    font-size: 14px;
  }
`;

const StyledInfoBox = styled.div`
  margin: 8px 0 0;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  border: solid 1px ${({ theme }) => theme.box.border};
  .item {
    display: block;
    .label {
      font-size: 12px;
      color: ${({ theme }) => theme.gray3};
      margin-left: 0;
    }
    .value {
      font-size: 14px;
      color: ${({ theme }) => theme.text.primary};
    }
  }
  ${screenUp('lg')`
    padding: 13px 25px 11px 22px;
    .item {
      display: flex;
      align-items: center;
      .label {
        font-size: 14px;
        margin-left: 4px;
      }
      .value {
        font-size: 16px;
        text-align: center;
      }
    }

  `}
`;

export default PriceInfo;
