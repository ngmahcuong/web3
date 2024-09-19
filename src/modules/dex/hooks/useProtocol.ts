import { useWeb3React } from '@web3-react/core';
import { gql } from 'graphql-request';
import { useEffect, useMemo, useState } from 'react';
import { useBlocks, useDeltaTimestamps } from '../../../graphql/hooks';
import { useGraphQLClient } from '../../../providers/GraphProvider';
import { useLastUpdated } from '../../../state/application/hooks';
import { Protocol, TrackOrder } from '../models/Graphql';
import { getChange } from '../utils/number';

const GET_PROTOCOL = gql`
  query factories {
    factories(first: 1) {
      id
      totalVolumeUSD
      totalLiquidityUSD
      txCount
      pairCount
    }
  }
`;

const GET_PROTOCOL_BY_BLOCK = (blocks: number[]) => {
  return gql`
    query factories {
      ${blocks.map((block) => {
        return `b${block}:factories(first: 1, block: { number: ${block}}) {
          id
          totalVolumeUSD
          totalLiquidityUSD
          txCount
          pairCount
        }`;
      })}
    }`;
};

const GET_LIMIT_ORDERS = gql`
  query orders {
    factories(first: 1) {
      id
      orderCount
    }
  }
`;

const GET_LIMIT_ORDERS_BY_BLOCK = (blocks: number[]) => {
  return gql`
    query orders {
      ${blocks.map((block) => {
        return `b${block}:factories(first: 1, block: { number: ${block}}) {
          id
          orderCount
        }`;
      })}
    }`;
};

export interface ProtocolData {
  totalVolumeUSD: number; // total trading volume
  volumeUSD: number;
  volumeUSDChange: number; // in 24h, as percentage

  liquidityUSD: number;
  liquidityUSDChange: number; // in 24h, as percentage

  txCount: number;
  txCountChange: number;

  pairCount: number;

  orderCount: number;
  orderCount24: number;
}

export const useProtocol = (): ProtocolData => {
  const { t24, t48 } = useDeltaTimestamps();
  const lastUpdated = useLastUpdated();
  const [data, setData] = useState<ProtocolData>(null);
  const { chainId } = useWeb3React();
  const { dexClient: client, limitOrderClient } = useGraphQLClient();

  const blocks = useBlocks([t24, t48]);

  const blockNumbers = useMemo(() => {
    return blocks?.map((b) => +b?.number || 0);
  }, [blocks]);

  useEffect(() => {
    if (!chainId || !client) return;
    let mounted = true;
    Promise.all([
      client.request(GET_PROTOCOL),
      client?.request(GET_PROTOCOL_BY_BLOCK(blockNumbers)),
      limitOrderClient.request<{ factories: TrackOrder[] }>(GET_LIMIT_ORDERS),
      limitOrderClient?.request(GET_LIMIT_ORDERS_BY_BLOCK(blockNumbers)),
    ])
      .then(([protocol, protocolBlocks, orders, orderByBlocks]) => {
        const data = protocol?.factories?.[0];
        const [data24, data48] = Object.keys(protocolBlocks)?.map<Protocol>(
          (k) => protocolBlocks[k]?.[0],
        );
        const volumeUSD =
          data && data24
            ? parseFloat(data.totalVolumeUSD) - parseFloat(data24.totalVolumeUSD)
            : parseFloat(data?.totalVolumeUSD);

        const volumeOneDayAgo =
          data24 && data48
            ? parseFloat(data24.totalVolumeUSD) - parseFloat(data48.totalVolumeUSD)
            : parseFloat(data24?.totalVolumeUSD);

        const volumeUSDChange = getChange(volumeUSD, volumeOneDayAgo);

        const liquidityUSDChange = getChange(
          parseFloat(data?.totalLiquidityUSD),
          parseFloat(data24?.totalLiquidityUSD),
        );

        const txCount =
          data && data24
            ? parseFloat(data.txCount) - parseFloat(data24.txCount)
            : parseFloat(data?.txCount);

        const txCountOneDayAgo =
          data24 && data48
            ? parseFloat(data24.txCount) - parseFloat(data48.txCount)
            : parseFloat(data24?.txCount);

        const txCountChange = getChange(txCount, txCountOneDayAgo);

        const trackOrders = orders?.factories?.[0];
        const [trackOrders24] = Object.keys(orderByBlocks)?.map<TrackOrder>(
          (k) => orderByBlocks[k]?.[0],
        );
        const orderCount24 =
          trackOrders && trackOrders24
            ? parseInt(trackOrders.orderCount) - parseInt(trackOrders24.orderCount)
            : parseInt(trackOrders?.orderCount);

        if (mounted) {
          setData({
            totalVolumeUSD: parseFloat(data?.totalVolumeUSD),
            volumeUSD,
            volumeUSDChange,
            liquidityUSD: parseFloat(data?.totalLiquidityUSD),
            liquidityUSDChange,
            txCount,
            txCountChange,
            pairCount: data?.pairCount,
            orderCount: parseInt(trackOrders?.orderCount),
            orderCount24,
          });
        }
      })
      .catch(() => {
        setData(undefined);
      });
    return () => {
      mounted = false;
    };
  }, [setData, lastUpdated, blockNumbers, chainId, client, limitOrderClient]);

  return data;
};
