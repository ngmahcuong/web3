import { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';
import { pager } from '../../../graphql/pager';
import { useGraphQLClient } from '../../../providers/GraphProvider';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { useLastUpdated } from '../../../state/application/hooks';
import { LimitOrderData } from '../models/Graphql';

const OPEN_ORDER = gql`
  query orders($owner: String) {
    orders(
      where: { owner: $owner, status: created }
      skip: $skip
      orderDirection: desc
      orderBy: createdAt
    ) {
      inputAmount
      inputToken {
        decimals
        id
        name
        symbol
      }
      outputToken {
        decimals
        id
        name
        symbol
      }
      id
      status
      createdAt
      recipient
      outputAmount
      expiryTimestamp
      createdAt
      actualOutputAmount
      submitTimestamp
    }
  }
`;

export const useLimitOrderListOrder = () => {
  const { limitOrderClient: client } = useGraphQLClient();
  const { account } = useUserWallet();

  const [data, setData] = useState<LimitOrderData[]>();
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState<number>(0);
  const lastUpdated = useLastUpdated();

  const fetchData = useCallback(
    (flag) => {
      if (!client || !account) return;
      if (flag === 0) {
        setLoading(true);
      }
      pager<{ orders: LimitOrderData[] }>(
        OPEN_ORDER,
        {
          owner: account.toLowerCase(),
        },
        client,
      )
        .then((res) => {
          setData(res.orders);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [account, client],
  );

  useEffect(() => {
    fetchData(flag);
  }, [flag, fetchData, lastUpdated]);

  const onLoad = useCallback(() => {
    setFlag(flag + 1);
  }, [flag]);

  return {
    data,
    loading,
    onLoad,
  };
};
