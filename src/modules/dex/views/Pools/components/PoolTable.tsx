import { useWeb3React } from '@web3-react/core';
import { getAddress } from 'ethers/lib/utils';
import { FC, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { getTokenByAddress, getWrappedToken } from '../../../../../config';
import { PoolData } from '../../../../../state/analytic/reducer';
import { formatNumber } from '../../../../../utils/numbers';
import { screenUp } from '../../../../../utils/styles';
import DataTable, { TableColumn } from '../../../components/DataTable/DataTable';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';

const PoolTable: FC<{ pools: PoolData[]; loading: boolean }> = ({ pools, loading }) => {
  const history = useHistory();
  const { chainId } = useWeb3React();
  const onRowClick = useCallback(
    (pool: PoolData) => {
      if (pool?.stable) {
        history.push(`/pools/stable/add/${pool?.lpToken}`);
      } else {
        if (pool?.token0 && pool?.token1) {
          const wrapTokenAddress = getWrappedToken(chainId)?.address?.toLocaleLowerCase();
          history.push(
            `/pools/add/${pool?.token0?.id === wrapTokenAddress ? 'ETH' : pool?.token0?.id}/${
              pool?.token1?.id === wrapTokenAddress ? 'ETH' : pool?.token1?.id
            }`,
          );
        }
      }
    },
    [chainId, history],
  );

  const columns: TableColumn<PoolData>[] = [
    {
      id: 'name',
      name: 'Name',
      width: '25%',
      cell: (row) => {
        return row.stable ? (
          <StyledLPInfo onClick={() => onRowClick(row)}>
            <div className="icon">
              {row.tokens?.map((t) => {
                const token = getTokenByAddress(chainId, t.id);
                return <TokenSymbol key={`t-${t.id}`} symbol={token?.symbol} size={36} />;
              })}
            </div>
            <div className="name">
              <span>{row.tokens?.map((t) => t?.symbol).join('/')}</span>
              <span className="label">STABLE</span>
            </div>
          </StyledLPInfo>
        ) : (
          <StyledLPInfo onClick={() => onRowClick(row)}>
            <div className="icon">
              <DexTokenSymbol address={getAddress(row.token0.id)} size={36} />
              <DexTokenSymbol address={getAddress(row.token1.id)} size={36} />
            </div>
            <div className="name">
              {row.token0?.symbol === 'NEAR' ? 'WNEAR' : row.token0?.symbol}/
              {row.token1?.symbol === 'NEAR' ? 'WNEAR' : row.token1?.symbol}
            </div>
          </StyledLPInfo>
        );
      },
    },
    {
      id: 'liquidity',
      name: 'Liquidity',
      cell: (row) =>
        formatNumber(row.liquidityUSD, {
          currency: 'USD',
          compact: false,
          fractionDigits: 0,
        }),
    },
    {
      id: 'volumeUSD',
      name: 'Volume 24h',
      cell: (row) => {
        return formatNumber(row.volumeUSD, {
          currency: 'USD',
          compact: false,
          fractionDigits: 0,
        });
      },
    },
    {
      id: 'volumeUSDWeek',
      name: 'Volume 7d',
      cell: (row) =>
        formatNumber(row.volumeUSDWeek, {
          currency: 'USD',
          compact: false,
          fractionDigits: 0,
        }),
    },
    {
      id: 'fee24h',
      name: 'Fee 24h',
      cell: (row) =>
        formatNumber(row.fee24h, {
          currency: 'USD',
          compact: false,
          fractionDigits: 0,
        }),
    },
    {
      id: 'apr',
      name: 'APR',
      cell: (row) =>
        formatNumber(row.apr, {
          compact: false,
          fractionDigits: 2,
          percentage: true,
        }),
    },
    {
      id: 'action',
      name: '',
      width: '100px',
      cell: (row) => <i className="far fa-angle-right" />,
      center: true,
    },
  ];
  return (
    <DataTable
      data={pools}
      columns={columns}
      loading={loading}
      onRowClicked={onRowClick}
      highlightOnHover
    />
  );
};

export default PoolTable;

const StyledLPInfo = styled.div`
  display: flex;
  flex-direction: column;
  .name {
    font-weight: normal;
    margin-top: 5px;
    font-size: 14px;
    line-height: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .label {
      font-weight: normal;
      font-size: 14px;
      color: ${({ theme }) => theme.badge.color};
      padding: 0 7px;
      background-color: ${({ theme }) => theme.badge.background};
      border-radius: 5px;
      line-height: 1.5;
      margin-top: 3px;
    }
  }
  .icon {
    display: flex;
    img {
      z-index: 1;
      width: 28px;
      &:last-child {
        z-index: 0;
        margin-left: -4px;
      }
    }
  }
  ${screenUp('lg')`
    flex-direction: row;
    align-items: center;
    .name {
      font-weight: 600;
      margin-left: 10px;
      margin-top: 0;
      font-size: 16px;
    }
    img {
      width: 36px;
    }
  `}
`;
