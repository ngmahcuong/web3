import { useMulticall } from '@reddotlabs/multicall-react';
import { Currency, Token } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo, useState } from 'react';
import { erc20Interface } from '../../../abis';
import { useAllDexTokens, useCombinedInactiveList } from '../../../state/dex/hooks';
import { isAddress } from '../../../utils/addresses';
import { useDexNativeToken } from './useDexNativeToken';

export const useUniswapToken = (id: string): Currency => {
  const { chainId } = useWeb3React();
  const tokens = useAllDexTokens();
  const inActiveTokens = useCombinedInactiveList();
  const address = isAddress(id);
  const nativeToken = useDexNativeToken();
  const multicall = useMulticall();

  const token = useMemo(() => {
    if (address && chainId) {
      const inactiveTokenInfo = inActiveTokens?.[chainId]?.[address]?.tokenInfo;
      if (tokens?.[address]) return tokens[address];
      if (inactiveTokenInfo)
        return new Token(
          chainId,
          inactiveTokenInfo?.address,
          inactiveTokenInfo?.decimals,
          inactiveTokenInfo?.symbol,
          inactiveTokenInfo?.name,
        );
    }
    return undefined;
  }, [address, chainId, inActiveTokens, tokens]);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState<number>();

  useEffect(() => {
    if (multicall && address && !token && chainId) {
      let mounted = true;
      multicall([
        {
          target: String(address),
          abi: erc20Interface.functions['name()'],
        },
        {
          target: String(address),
          abi: erc20Interface.functions['symbol()'],
        },
        {
          target: String(address),
          abi: erc20Interface.functions['decimals()'],
        },
      ]).then(([[name], [symbol], [decimals]]) => {
        if (mounted) {
          setName(name);
          setSymbol(symbol);
          setDecimals(decimals);
        }
      });

      return () => {
        mounted = false;
      };
    }
  }, [address, chainId, multicall, token]);

  return useMemo(() => {
    if (!chainId || !id) {
      return;
    }
    if (id === nativeToken?.symbol) {
      return nativeToken;
    } else {
      if (token) return token;
      if (decimals && address) {
        return new Token(
          chainId,
          address,
          decimals,
          symbol || 'UNKNOWN',
          name || 'Unknown Token',
        );
      }
      return;
    }
  }, [address, chainId, decimals, id, name, nativeToken, symbol, token]);
};
