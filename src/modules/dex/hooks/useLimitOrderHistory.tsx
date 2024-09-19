import { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';
import { pager } from '../../../graphql/pager';
import { useGraphQLClient } from '../../../providers/GraphProvider';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { LimitOrderData } from '../models/Graphql';

const CLOSE_ORDER = gql`
  query orders($owner: String) {
    orders(
      where: { owner: $owner, status_not: created }
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
      status
      outputAmount
      expiryTimestamp
      createdAt
      actualOutputAmount
    }
  }
`;

export const useLimitOrderHistory = () => {
  const { limitOrderClient: client } = useGraphQLClient();
  const { account } = useUserWallet();

  const [data, setData] = useState<LimitOrderData[]>();
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState<number>(0);

  useEffect(() => {
    if (!client || !account) return;
    if (flag === 0) {
      setLoading(true);
    }
    pager<{ orders: LimitOrderData[] }>(
      CLOSE_ORDER,
      {
        owner: account.toLowerCase(),
      },
      client,
    )
      .then((res) => {
        setData(res.orders);
      })
      .finally(() => setLoading(false));
  }, [client, account, flag]);

  const onLoad = useCallback(() => {
    setFlag(flag + 1);
  }, [flag]);

  return {
    data,
    loading,
    onLoad,
  };
};
