import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Timestamp } from '../../../../../components/Timestamp';
import { useNativeToken } from '../../../../../hooks/useNativeToken';
import { isAddress } from '../../../../../utils/addresses';
import { ETH_ADDRESS, Precision } from '../../../../../utils/constants';
import DataTable, { TableColumn } from '../../../components/DataTable/DataTable';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import { LimitOrderData, LimitOrderStatus } from '../../../models/Graphql';
import icInverted from '../../../../../assets/icons/ic-inverted.svg';
import {
  IconRefresh,
  StyledInvertedButton,
  StyledPrice,
  StyledPriceBox,
} from './LimitOrderOpenOrderTable';

export type LimitOrderOrderHistoryTableProps = {
  data?: LimitOrderData[];
  loading: boolean;
};
export const LimitOrderOrderHistoryTable: React.FC<LimitOrderOrderHistoryTableProps> = ({
  data,
  loading,
}) => {
  const nativeToken = useNativeToken();
  const [states, setStates] = useState<boolean[]>([]);

  useEffect(() => {
    data?.forEach((t, index) => {
      states?.push(false);
    });
    setStates(states);
  }, [data, states]);

  const onChainTypePrice = useCallback((index: number, value: boolean) => {
    setStates((t) => {
      t[index] = !value;
      return [...t];
    });
  }, []);

  const getTokenDetail = useCallback(
    (params?: { id?: string; name?: string; symbol?: string; decimals?: string }) => {
      if (params?.id === ETH_ADDRESS.toLowerCase()) {
        return {
          decimals: nativeToken.decimals,
          symbol: nativeToken.symbol,
          address: isAddress(params?.id) || '',
          native: true,
        };
      } else {
        return {
          ...params,
          decimals: parseInt(params?.decimals),
          address: isAddress(params?.id) || '',
        };
      }
    },
    [nativeToken?.decimals, nativeToken?.symbol],
  );

  const columns: TableColumn<LimitOrderData>[] = [
    {
      id: 'inputCurrency',
      name: 'From',
      width: '20%',
      cell: (row) => {
        const token = getTokenDetail(row?.inputToken);
        return (
          <StyledCurrency>
            <DexTokenSymbol
              address={token?.native ? nativeToken?.symbol : token?.address}
              size={30}
            />
            <div className="symbol">
              <BigNumberValue
                value={BigNumber.from(row.inputAmount)}
                decimals={+token.decimals}
                fractionDigits={6}
                keepCommas
                threshold={0.000001}
              />
              {` ${token?.symbol}`}
            </div>
          </StyledCurrency>
        );
      },
    },
    {
      id: 'outputCurrency',
      name: 'To',
      width: '20%',
      cell: (row) => {
        const token = getTokenDetail(row?.outputToken);
        return (
          <StyledCurrency>
            <DexTokenSymbol
              address={token?.native ? nativeToken?.symbol : token?.address}
              size={30}
            />
            <div className="symbol">
              <BigNumberValue
                value={BigNumber.from(row.outputAmount)}
                decimals={+token.decimals}
                fractionDigits={6}
                keepCommas
                threshold={0.000001}
              />
              {` ${token?.symbol}`}
            </div>
          </StyledCurrency>
        );
      },
    },
    {
      id: 'limitPrice',
      name: 'Price',
      width: '25%',
      cell: (row, index) => {
        const inputToken = getTokenDetail(row?.inputToken);
        const outputToken = getTokenDetail(row?.outputToken);
        return (
          <StyledPriceBox>
            {!states[index] ? (
              <StyledPrice>
                1 {inputToken.symbol} ={' '}
                <BigNumberValue
                  value={BigNumber.from(row.outputAmount)
                    .mul(Precision)
                    .div(BigNumber.from(row.inputAmount))}
                  decimals={18 + outputToken.decimals - inputToken.decimals}
                  fractionDigits={6}
                  keepCommas
                  threshold={0.000001}
                />
                {` ${outputToken.symbol}`}
              </StyledPrice>
            ) : (
              <StyledPrice>
                1 {outputToken.symbol} ={' '}
                <BigNumberValue
                  value={BigNumber.from(row.inputAmount)
                    .mul(Precision)
                    .div(BigNumber.from(row.outputAmount))}
                  decimals={18 + inputToken.decimals - outputToken.decimals}
                  fractionDigits={6}
                  keepCommas
                  threshold={0.000001}
                />
                {` ${inputToken.symbol}`}
              </StyledPrice>
            )}

            <StyledInvertedButton onClick={() => onChainTypePrice(index, states[index])}>
              <IconRefresh src={icInverted} />
            </StyledInvertedButton>
          </StyledPriceBox>
        );
      },
    },
    {
      id: 'createdAt',
      name: 'Created at',
      width: '20%',
      cell: (row) => {
        return <Timestamp secs={+row.createdAt} />;
      },
    },
    {
      id: 'status',
      name: 'Status',
      width: '15%',
      cell: (row) => {
        return (
          <StyledStatus status={row.status}>
            <span>
              {row.status === 'executed'
                ? 'Completed'
                : row.status === 'cancelled'
                ? 'Cancelled'
                : ''}
            </span>
          </StyledStatus>
        );
      },
    },
  ];
  return <DataTable data={data} columns={columns} loading={loading} />;
};

const StyledCurrency = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 14px;
  .symbol {
    margin-left: 7px;
  }
`;

const StyledStatus = styled.div<{ status: LimitOrderStatus }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ status, theme }) =>
    status === 'cancelled'
      ? theme.text.muted
      : status === 'executed'
      ? theme.success
      : theme.text.primary};
  i {
    margin-right: 3px !important;
  }
`;
