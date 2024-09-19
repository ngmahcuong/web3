import React from 'react';
import styled from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { screenUp } from '../../../../../utils/styles';
import { TokenThreshold } from '../../../../../utils/constants';

const PoolShareInfo: React.FC<{
  shareOfPool: BigNumber;
  estimateAmount: BigNumber;
  bonus?: BigNumber;
  impact?: BigNumber;
}> = ({ estimateAmount, shareOfPool, bonus, impact }) => {
  return (
    <StyledContainer>
      <div className="label">Price Impact</div>
      <StyledInfoBox>
        {bonus ? (
          <div className="item">
            <div className="value">
              <BigNumberValue value={bonus} decimals={18} percentage fractionDigits={4} />
            </div>
            <div className="text">Bonus</div>
          </div>
        ) : (
          <div className="item">
            <div className="value">
              <BigNumberValue value={impact} decimals={18} percentage fractionDigits={4} />
            </div>
            <div className="text">Price Impact</div>
          </div>
        )}

        <div className="item">
          <div className="value">
            <BigNumberValue value={estimateAmount} decimals={18} fractionDigits={6} />
          </div>
          <div className="text">Minimum Received</div>
        </div>
        <div className="item">
          <div className="value">
            <BigNumberValue
              value={shareOfPool}
              decimals={6}
              percentage
              fractionDigits={2}
              threshold={TokenThreshold.DEFAULT}
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
    font-weight: 500;
  }
`;

const StyledInfoBox = styled.div`
  margin: 8px 0 0;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  border: solid 1px ${({ theme }) => theme.box.border};
  .item {
    .text {
      font-size: 14px;
      color: ${({ theme }) => theme.gray3};
      margin-top: 8px;
    }
    .value {
      font-size: 14px;
      color: ${({ theme }) => theme.text.primary};
    }
  }
  ${screenUp('lg')`
    padding: 13px 18px 11px 18px;
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
