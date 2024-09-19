import { getUnixTime, subDays, subWeeks } from 'date-fns';
import { gql, GraphQLClient } from 'graphql-request';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EthPrice } from '../modules/dex/models/Graphql';
import { useGraphQLClient } from '../providers/GraphProvider';
import { Block } from './type';

export const ONE_DAY_UNIX = 24 * 60 * 60;
export const ONE_HOUR_SECONDS = 3600;

const GET_BLOCKS = (timestamps: number[]) => {
  return gql`
    query blocks {
      ${timestamps.map((timestamp) => {
        return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
          timestamp + 600
        } }) {
            number
            timestamp
          }`;
      })}
    }
  `;
};

const GET_ETH_PRICES = gql`
  query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
    current: bundles(first: 1, subgraphError: allow) {
      ethPrice
    }
    oneDay: bundles(first: 1, block: { number: $block24 }, subgraphError: allow) {
      ethPrice
    }
    twoDay: bundles(first: 1, block: { number: $block48 }, subgraphError: allow) {
      ethPrice
    }
    oneWeek: bundles(first: 1, block: { number: $blockWeek }, subgraphError: allow) {
      ethPrice
    }
  }
`;

export const useDeltaTimestamps = (): {
  t: number;
  t24: number;
  t48: number;
  tWeek: number;
} => {
  const now = new Date();
  const timeZoneOffset = now.getTimezoneOffset();
  const t = getUnixTime(now) + timeZoneOffset * 60;
  const t24 = getUnixTime(subDays(now, 1)) + timeZoneOffset * 60;
  const t48 = getUnixTime(subDays(now, 2)) + timeZoneOffset * 60;
  const tWeek = getUnixTime(subWeeks(now, 1)) + timeZoneOffset * 60;
  return { t, t24, t48, tWeek };
};

export const useBlocks = (timestamps: number[]) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const ref = useRef<number[]>(timestamps);
  const { blockClient: client } = useGraphQLClient();

  useEffect(() => {
    if (!ref.current?.length) return;
    client?.request(GET_BLOCKS(ref.current)).then((data) => {
      const blockData = Object.keys(data)?.map((k) => data[k]?.[0]);
      setBlocks(blockData);
    });
  }, [client]);

  return blocks;
};

export const useBlock = (timestamp: number) => {
  return useBlocks([timestamp])?.[0];
};

export const getEthPrices = (client: GraphQLClient, blocks?: number[]) =>
  blocks &&
  client
    ?.request(GET_ETH_PRICES, {
      block24: blocks[0],
      block48: blocks[1] ?? 1,
      blockWeek: blocks[2] ?? 1,
    })
    .then<EthPrice>((data) => {
      return data
        ? {
            current: parseFloat(data.current[0].ethPrice ?? '0'),
            oneDay: parseFloat(data.oneDay[0]?.ethPrice ?? '0'),
            twoDay: parseFloat(data.twoDay[0]?.ethPrice ?? '0'),
            week: parseFloat(data.oneWeek[0]?.ethPrice ?? '0'),
          }
        : undefined;
    });

export function useEthPrices(): EthPrice | undefined {
  const [prices, setPrices] = useState<EthPrice | undefined>();

  const { t24, t48, tWeek } = useDeltaTimestamps();
  const blocks = useBlocks([t24, t48, tWeek]);

  const blockNumbers = useMemo(() => {
    return blocks?.map((b) => +b?.number || 0);
  }, [blocks]);

  const { dexClient: client } = useGraphQLClient();

  useEffect(() => {
    async function fetch() {
      if (!client || !blocks.length) return;
      const data = await getEthPrices(client, blockNumbers);
      setPrices(data);
    }
    if (!prices && blocks) {
      fetch();
    }
  }, [blockNumbers, blocks, client, prices]);

  return prices;
}
