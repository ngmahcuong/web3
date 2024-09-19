import { Zero } from '@ethersproject/constants';
import { Call } from '@reddotlabs/multicall';
import { useMulticall } from '@reddotlabs/multicall-react';
import { BigNumber } from 'ethers';
import { flatten, forEach } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useBlockNumber, useLastUpdated } from '../../../state/application/hooks';
import { LendingPrecision } from '../../../utils/constants';
import { Market } from '../models/Lending';
import { useComptroller } from './useComptroller';
import { useAllMarkets } from './useLendingMarkets';

export const useUserRewardAccrued = () => {
  const { chainId, account } = useUserWallet();
  const multicall = useMulticall();
  const lastUpdate = useLastUpdated();
  const comptroller = useComptroller();
  const markets = useAllMarkets();
  const lastBlockNumber = useBlockNumber();
  const [value, setValue] = useState<BigNumber>();

  const calculateRewardBorrowIndex = useCallback(
    (market: Market, borrowIndex, borrowSpeed, borrowStateIndex, borrowStateBlock) => {
      const deltaBlocks = BigNumber.from(lastBlockNumber).sub(borrowStateBlock);
      if (deltaBlocks.gt(0) && borrowSpeed.gt(0)) {
        const borrowAmount = market.totalBorrows.mul(LendingPrecision).div(borrowIndex);
        const rewardAccrued = deltaBlocks.mul(borrowSpeed);
        const ratio = borrowAmount?.gt(0)
          ? rewardAccrued.mul(LendingPrecision).mul(LendingPrecision).div(borrowAmount)
          : Zero;
        const index = borrowStateIndex.add(ratio);
        return index;
      } else if (deltaBlocks.gt(0)) {
        return borrowIndex;
      }
      return Zero;
    },
    [lastBlockNumber],
  );

  const calculateBorrowerReward = useCallback(
    (borrowIndex, marketBorrowIndex, rewardBorrowerIndex, borrowBalance) => {
      if (rewardBorrowerIndex.gt(0)) {
        if (borrowIndex.lt(rewardBorrowerIndex)) {
          return Zero;
        }
        const deltaIndex = borrowIndex.sub(rewardBorrowerIndex);
        const borrowerAmount = borrowBalance.mul(LendingPrecision).div(marketBorrowIndex);
        return borrowerAmount.mul(deltaIndex).div(LendingPrecision).div(LendingPrecision);
      }
      return Zero;
    },
    [],
  );

  const calculateRewardSupplyIndex = useCallback(
    (market: Market, supplyStateIndex, supplyStateBlock, supplySpeed) => {
      const deltaBlocks = BigNumber.from(lastBlockNumber).sub(supplyStateBlock);
      if (deltaBlocks.gt(0) && supplySpeed.gt(0)) {
        const rewardAccrued = deltaBlocks.mul(supplySpeed);
        const ratio = market.totalSupply.gt(0)
          ? rewardAccrued.mul(LendingPrecision).mul(LendingPrecision).div(market.totalSupply)
          : Zero;
        const index = supplyStateIndex.add(ratio);
        return index;
      } else if (deltaBlocks.gt(0)) {
        return supplyStateIndex;
      }
      return Zero;
    },
    [lastBlockNumber],
  );

  const calculateSupplierReward = useCallback(
    (balance, supplyIndex, rewardSupplierIndex, rewardInitialIndex) => {
      if (rewardSupplierIndex.eq(0) && supplyIndex.gt(0)) {
        rewardSupplierIndex = rewardInitialIndex;
      }
      if (supplyIndex.lt(rewardSupplierIndex)) {
        return Zero;
      }
      const deltaIndex = supplyIndex.sub(rewardSupplierIndex);
      return balance.mul(deltaIndex).div(LendingPrecision).div(LendingPrecision);
    },
    [],
  );

  useEffect(() => {
    if (!multicall || !account || !markets?.length || !chainId || !lastBlockNumber) {
      setValue(Zero);
      return;
    }
    let mounted = true;
    const calls = flatten(
      markets.map((market) => {
        return [
          {
            target: market.marketAddress,
            signature: 'borrowIndex() returns (uint256)',
          },
          {
            target: market.marketAddress,
            signature: 'borrowBalanceStored(address) returns (uint256)',
            params: [account],
          },
          {
            target: market.marketAddress,
            signature: 'balanceOf(address) returns (uint256)',
            params: [account],
          },
          {
            target: comptroller?.address,
            signature: 'rewardBorrowerIndex(address,address) returns (uint256)',
            params: [market.marketAddress, account],
          },
          {
            target: comptroller?.address,
            signature: 'rewardSupplierIndex(address,address) returns (uint256)',
            params: [market.marketAddress, account],
          },
          {
            target: comptroller?.address,
            signature: 'rewardSupplyState(address) returns (uint256, uint256)',
            params: [market.marketAddress],
          },
          {
            target: comptroller?.address,
            signature: 'rewardBorrowState(address) returns (uint256, uint256)',
            params: [market.marketAddress],
          },
        ] as Call[];
      }),
    );
    multicall([
      {
        target: comptroller?.address,
        signature: 'rewardAccrued(address) returns (uint256)',
        params: [account],
      },
      {
        target: comptroller?.address,
        signature: 'rewardInitialIndex() returns (uint256)',
      },
      ...calls,
    ]).then(([[rewardAccrued], [rewardInitialIndex], ...response]) => {
      forEach(markets, (market, i) => {
        const [
          [borrowIndex],
          [borrowBalanceStored],
          [balance],
          [rewardBorrowerIndex],
          [rewardSupplierIndex],
          [supplyStateIndex, supplyStateBlock],
          [borrowStateIndex, borrowStateBlock],
        ] = response?.slice(7 * i, 7 * (i + 1));
        if (!market.isListed) {
          return;
        }
        const borrowIndexMantissa = calculateRewardBorrowIndex(
          market,
          borrowIndex,
          market.compSpeed,
          borrowStateIndex,
          borrowStateBlock,
        );
        rewardAccrued = rewardAccrued?.add(
          calculateBorrowerReward(
            borrowIndexMantissa,
            borrowIndex,
            rewardBorrowerIndex,
            borrowBalanceStored,
          ),
        );
        const supplyIndexMantissa = calculateRewardSupplyIndex(
          market,
          supplyStateIndex,
          supplyStateBlock,
          market.compSpeed,
        );
        rewardAccrued = rewardAccrued?.add(
          calculateSupplierReward(
            balance,
            supplyIndexMantissa,
            rewardSupplierIndex,
            rewardInitialIndex,
          ),
        );
      });
      if (mounted) {
        setValue(rewardAccrued);
      }
    });
    return () => {
      mounted = false;
    };
  }, [
    multicall,
    account,
    lastUpdate,
    comptroller,
    markets,
    chainId,
    lastBlockNumber,
    calculateRewardBorrowIndex,
    calculateBorrowerReward,
    calculateRewardSupplyIndex,
    calculateSupplierReward,
  ]);

  return value;
};
