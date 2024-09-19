import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo, useState } from 'react';
import { getOfficialPairs } from '../../../config';
import { useLastUpdated } from '../../../state/application/hooks';
import { PairInfo, PairTokens } from '../models/Pair';
import { useFetchMultiplePairInfos } from './useFetchMultiplePairInfos';

export const useOfficialPairs = (): PairInfo[] => {
  const fetchMultiplePairInfos = useFetchMultiplePairInfos();
  const lastUpdated = useLastUpdated();
  const [infos, setInfos] = useState<PairInfo[]>([]);
  const { chainId } = useWeb3React();

  const trackedPairs = useMemo(() => {
    return getOfficialPairs(chainId).map((item) => {
      return {
        currencyA: item[0].sortsBefore(item[1]) ? item[0] : item[1],
        currencyB: item[0].sortsBefore(item[1]) ? item[1] : item[0],
      } as PairTokens;
    });
  }, [chainId]);

  useEffect(() => {
    fetchMultiplePairInfos(trackedPairs).then((data) => {
      setInfos(data);
    });
  }, [fetchMultiplePairInfos, trackedPairs, lastUpdated]);

  return useMemo(() => {
    return infos;
  }, [infos]);
};
