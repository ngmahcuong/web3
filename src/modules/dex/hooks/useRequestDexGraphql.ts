import { useCallback } from 'react';
import { GET_TOKEN_PRICES } from '../../../graphql/queries';
import { Block } from '../../../graphql/type';
import { useGraphQLClient } from '../../../providers/GraphProvider';
import { TokenPrice } from '../models/Graphql';

export const useRequestDexGraphql = () => {
  const { dexClient: client } = useGraphQLClient();

  const getTokenPrices = useCallback(
    (address: string, blocks: Block[]) =>
      client.request(GET_TOKEN_PRICES(address, blocks)).then<TokenPrice[]>((data) => {
        const filterData = Object.fromEntries(
          Object.entries(data).filter(([, v]) => v != null),
        );
        const map = new Map<string, TokenPrice>();
        Object.keys(filterData)?.forEach((k) => {
          const value = filterData[k] as {
            timestamp: number;
            derivedETH: string;
            ethPrice: string;
          };
          const timestamp = k.split('t')[1] || k.split('b')[1];
          const item = timestamp && map.get(timestamp);
          timestamp &&
            map.set(timestamp, {
              tokenAddress: address,
              timestamp: +timestamp,
              derivedETH: parseFloat(value?.derivedETH) || item?.derivedETH,
              ethPrice: parseFloat(value?.ethPrice) || item?.ethPrice,
            });
        });
        return Array.from(map.values());
      }),
    [client],
  );

  return {
    getTokenPrices,
  };
};
