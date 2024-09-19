import { fromUnixTime, getUnixTime, startOfHour, sub } from 'date-fns';
import { gql } from 'graphql-request';
import { times } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ONE_DAY_UNIX, ONE_HOUR_SECONDS, useBlocks } from '../../../graphql/hooks';
import { Block } from '../../../graphql/type';
import { useGraphQLClient } from '../../../providers/GraphProvider';
import {
  DerivedPairDataNormalized,
  PairDataNormalized,
  TimeWindowEnum,
  PairDayDatasResponse,
  PairHoursDatasResponse,
  PairPricesNormalized,
} from '../models/Graphql';
import { useRequestDexGraphql } from './useRequestDexGraphql';
import { useUniswapFactory } from './useUniswapFactory';

const PAIRS_HOURS_DATA = gql`
  query pairHourDatas($pairId: String, $first: Int) {
    pairHourDatas(
      first: $first
      where: { pair: $pairId }
      orderBy: hourStartUnix
      orderDirection: desc
    ) {
      id
      hourStartUnix
      reserve0
      reserve1
      reserveUSD
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

const LAST_PAIR_HOUR_ID = gql`
  query lastPairHourId($pairId: String) {
    pairHourDatas(
      first: 1
      where: { pair: $pairId }
      orderBy: hourStartUnix
      orderDirection: desc
    ) {
      id
    }
  }
