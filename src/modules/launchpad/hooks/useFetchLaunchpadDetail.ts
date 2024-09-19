import { useMulticall } from '@reddotlabs/multicall-react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { ContractInterfaces } from '../../../abis';
import { getLaunchpadConfigs } from '../../../config';
import { LaunchpadInfo } from '../models';

const useFetchLaunchpadDetail = (address: string) => {
  const multicall = useMulticall();
  const { chainId } = useWeb3React();
  const launchpadConfig = getLaunchpadConfigs(chainId);
  const [info, setInfo] = useState<LaunchpadInfo>();
  useEffect(() => {
    if (!multicall || !launchpadConfig) {
      return;
    }
    let mounted = true;
    multicall([
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['status()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['startTime()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['endTime()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['withdrawDelay()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['salePrice()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['saleAmount()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['minEthPayment()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['maxEthPayment()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['purchaserCount()'],
        params: [],
      },
      {
        target: address,
        abi: ContractInterfaces.launchpadInterface.functions['totalPaymentReceive()'],
        params: [],
      },
    ])
      .then(
        ([
          [status],
          [startTime],
          [endTime],
          [withdrawDelay],
          [salePrice],
          [saleAmount],
          [minEthPayment],
          [maxEthPayment],
          [purchaserCount],
          [totalPaymentReceive],
        ]) => {
          if (!mounted) {
            return;
          }
          const data = {
            status,
            startTime,
            endTime,
            withdrawDelay,
            salePrice,
            saleAmount,
            maxEthPayment,
            minEthPayment,
            purchaserCount,
            totalPaymentReceive,
          } as LaunchpadInfo;
          setInfo(data);
        },
      )
      .catch((error) => {
        console.warn(error);
      });
    return () => {
      mounted = false;
    };
  }, [chainId, launchpadConfig, multicall, address]);

  return info;
};

export default useFetchLaunchpadDetail;
