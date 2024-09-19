import { Zero } from '@ethersproject/constants';
import { Token } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useAllDexTokenBalances } from '../../../state/dex/hooks';

// compare two token amounts with highest one coming first
function balanceComparator(balanceA?: BigNumber, balanceB?: BigNumber) {
  if (balanceA && balanceB) {
    return balanceA?.gt(balanceB) ? -1 : balanceA?.eq(balanceB) ? 0 : 1;
  }
  if (balanceA && balanceA?.gt(Zero)) {
    return -1;
  }
  if (balanceB && balanceB?.gt(Zero)) {
    return 1;
  }
  return 0;
}

function getTokenComparator(balances: {
  [tokenAddress: string]: BigNumber | undefined;
}): (tokenA: Token, tokenB: Token) => number {
  return function sortTokens(tokenA: Token, tokenB: Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = balances[tokenA.address];
    const balanceB = balances[tokenB.address];

    const balanceComp = balanceComparator(balanceA, balanceB);
    if (balanceComp !== 0) return balanceComp;

    if (tokenA.symbol && tokenB.symbol) {
      // sort by symbol
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1;
    }
    return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0;
  };
}

function useTokenComparator(): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllDexTokenBalances();
  return useMemo(() => getTokenComparator(balances ?? {}), [balances]);
}

export default useTokenComparator;
