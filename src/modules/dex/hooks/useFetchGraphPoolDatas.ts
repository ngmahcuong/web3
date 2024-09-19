import { gql } from 'graphql-request';
import { useEffect, useMemo } from 'react';
import { useBlocks, useDeltaTimestamps } from '../../../graphql/hooks';
import { useGraphQLClient } from '../../../providers/GraphProvider';
import { usePoolsData } from '../../../state/analytic/hooks';
import { PoolData } from '../../../state/analytic/reducer';
import { STABLE_SWAP_FEE, SWAP_FEE, SWAP_FEE_PRECISION } from '../../../utils/constants';
import { Pool } from '../models/Graphql';
import { get2DayChange, getChange } from '../utils/number';

const GET_POOLS = gql`
  query pools {
    pools(orderBy: reserveUSD, orderDirection: desc) {
      id
      stable
      reserveUSD
      pair {
        id
        txCount
        token0 {
          id
          symbol
          name
          totalLiquidity
          derivedETH
        }
        token1 {
          id
          symbol
          name
          totalLiquidity
          derivedETH
        }
        reserve0
        reserve1
        reserveUSD
        totalSupply
        trackedReserveETH
        reserveETH
        volumeUSD
        untrackedVolumeUSD
        token0Price
        token1Price
        createdAtTimestamp
      }
      stablePool {
        id
        coins {
          id
          token {
            name
            id
            symbol
          }
        }
        lpToken {
          name
          id
          symbol
        }
        txCount
        reserve
        reserveUSD
        volumeUSD
        virtualPrice
        fee
      }
    }
  }
`;

const GET_POOLS_BY_BLOCKS = (blocks: number[]) => gql`
  query pools {
    ${blocks.map((block) => {
      return `b${block}:pools(block: { number: ${block}}, orderBy: reserveUSD, orderDirection: desc) {
        id
      stable
      reserveUSD
      pair {
        id
        txCount
        token0 {
          id
          symbol
          name
          totalLiquidity
          derivedETH
        }
        token1 {
          id
          symbol
          name
          totalLiquidity
          derivedETH
        }
        reserve0
        reserve1
        reserveUSD
        totalSupply
        trackedReserveETH
        reserveETH
        volumeUSD
        untrackedVolumeUSD
        token0Price
        token1Price
        createdAtTimestamp
      }
      stablePool {
        id
        coins {
          id
          token {
            name
            id
            symbol
          }
        }
        lpToken {
          name
          id
          symbol
        }
        txCount
        reserve
        reserveUSD
        volumeUSD
        virtualPrice
        fee
      }
      }`;
    })}
  }
`;

