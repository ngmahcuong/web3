import { gql } from 'graphql-request';
import { Block } from './type';

export const GET_TOKEN_PRICES = (address: string, blocks: Block[]) => {
  return gql`
    query prices {
      ${blocks.map((block) => {
        return `t${block.timestamp}:token(id:"${address}", block: { number: ${block.number} }) {
          derivedETH
        }`;
      })},
      ${blocks.map((block) => {
        return `b${block.timestamp}:bundle(id:"1", block: { number: ${block.number} }) {
          ethPrice
        }`;
      })}
    }
  `;
};

export const GET_MARKETS = gql`
  query getMarkets {
    markets {
      id
      totalSupplyUsd
    }
  }
`;
