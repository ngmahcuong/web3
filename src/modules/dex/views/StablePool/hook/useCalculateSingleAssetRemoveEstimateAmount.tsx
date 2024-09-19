import { useMemo, useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
import { useContract } from '../../../../../hooks/useContract';

export const useCalculateSingleAssetRemoveEstimateAmount = (
  amount: BigNumber,
  basepool: string,
  zapBasepool: string,
  usingZap: boolean,
  tokenIndex: number,
) => {
  const basepoolContract = useContract('basePool', basepool);
  const zapContract = useContract('stableSwapZap', zapBasepool);
  const [outputAmount, setOutputAmount] = useState<BigNumber>();

  useEffect(() => {
    if (!basepoolContract || !zapContract || !amount) {
      setOutputAmount(undefined);
      return;
    }
    let mount = true;
    try {
      const call = usingZap
        ? zapContract.calculateRemoveLiquidityOneToken(basepool, amount, tokenIndex)
        : basepoolContract.calculateRemoveLiquidityOneToken(amount, tokenIndex);
      call?.then((data) => {
        if (!mount) {
          return;
        }
        setOutputAmount(data);
      });
    } catch (ex) {
      setOutputAmount(undefined);
    }
    return () => {
      mount = false;
    };
  }, [amount, basepool, basepoolContract, tokenIndex, usingZap, zapContract]);

  return useMemo(() => {
    return outputAmount;
  }, [outputAmount]);
};
