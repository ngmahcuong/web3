import { useEffect, useMemo, useState } from 'react';
import { GET_MARKETS } from '../graphql/queries';
import { useProtocol } from '../modules/dex/hooks/useProtocol';
import { Market } from '../modules/lending/models/Graphql';
import { useGraphQLClient } from '../providers/GraphProvider';

export const useTvl = () => {
  const protocol = useProtocol();
  const { lendingClient: client } = useGraphQLClient();
  const [marketTvl, setMarketTvl] = useState<number>();

  useEffect(() => {
    if (!client) return;
    client.request(GET_MARKETS).then((data) => {
      const markets = data.markets as Market[];
      setMarketTvl(markets?.reduce((current, next) => current + +next.totalSupplyUsd, 0));
    });
  }, [client]);

  return useMemo(() => {
    return marketTvl + protocol?.liquidityUSD;
  }, [marketTvl, protocol?.liquidityUSD]);
};
