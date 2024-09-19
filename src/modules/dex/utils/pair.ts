import { Token } from '@uniswap/sdk-core';
import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { getFactoryAddress, getPairCodeHash } from '../../../config';

export const computePairAddress = (chainId: number, tokenA: Token, tokenB: Token): string => {
  const initCodeHash = getPairCodeHash(chainId);
  const factoryAddress = getFactoryAddress(chainId);
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]),
    initCodeHash,
  );
};
