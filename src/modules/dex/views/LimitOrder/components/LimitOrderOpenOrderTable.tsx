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
import { LimitOrderData } from '../../../models/Graphql';
import LimitOrderButtonCancel from './LimitOrderButtonCancel';
import icInverted from '../../../../../assets/icons/ic-inverted.svg';
import { screenUp } from '../../../../../utils/styles';

export type LimitOrderOrderTableProps = {
  data?: LimitOrderData[];
  loading: boolean;
  onLoad: () => void;
};
export const LimitOrderOpenOrderTable: React.FC<LimitOrderOrderTableProps> = ({
  data,
  loading,
  onLoad,
}) => {
  const nativeToken = useNativeToken();
  const [states, setStates] = useState<boolean[]>([]);

  useEffect(() => {
    data?.forEach((t, index) => {
      states.push(false);
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
      if (params.id === ETH_ADDRESS.toLowerCase()) {
        return {
          decimals: nativeToken.decimals,
          symbol: nativeToken.symbol,
          address: isAddress(params?.id) || '',
          native: true,
        };
      }
      return {
        ...params,
        decimals: parseInt(params?.decimals),
        address: isAddress(params?.id) || '',
        native: false,
      };
    },
    [nativeToken?.decimals, nativeToken?.symbol],
  );

  const columns: TableColumn<LimitOrderData>[] = [
    {
      id: 'inputCurrency',
      name: 'From',
      width: '19%',
      cell: (row) => {
        const token = getTokenDetail(row?.inputToken);
        return (
          <StyledCurrency>
            <DexTokenSymbol
              address={token?.native ? nativeToken.symbol : token?.address}
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
      width: '19%',
      cell: (row) => {
        const token = getTokenDetail(row?.outputToken);
        return (
          <StyledCurrency>
            <DexTokenSymbol
              address={token?.native ? nativeToken.symbol : token?.address}
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
      name: 'Limit price',
      width: '22%',
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
      id: 'expiresIn',
      name: 'Expires in',
      width: '18%',
      cell: (row) => {
        return (
          <StyledTime>
            {parseInt(row.expiryTimestamp) > 0 ? (
              <Timestamp secs={+row.expiryTimestamp} />
            ) : (
              <span>Never</span>
            )}
          </StyledTime>
        );
      },
    },
    {
      id: 'createdAt',
      name: 'Created at',
      width: '18%',
      cell: (row) => {
        return (
          <StyledTime>
            {' '}
            <Timestamp secs={+row.createdAt} />
          </StyledTime>
        );
      },
    },
    {
      id: 'action',
      width: '4%',
      cell: (row) => <LimitOrderButtonCancel order={row} onLoad={onLoad} />,
    },
  ];
  return <DataTable data={data} columns={columns} loading={loading} />;
};

const StyledTime = styled.div`
  font-size: 14px;
`;
export const StyledCurrency = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 14px;
  .symbol {
    margin-left: 7px;
  }
`;
export const StyledPriceBox = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;
export const StyledPrice = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

export const StyledInvertedButton = styled.button`
  display: flex;
  align-items: center;
  img {
    filter: opacity(0.8);
    :hover {
      filter: opacity(1);
    }
  }
`;

export const IconRefresh = styled.img`
  width: 13px;
  ${screenUp('lg')`
    width: 15px ;
  `}
`;
