import { useWeb3React } from '@web3-react/core';
import { useContext, useMemo } from 'react';
import { getGraph } from '../config';
import { GraphQLClient } from 'graphql-request';
import React, { createContext } from 'react';

interface GraphContext {
  lendingClient: GraphQLClient;
  blockClient: GraphQLClient;
  limitOrderClient: GraphQLClient;
  dexClient: GraphQLClient;
}

const Context = createContext<GraphContext>({
  lendingClient: null,
  blockClient: null,
  limitOrderClient: null,
  dexClient: null,
});

export const useGraphQLClient = () => useContext(Context);

const GraphProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React();

  const clients: GraphContext = useMemo(() => {
    if (!chainId)
      return {
        lendingClient: null,
        blockClient: null,
        limitOrderClient: null,
        dexClient: null,
      };
    const graph = getGraph(chainId);
    if (!graph) return;
    return {
      lendingClient: new GraphQLClient(`${graph}/lending`),
      blockClient: new GraphQLClient(`${graph}/blocks`),
      limitOrderClient: new GraphQLClient(`${graph}/limitorder`),
      dexClient: new GraphQLClient(`${graph}/dex`),
    };
  }, [chainId]);

  return <Context.Provider value={clients}>{children}</Context.Provider>;
};

export default GraphProvider;