export const useFetchGraphPoolDatas = () => {
  const [, setPoolsData] = usePoolsData();
  const { t24, t48, tWeek } = useDeltaTimestamps();
  const blocks = useBlocks([t24, t48, tWeek]);
  const { dexClient: client } = useGraphQLClient();

  const blockNumbers = useMemo(() => {
    return blocks?.map((b) => +b?.number || 0);
  }, [blocks]);

  useEffect(() => {
    if (!client || !blockNumbers?.length) return;
    let mounted = true;
    Promise.all([
      client.request<{ pools: Pool[] }>(GET_POOLS),
      client.request(GET_POOLS_BY_BLOCKS(blockNumbers)),
    ])
      .then(([data, poolBlocksData]) => {
        const [data24, data48, dataWeek] = Object.keys(poolBlocksData)?.map<Pool[]>(
          (k) => poolBlocksData[k],
        );
        const formatted = data?.pools.map<PoolData>((pool) => {
          const pool24 = data24?.find((p) => p.id === pool.id);
          const pool48 = data48?.find((p) => p.id === pool.id);
          const poolWeek = dataWeek?.find((p) => p.id === pool.id);
          const [volumeUSD, volumeUSDChange] =
            pool && pool24 && pool48
              ? get2DayChange(
                  pool.stable ? pool?.stablePool?.volumeUSD : pool?.pair?.volumeUSD,
                  pool24?.stable ? pool24?.stablePool?.volumeUSD : pool24?.pair?.volumeUSD,
                  pool48?.stable ? pool48?.stablePool?.volumeUSD : pool48?.pair?.volumeUSD,
                )
              : pool
              ? [
                  parseFloat(
                    pool?.stable ? pool?.stablePool?.volumeUSD : pool?.pair?.volumeUSD,
                  ),
                  0,
                ]
              : [0, 0];

          const volumeUSDWeek =
            pool && poolWeek
              ? parseFloat(pool?.stable ? pool?.stablePool?.volumeUSD : pool?.pair?.volumeUSD) -
                parseFloat(
                  poolWeek?.stable
                    ? poolWeek?.stablePool?.volumeUSD
                    : poolWeek?.pair?.volumeUSD,
                )
              : pool
              ? parseFloat(pool?.stable ? pool?.stablePool?.volumeUSD : pool?.pair?.volumeUSD)
              : 0;

          const liquidityUSDChange =
            pool && pool24
              ? getChange(
                  parseFloat(
                    pool?.stable ? pool?.stablePool?.reserveUSD : pool?.pair?.reserveUSD,
                  ),
                  parseFloat(
                    pool24?.stable ? pool24?.stablePool?.reserveUSD : pool24?.pair?.reserveUSD,
                  ),
                )
              : 0;

          const apr =
            (volumeUSD * (pool.stable ? STABLE_SWAP_FEE : SWAP_FEE) * 365) /
            parseFloat(pool.stable ? pool?.stablePool?.reserveUSD : pool?.pair?.reserveUSD) /
            SWAP_FEE_PRECISION;

          return pool.stable
            ? {
                id: pool.id,
                stable: true,
                volumeUSD,
                volumeUSDChange,
                volumeUSDWeek,
                liquidityUSDChange,
                totalSupply: parseFloat(pool?.stablePool.reserve),
                liquidityUSD: parseFloat(pool?.stablePool.reserveUSD),
                tokens: pool?.stablePool?.coins?.map((c) => {
                  return {
                    id: c.token.id.split('-')?.[0],
                    symbol: c.token.symbol,
                    name: c.token.name,
                  };
                }),
                lpToken: pool?.stablePool?.lpToken?.id,
                fee24h: (volumeUSD * STABLE_SWAP_FEE) / SWAP_FEE_PRECISION,
                apr,
              }
            : {
                id: pool.id,
                stable: pool.stable,
                token0: {
                  id: pool?.pair?.token0.id,
                  name: pool?.pair?.token0.name,
                  symbol: pool?.pair?.token0.symbol,
                  totalLiquidity: parseFloat(pool?.pair?.token0.totalLiquidity),
                },
                token1: {
                  id: pool?.pair?.token1.id,
                  name: pool?.pair?.token1.name,
                  symbol: pool?.pair?.token1.symbol,
                  totalLiquidity: parseFloat(pool?.pair?.token1.totalLiquidity),
                },
                volumeUSD,
                volumeUSDChange,
                volumeUSDWeek,
                liquidityUSDChange,
                token0Price: parseFloat(pool?.pair?.token0Price),
                token1Price: parseFloat(pool?.pair?.token1Price),
                totalSupply: parseFloat(pool?.pair?.totalSupply),
                liquidityUSD: parseFloat(pool?.pair?.reserveUSD),
                reserve0: parseFloat(pool?.pair?.reserve0),
                reserve1: parseFloat(pool?.pair?.reserve1),
                fee24h: (volumeUSD * SWAP_FEE) / SWAP_FEE_PRECISION,
                apr,
              };
        });
        if (mounted) {
          setPoolsData(formatted, false);
        }
      })
      .catch(() => {
        setPoolsData(undefined, false);
      });
    return () => {
      mounted = false;
    };
  }, [blockNumbers, client, setPoolsData]);

  return null;
};
