import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Precision } from '../../../../../utils/constants';

export const WarningMessage: React.FC<{
  marketPrice?: BigNumber;
  limitPrice?: BigNumber;
}> = ({ marketPrice, limitPrice }) => {
  const percentage =
    marketPrice && limitPrice
      ? limitPrice?.sub(marketPrice).mul(Precision).div(marketPrice)
      : undefined;

  if (percentage) {
    if (percentage?.lt(Zero)) {
      return percentage.mul(1e4).gt(parseUnits('-1', 20)) ? (
        <>-0.01% below market</>
      ) : (
        <>
          {<BigNumberValue value={percentage} decimals={18} percentage fractionDigits={2} />}{' '}
          below market
        </>
      );
    } else {
      return percentage.mul(1e4).lt(parseUnits('1', 20)) ? (
        <>0.01% above market</>
      ) : (
        <>
          {<BigNumberValue value={percentage} decimals={18} percentage fractionDigits={2} />}{' '}
          above market
        </>
      );
    }
  }
  return null;
};
