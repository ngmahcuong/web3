import { FC } from 'react';
import styled from 'styled-components';
import { formatNumber } from '../../../../../utils/numbers';
import icDown from '../../../../../assets/icons/ic_down.svg';
import icUp from '../../../../../assets/icons/ic_up.svg';

export const PriceChange: FC<{ value: number }> = ({ value }) => {
  return (
    <StyledValueChange negative={value < 0}>
      {value < 0 ? <img src={icDown} alt="" /> : <img src={icUp} alt="" />}
      <div>
        {formatNumber(Math.abs(value), {
          fractionDigits: 2,
          percentage: true,
        })}
      </div>
    </StyledValueChange>
  );
};

const StyledValueChange = styled.div<{ negative: boolean }>`
  color: ${({ negative, theme }) => (negative ? theme.danger : theme.success)};
  display: flex;
  align-items: center;
  font-weight: normal;
  font-size: 14px;
  font-weight: 500;
  margin-right: 3px;
  img {
    margin-right: 3px;
  }
`;
