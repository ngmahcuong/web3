import { getUnixTime } from 'date-fns';
import { gql } from 'graphql-request';
import { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ButtonLink, ButtonLinkOutline } from '../../../../components/Buttons';
import { ONE_DAY_UNIX } from '../../../../graphql/hooks';
import { pager } from '../../../../graphql/pager';
import useDebounce from '../../../../hooks/useDebounce';
import { useGraphQLClient } from '../../../../providers/GraphProvider';
import { usePoolsData } from '../../../../state/analytic/hooks';
import { PoolData } from '../../../../state/analytic/reducer';
import { TIMESTAMP_START } from '../../../../utils/constants';
import { screenUp } from '../../../../utils/styles';
import { Chart, ChartData } from '../../models/Graphql';
import { getChange } from '../../utils/number';
import { LiquidityChart } from './components/LiquidityChart';
import PoolTable from './components/PoolTable';
import SearchInput from './components/SearchInput';
import { VolumeChart } from './components/VolumeChart';

const GET_PROTOCOL_CHART = gql`
  query dayDatas($startTime: Int!, $skip: Int!) {
    dayDatas(
      first: 1000
      skip: $skip
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;

const Pools: FC = () => {
  const [{ data: pools, loading }] = usePoolsData();
  const [filterPools, setFilterPools] = useState<PoolData[]>();
  const [keyword, setKeyword] = useState('');
  const debouncedInput = useDebounce(keyword?.toLowerCase(), 200);
  const handleInputChange = useCallback((event) => {
    const input = event.target.value;
    setKeyword(input);
  }, []);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const { dexClient: client } = useGraphQLClient();

  useEffect(() => {
    if (!client) {
      return;
    }
    pager<{ dayDatas: Chart[] }>(
      GET_PROTOCOL_CHART,
      {
        startTime: TIMESTAMP_START,
      },
      client,
    )
      .then((chartData) => {
        const formatted = chartData?.dayDatas?.reduce(
          (acc: { [date: number]: ChartData }, dayData, i) => {
            const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0));
            acc[roundedDate] = {
              date: dayData.date,
              volumeUSD: parseFloat(dayData.dailyVolumeUSD),
              volumeUSDChange: getChange(
                parseFloat(dayData.dailyVolumeUSD),
                i > 0 ? Object.values(acc)[i - 1]?.volumeUSD : 0,
              ),
              liquidityUSD: parseFloat(dayData.totalLiquidityUSD),
              liquidityUSDChange: getChange(
                parseFloat(dayData.totalLiquidityUSD),
                i > 0 ? Object.values(acc)[i - 1]?.liquidityUSD : 0,
              ),
            };
            return acc;
          },
          {},
        );
        let timestamp = Object.values(formatted)?.[0]?.date;
        let latestLiquidityUSD = Object.values(formatted)?.[0]?.liquidityUSD ?? 0;
        let latestLiquidityUSDChange = Object.values(formatted)?.[0]?.liquidityUSDChange ?? 0;
        const endTimestamp = getUnixTime(new Date());
        while (timestamp < endTimestamp - ONE_DAY_UNIX) {
          timestamp += ONE_DAY_UNIX;
          const dayOrdinal = parseInt((timestamp / ONE_DAY_UNIX).toFixed(0), 10);
          if (!Object.keys(formatted).includes(dayOrdinal.toString())) {
            formatted[dayOrdinal] = {
              date: timestamp,
              volumeUSD: 0,
              volumeUSDChange: 0,
              liquidityUSD: latestLiquidityUSD,
              liquidityUSDChange: latestLiquidityUSDChange,
            };
          } else {
            latestLiquidityUSD = formatted[dayOrdinal].liquidityUSD;
            latestLiquidityUSDChange = formatted[dayOrdinal].liquidityUSDChange;
          }
        }
        setChartData(Object.values(formatted));
      })
      .finally(() => setLoadingChart(false));
  }, [client]);

  useEffect(() => {
    if (!pools?.length || !client) return;
    if (!debouncedInput || !keyword) {
      setFilterPools(pools);
      return;
    }
    setFilterPools(
      pools.filter((p) => {
        return (
          p?.token0?.name?.toLowerCase().includes(debouncedInput?.toLowerCase()) ||
          p?.token1?.name?.toLowerCase().includes(debouncedInput?.toLowerCase()) ||
          p?.token0?.symbol?.toLowerCase().includes(debouncedInput?.toLowerCase()) ||
          p?.token1?.symbol?.toLowerCase().includes(debouncedInput?.toLowerCase()) ||
          p?.tokens?.some(
            (t) =>
              t.name?.toLowerCase().includes(debouncedInput?.toLowerCase()) ||
              t.symbol?.toLowerCase().includes(debouncedInput?.toLowerCase()),
          )
        );
      }),
    );
  }, [client, debouncedInput, pools, keyword]);
  return (
    <BoxContainer>
      <StyledBox>
        <StyledChartWrapper>
          <LiquidityChart chartData={chartData} loading={loadingChart} />
          <VolumeChart chartData={chartData} loading={loadingChart} />
        </StyledChartWrapper>
        <StyledHeaderBox>
          <StyledFlex>
            <SearchInput keyword={keyword} handleInputChange={handleInputChange} />
          </StyledFlex>
          <StyledActions>
            <StyledButtonImport to={'/pools/import'}>
              <i className="far fa-download"></i>
              <span>Import Pool</span>
            </StyledButtonImport>
            <StyledButtonCreateLP to={'/pools/add/ETH'}>
              <i className="far fa-plus"></i>
              <span>Create New Pool</span>
            </StyledButtonCreateLP>
          </StyledActions>
        </StyledHeaderBox>
        <PoolTable pools={filterPools} loading={loading} />
      </StyledBox>
    </BoxContainer>
  );
};

const BoxContainer = styled.div`
  color: ${({ theme }) => theme.text.primary};
`;

const StyledBox = styled.div`
  padding: 15px 0;
  ${screenUp('lg')`
    padding: 24px 0;
  `}
`;

const StyledHeaderBox = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 14px;
  flex-direction: column;
  .label {
    font-size: 20px;
    font-weight: 500;
  }
  ${screenUp('lg')`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  `}
`;

const StyledFlex = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  span {
  }
  .text {
    margin-left: 10px;
  }
  ${screenUp('lg')`
    width: unset;
  `}
`;

const StyledActions = styled(StyledFlex)`
  margin-top: 20px;
  ${screenUp('lg')`
    margin-top: 0;
  `}
`;

const StyledButtonImport = styled(ButtonLinkOutline)`
  font-size: 14px;
  width: 50%;
  i {
    margin-right: 7px;
    font-size: 0.875rem;
  }
  ${screenUp('lg')`
    font-size: 16px;
  `}
`;

const StyledButtonCreateLP = styled(ButtonLink)`
  margin-left: 10px;
  font-size: 14px;
  width: 50%;
  i {
    margin-right: 7px;
    font-size: 0.875rem;
    margin-bottom: 0;
  }
  ${screenUp('lg')`
    font-size: 16px;
    margin-left: 16px;
    width: 183px;
  `}
`;

const StyledChartWrapper = styled.div`
  margin-bottom: 32px;
  min-width: 0px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  > * + * {
    margin-top: 24px;
  }
  ${screenUp('lg')`
    flex-wrap: nowrap;
    > * + * {
    margin-left: 24px;
    margin-top: 0;
    }
  `}
`;

export default Pools;