`;

const PAIRS_HOURS_DATA_BY_ID = gql`
  query pairHourDatasByIds($pairIds: [String]) {
    pairHourDatas(where: { id_in: $pairIds }, orderBy: hourStartUnix, orderDirection: desc) {
      id
      hourStartUnix
      reserve0
      reserve1
      reserveUSD
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

const PAIR_DAY_DATAS = gql`
  query pairDayDatas($pairId: String, $first: Int) {
    pairDayDatas(
      first: $first
      where: { pairAddress: $pairId }
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      reserve0
      reserve1
      reserveUSD
      pairAddress {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

const LAST_PAIR_DAY_ID = gql`
  query lastPairDayId($pairId: String) {
    pairDayDatas(
      first: 1
      where: { pairAddress: $pairId }
      orderBy: date
      orderDirection: desc
    ) {
      id
    }
  }
`;

const PAIR_DAY_DATAS_BY_IDS = gql`
  query pairDayDatasByIdsQuery($pairIds: [String]) {
    pairDayDatas(where: { id_in: $pairIds }, orderBy: date, orderDirection: desc) {
      id
      date
      reserve0
      reserve1
      reserveUSD
      pairAddress {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

type useFetchPairPricesParams = {
  token0Address: string;
  token1Address: string;
  timeWindow: TimeWindowEnum;
  currentSwapPrice: {
    [key: string]: number;
  };
};

type normalizePairDataByActiveTokenParams = {
  pairData: PairDataNormalized;
  activeToken: string;
};

const normalizeDerivedChartData = (data: any) => {
  if (!data?.token0DerivedEth || data?.token0DerivedEth.length === 0) {
    return [];
  }
  return data?.token0DerivedEth.reduce((acc, token0DerivedEthEntry) => {
    const token1DerivedEthEntry = data?.token1DerivedEth?.find(
      (entry) => entry.timestamp === token0DerivedEthEntry.timestamp,
    );
    if (!token1DerivedEthEntry) {
      return acc;
    }
    return [
      ...acc,
      {
        time: parseInt(token0DerivedEthEntry.timestamp, 10),
        token0Id: token0DerivedEthEntry.tokenAddress,
        token1Id: token1DerivedEthEntry.tokenAddress,
        token0DerivedETH: token0DerivedEthEntry.derivedETH,
        token1DerivedETH: token1DerivedEthEntry.derivedETH,
      },
    ];
  }, []);
};

const normalizeChartData = (
  data: PairHoursDatasResponse | PairDayDatasResponse | null,
  timeWindow: TimeWindowEnum,
) => {
  switch (timeWindow) {
    case TimeWindowEnum.DAY:
    case TimeWindowEnum.WEEK:
      return (data as PairHoursDatasResponse)?.pairHourDatas?.map((fetchPairEntry) => ({
        time: fetchPairEntry.hourStartUnix,
        token0Id: fetchPairEntry.pair.token0.id,
        token1Id: fetchPairEntry.pair.token1.id,
        reserve0: parseFloat(fetchPairEntry.reserve0),
        reserve1: parseFloat(fetchPairEntry.reserve1),
      }));
    case TimeWindowEnum.MONTH:
    case TimeWindowEnum.YEAR:
      return (data as PairDayDatasResponse)?.pairDayDatas?.map((fetchPairEntry) => ({
        time: fetchPairEntry.date,
        token0Id: fetchPairEntry.pairAddress.token0.id,
        token1Id: fetchPairEntry.pairAddress.token1.id,
        reserve0: parseFloat(fetchPairEntry.reserve0),
        reserve1: parseFloat(fetchPairEntry.reserve1),
      }));
    default:
      return null;
  }
};

const normalizePairDataByActiveToken = ({
  pairData,
  activeToken,
}: normalizePairDataByActiveTokenParams): PairPricesNormalized =>
  pairData?.length &&
  pairData
    ?.map((pairPrice) => ({
      time: fromUnixTime(pairPrice.time),
      value:
        activeToken === pairPrice?.token0Id
          ? pairPrice.reserve1 / pairPrice.reserve0
          : pairPrice.reserve0 / pairPrice.reserve1,
    }))
    .reverse();

type normalizeDerivedPairDataByActiveTokenParams = {
  pairData: DerivedPairDataNormalized;
  activeToken: string;
};

const normalizeDerivedPairDataByActiveToken = ({
  pairData,
  activeToken,
}: normalizeDerivedPairDataByActiveTokenParams): PairPricesNormalized =>
  pairData?.length &&
  pairData?.map((pairPrice) => ({
    time: fromUnixTime(pairPrice.time),
    value:
      activeToken === pairPrice?.token0Id
        ? pairPrice.token0DerivedETH / pairPrice.token1DerivedETH
        : pairPrice.token1DerivedETH / pairPrice.token0DerivedETH,
  }));

const pairHasEnoughLiquidity = (
  data: PairHoursDatasResponse | PairDayDatasResponse | null,
  timeWindow: TimeWindowEnum,
) => {
  const liquidityThreshold = 10000;
  switch (timeWindow) {
    case TimeWindowEnum.DAY:
    case TimeWindowEnum.WEEK: {
      const amountOfDataPoints = (data as PairHoursDatasResponse)?.pairHourDatas?.length ?? 1;
      const totalUSD = (data as PairHoursDatasResponse)?.pairHourDatas?.reduce(
        (totalLiquidity, fetchPairEntry) => {
          return totalLiquidity + parseFloat(fetchPairEntry.reserveUSD);
        },
        0,
      );
      return totalUSD / amountOfDataPoints > liquidityThreshold;
    }
    case TimeWindowEnum.MONTH:
    case TimeWindowEnum.YEAR: {
      const amountOfDataPoints = (data as PairDayDatasResponse)?.pairDayDatas?.length ?? 1;
      const totalUSD = (data as PairDayDatasResponse)?.pairDayDatas?.reduce(
        (totalLiquidity, fetchPairEntry) => {
          return totalLiquidity + parseFloat(fetchPairEntry.reserveUSD);
        },
        0,
      );
      return totalUSD / amountOfDataPoints > liquidityThreshold;
    }
    default:
      return null;
  }
};

const getPairSequentialId = (id: string, pairId: string) => id.replace(`${pairId}-`, '');

const getIdsByTimeWindow = (
  pairAddress: string,
  pairLastId: string,
  timeWindow: TimeWindowEnum,
  idsCount: number,
) => {
  const pairLastIdAsNumber = Number(pairLastId);
  if (timeWindow === TimeWindowEnum.DAY) {
    return [];
  }
  return times(
    idsCount,
    (value) =>
      `${pairAddress}-${pairLastIdAsNumber - value * timeWindowGapMapping[timeWindow]}`,
  );
};

const timeWindowIdsCountMapping: Record<TimeWindowEnum, number> = {
  [TimeWindowEnum.DAY]: 24,
  [TimeWindowEnum.WEEK]: 28,
  [TimeWindowEnum.MONTH]: 30,
  [TimeWindowEnum.YEAR]: 24,
};

const timeWindowGapMapping: Record<TimeWindowEnum, number | null> = {
  [TimeWindowEnum.DAY]: null,
  [TimeWindowEnum.WEEK]: 6, // Each datapoint 6 hours apart
  [TimeWindowEnum.MONTH]: 1, // Each datapoint 1 day apart
  [TimeWindowEnum.YEAR]: 15, // Each datapoint 15 days apart
};

const getInterval = (timeWindow: TimeWindowEnum) => {
  switch (timeWindow) {
    case TimeWindowEnum.DAY:
      return ONE_HOUR_SECONDS;
    case TimeWindowEnum.WEEK:
      return ONE_HOUR_SECONDS * 4;
    case TimeWindowEnum.MONTH:
      return ONE_DAY_UNIX;
    case TimeWindowEnum.YEAR:
      return ONE_DAY_UNIX * 15;
    default:
      return ONE_HOUR_SECONDS * 4;
  }
};

const getSkipDaysToStart = (timeWindow: TimeWindowEnum) => {
  switch (timeWindow) {
    case TimeWindowEnum.DAY:
      return 1;
    case TimeWindowEnum.WEEK:
      return 7;
    case TimeWindowEnum.MONTH:
      return 30;
    case TimeWindowEnum.YEAR:
      return 365;
    default:
      return 7;
  }
};

export const useFetchPairPrices = ({
  token0Address,
  token1Address,
  timeWindow,
  currentSwapPrice,
}: useFetchPairPricesParams) => {
  const [pairId, setPairId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pairData, setPairData] = useState(undefined);
  const [derivedPairData, setDerivedPairData] = useState(undefined);
  const factory = useUniswapFactory();
  const interval = getInterval(timeWindow);
  const endTimestamp = getUnixTime(new Date());
  const startTimestamp = getUnixTime(
    startOfHour(sub(endTimestamp * 1000, { days: getSkipDaysToStart(timeWindow) })),
  );
  const timestamps = [];
  let time = startTimestamp;
  while (time <= endTimestamp) {
    timestamps.push(time);
    time += interval;
  }
  const blocks = useBlocks(timestamps);
  const { getTokenPrices } = useRequestDexGraphql();
  const { dexClient: client } = useGraphQLClient();

  const fetchPairDerivedPriceData = useCallback(
    async (token0Address: string, token1Address: string, blocks: Block[]) => {
      if (!blocks || blocks.length === 0) {
        return null;
      }

      const token0DerivedEth = await getTokenPrices(token0Address, blocks);
      const token1DerivedEth = await getTokenPrices(token1Address, blocks);
      return { token0DerivedEth, token1DerivedEth };
    },
    [getTokenPrices],
  );

  const fetchPairPriceData = useCallback(
    async (pairId: string, timeWindow: TimeWindowEnum) => {
      try {
        switch (timeWindow) {
          case TimeWindowEnum.DAY: {
            const data = await client?.request(PAIRS_HOURS_DATA, { pairId, first: 24 });
            return { data, error: false };
          }
          case TimeWindowEnum.WEEK: {
            const lastPairHourIdData = await client?.request(LAST_PAIR_HOUR_ID, { pairId });
            const lastId = lastPairHourIdData?.pairHourDatas
              ? lastPairHourIdData.pairHourDatas[0]?.id
              : null;
            if (!lastId) {
              return { data: { pairHourDatas: [] }, error: false };
            }
            const pairHourId = getPairSequentialId(lastId, pairId);
            const pairHourIds = getIdsByTimeWindow(
              pairId,
              pairHourId,
              timeWindow,
              timeWindowIdsCountMapping[timeWindow],
            );

            const pairHoursData = await client?.request(PAIRS_HOURS_DATA_BY_ID, {
              pairIds: pairHourIds,
            });
            return { data: pairHoursData, error: false };
          }
          case TimeWindowEnum.MONTH: {
            const data = await client?.request(PAIR_DAY_DATAS, {
              pairId,
              first: timeWindowIdsCountMapping[timeWindow],
            });
            return { data, error: false };
          }
          case TimeWindowEnum.YEAR: {
            const lastPairDayIdData = await client?.request(LAST_PAIR_DAY_ID, { pairId });
            const lastId = lastPairDayIdData?.pairDayDatas
              ? lastPairDayIdData.pairDayDatas[0]?.id
              : null;
            if (!lastId) {
              return { data: { pairDayDatas: [] }, error: false };
            }
            const pairLastId = getPairSequentialId(lastId, pairId);
            const pairDayIds = getIdsByTimeWindow(
              pairId,
              pairLastId,
              timeWindow,
              timeWindowIdsCountMapping[timeWindow],
            );
            const pairDayData = await client?.request(PAIR_DAY_DATAS_BY_IDS, {
              pairIds: pairDayIds,
            });
            return { data: pairDayData, error: false };
          }
          default:
            return { data: null, error: false };
        }
      } catch (error) {
        console.error('Failed to fetch price chart data', error);
        return { error: true };
      }
    },
    [client],
  );

  useEffect(() => {
    const fetchDerivedData = async () => {
      try {
        const derivedData = await fetchPairDerivedPriceData(
          token0Address,
          token1Address,
          blocks,
        );
        if (derivedData) {
          const normalizedDerivedData = normalizeDerivedChartData(derivedData);
          setDerivedPairData({ pairData: normalizedDerivedData, pairId, timeWindow });
        } else {
          setDerivedPairData({ pairData: [], pairId, timeWindow });
        }
      } catch (error) {
        setDerivedPairData({ pairData: [], pairId, timeWindow });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAndUpdatePairPrice = async () => {
      setIsLoading(true);
      const { data } = await fetchPairPriceData(pairId, timeWindow);
      if (data) {
        const hasEnoughLiquidity = pairHasEnoughLiquidity(data, timeWindow);
        const newPairData = normalizeChartData(data, timeWindow) || [];
        if (newPairData.length > 0 && hasEnoughLiquidity) {
          setPairData({ pairData: newPairData, pairId, timeWindow });
          setIsLoading(false);
        } else {
          setPairData({ pairData: [], pairId, timeWindow });
          await fetchDerivedData();
        }
      } else {
        setPairData({ pairData: [], pairId, timeWindow });
        await fetchDerivedData();
      }
    };

    if (!pairData && !derivedPairData && pairId && !isLoading) {
      fetchAndUpdatePairPrice();
    }
  }, [
    pairId,
    timeWindow,
    pairData,
    currentSwapPrice,
    token0Address,
    token1Address,
    derivedPairData,
    isLoading,
    fetchPairDerivedPriceData,
    blocks,
    fetchPairPriceData,
  ]);

  useEffect(() => {
    const updatePairId = async () => {
      try {
        const pairAddress = (
          await factory?.getPair(token0Address, token1Address)
        ).toLowerCase();
        if (pairAddress !== pairId) {
          setPairId(pairAddress);
        }
      } catch (error) {
        setPairId(null);
      }
    };
    if (token0Address && token1Address) {
      updatePairId();
    }
  }, [token0Address, token1Address, pairId, factory]);

  const normalizedPairData = useMemo(
    () =>
      normalizePairDataByActiveToken({
        activeToken: token0Address,
        pairData: pairData?.pairData,
      }),
    [token0Address, pairData],
  );

  const normalizedDerivedPairData = useMemo(
    () =>
      normalizeDerivedPairDataByActiveToken({
        activeToken: token0Address,
        pairData: derivedPairData?.pairData || [],
      }),
    [token0Address, derivedPairData],
  );

  const hasSwapPrice = currentSwapPrice && currentSwapPrice[token0Address] > 0;
  const normalizedPairDataWithCurrentSwapPrice =
    normalizedPairData?.length > 0 && hasSwapPrice
      ? [...normalizedPairData, { time: new Date(), value: currentSwapPrice[token0Address] }]
      : normalizedPairData;

  const normalizedDerivedPairDataWithCurrentSwapPrice =
    normalizedDerivedPairData?.length > 0 && hasSwapPrice
      ? [
          ...normalizedDerivedPairData,
          { time: new Date(), value: currentSwapPrice[token0Address] },
        ]
      : normalizedDerivedPairData;

  const hasNoDirectData =
    normalizedPairDataWithCurrentSwapPrice &&
    normalizedPairDataWithCurrentSwapPrice?.length === 0;
  const hasNoDerivedData =
    normalizedDerivedPairDataWithCurrentSwapPrice &&
    normalizedDerivedPairDataWithCurrentSwapPrice?.length === 0;

  // undefined is used for loading
  let pairPrices = hasNoDirectData && hasNoDerivedData ? [] : undefined;
  if (
    normalizedPairDataWithCurrentSwapPrice &&
    normalizedPairDataWithCurrentSwapPrice?.length > 0
  ) {
    pairPrices = normalizedPairDataWithCurrentSwapPrice;
  } else if (
    normalizedDerivedPairDataWithCurrentSwapPrice &&
    normalizedDerivedPairDataWithCurrentSwapPrice?.length > 0
  ) {
    pairPrices = normalizedDerivedPairDataWithCurrentSwapPrice;
  }
  return { pairPrices, pairId };
};
