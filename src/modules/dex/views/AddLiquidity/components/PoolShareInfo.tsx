import React from 'react';
import styled from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Zero } from '@ethersproject/constants';
import { screenUp } from '../../../../../utils/styles';

const PoolShareInfo: React.FC<{
  shareOfPool: BigNumber;
  estimatePriceInputToOutput: BigNumber;
  estimatePriceOutputToInput: BigNumber;
  currencyA: string;
  currencyB: string;
}> = ({
  estimatePriceInputToOutput,
  estimatePriceOutputToInput,
  shareOfPool,
  currencyA,
  currencyB,
}) => {
  return (
    <StyledContainer>
      <div className="label">Price and Pool Share</div>
      <StyledInfoBox>
        <div className="item">
          <div className="value">
            <BigNumberValue
              value={estimatePriceOutputToInput}
              decimals={6}
              fractionDigits={6}
            />
          </div>
          <div className="label">
            {currencyB} per {currencyA}
          </div>
        </div>
        <div className="item">
          <div className="value">
            <BigNumberValue
              value={estimatePriceInputToOutput}
              decimals={6}
              fractionDigits={6}
            />
          </div>
          <div className="label">
            {currencyA} per {currencyB}
          </div>
        </div>
        <div className="item">
          <div className="value">
            <BigNumberValue
              value={shareOfPool || Zero}
              decimals={8}
              fractionDigits={2}
              percentage
            />
          </div>
          <div className="label">Pool Share</div>
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
    .label {
      font-size: 12px;
      color: ${({ theme }) => theme.gray3};
      margin-top: 8px;
    }
    .value {
      font-size: 14px;
      color: ${({ theme }) => theme.text.primary};
    }
  }
  ${screenUp('lg')`
    padding: 13px 25px 11px 22px;
    .item {
      .label {
        font-size: 14px;
        margin-top: 8px;
      }
      .value {
        font-size: 16px;
        text-align: center;
      }
    }

  `}
`;

export default PoolShareInfo;
