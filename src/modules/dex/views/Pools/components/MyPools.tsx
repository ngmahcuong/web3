import { Zero } from '@ethersproject/constants';
import { useMulticall } from '@reddotlabs/multicall-react';
import { Currency } from '@uniswap/sdk-core';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ContractInterfaces } from '../../../../../abis';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { Button, ButtonLink, ButtonLinkOutline } from '../../../../../components/Buttons';
import {
  getOfficialPairsAddresses,
  getTokenByAddress,
  getWrappedToken,
} from '../../../../../config';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
import useDebounce from '../../../../../hooks/useDebounce';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import {
  useAllImportedPairAddresses,
  useGetUserPairsInfo,
} from '../../../../../state/dex/hooks';
import { useCurrentAccount, useWatchTokenBalance } from '../../../../../state/user/hooks';
import {
  PercentagePrecision,
  PercentageThreshold,
  TokenThreshold,
} from '../../../../../utils/constants';
import { screenUp } from '../../../../../utils/styles';
import DataTable, { TableColumn } from '../../../components/DataTable/DataTable';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import SearchInput from './SearchInput';
import imgWallet from '../../../../../assets/images/lockdrop-wallet.png';
import imgNoLiquidity from '../../../../../assets/images/no-pool.png';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
type PoolRow = {
  currencyA: Currency;
  currencyB: Currency;
  lpBalance: BigNumber;
  lpSupply: BigNumber;
  poolShare: BigNumber;
  lpToken: string;
  stable: boolean;
};

const MyPools: React.FC = () => {
  const { account } = useUserWallet();
  const { chainId } = useWeb3React();
  const currentAccount = useCurrentAccount();
  const [connect] = useModalConnectWallet();
  const { pairs, loading } = useGetUserPairsInfo();
  const watchTokens = useWatchTokenBalance();
  const importedPairAddresses = useAllImportedPairAddresses();
  const multicall = useMulticall();
  const [lpSupplies, setLpSupplies] = useState([]);
  const history = useHistory();
  const [keyword, setKeyword] = useState('');
  const debouncedInput = useDebounce(keyword?.toLowerCase(), 200);

  const handleInputChange = useCallback((event) => {
    const input = event.target.value;
    setKeyword(input);
  }, []);

  const officialPairAddresses = useMemo(() => {
    return getOfficialPairsAddresses(chainId);
  }, [chainId]);

  useEffect(() => {
    watchTokens(
      officialPairAddresses
        ? officialPairAddresses.concat(importedPairAddresses)
        : importedPairAddresses,
    );
  }, [importedPairAddresses, officialPairAddresses, watchTokens, account]);

  useEffect(() => {
    let mounted = true;
    if (pairs?.length && multicall && lpSupplies?.length < pairs?.length) {
      multicall(
        pairs.map((p) => {
          return {
            target: p.liquidityToken,
            abi: ContractInterfaces.pairInterface.functions['totalSupply()'],
          };
        }),
      ).then((data) => {
        if (!mounted) {
          return;
        }
        setLpSupplies(data.map((x) => x[0]));
      });
    }
    return () => {
      mounted = false;
    };
  }, [pairs, multicall, lpSupplies?.length]);

  const formatedPairs = useMemo(() => {
    if (!pairs?.length || !lpSupplies?.length) return;
    return pairs
      ?.filter(
        (p) =>
          !debouncedInput ||
          p.currencyA?.symbol?.toLowerCase().includes(debouncedInput) ||
          p.currencyB?.symbol?.toLowerCase().includes(debouncedInput) ||
          p.currencyA?.name?.toLowerCase().includes(debouncedInput) ||
          p.currencyB?.name?.toLowerCase().includes(debouncedInput),
      )
      ?.map((p, i) => {
        const lpSupply = lpSupplies[i];
        const poolShare =
          lpSupply && lpSupply.gt(Zero)
            ? p.lpBalance.mul(PercentagePrecision).div(lpSupply)
            : Zero;
        return {
          currencyA: p.currencyA,
          currencyB: p.currencyB,
          lpBalance: p.lpBalance,
          lpSupply,
          poolShare,
          lpToken: p.liquidityToken,
          stable: p.stable,
        } as PoolRow;
      });
  }, [debouncedInput, lpSupplies, pairs]);

  const onRowClick = useCallback(
    (pool: PoolRow) => {
      if (pool?.currencyA && pool?.currencyB) {
        const wrapToken = getWrappedToken(chainId);
        pool.stable
          ? history.push(`/pools/stable/add/${pool.lpToken}`, { fromMyPool: true })
          : history.push(
              `/pools/add/${
                pool?.currencyA?.isNative ||
                pool?.currencyA?.wrapped?.address === wrapToken?.address
                  ? 'ETH'
                  : pool?.currencyA?.wrapped?.address
              }/${
                pool?.currencyB?.isNative ||
                pool?.currencyB?.wrapped?.address === wrapToken?.address
                  ? 'ETH'
                  : pool?.currencyB?.wrapped?.address
              }`,
              { fromMyPool: true },
            );
      }
    },
    [chainId, history],
  );

  const columns: TableColumn<PoolRow>[] = [
    {
      id: 'asset',
      name: 'Asset',
      width: '35%',
      cell: (row) => (
        <StyledLPInfo>
          <div className="icon">
            {row.stable ? (
              <>
                <TokenSymbol
                  symbol={getTokenByAddress(chainId, row?.currencyA.wrapped?.address)?.symbol}
                  size={36}
                />
                <TokenSymbol
                  symbol={getTokenByAddress(chainId, row?.currencyB.wrapped?.address)?.symbol}
                  size={36}
                />
              </>
            ) : (
              <>
                <DexTokenSymbol address={row?.currencyA.wrapped?.address} size={36} />
                <DexTokenSymbol address={row?.currencyB.wrapped?.address} size={36} />
              </>
            )}
          </div>
          <div className="name">
            {row?.currencyA
              ? `${row?.currencyA.symbol === 'NEAR' ? 'WNEAR' : row.currencyA?.symbol}/${
                  row.currencyB?.symbol === 'NEAR' ? 'WNEAR' : row.currencyB?.symbol
                }`
              : ''}
            <div>{row.stable && <span className="label">STABLE</span>}</div>
          </div>
        </StyledLPInfo>
      ),
    },
    {
      id: 'lpBalance',
      name: 'Your Balance',
      width: '20%',
      cell: (row) => (
        <StyledLpBalance>
          <BigNumberValue
            value={row.lpBalance}
            decimals={18}
            fractionDigits={3}
            keepCommas
            threshold={TokenThreshold.DEFAULT}
          />
        </StyledLpBalance>
      ),
    },
    {
      id: 'lpSupply',
      name: 'Pool Balance',
      width: '20%',
      cell: (row) => (
        <BigNumberValue
          value={row.lpSupply}
          decimals={18}
          fractionDigits={3}
          keepCommas
          threshold={TokenThreshold.DEFAULT}
        />
      ),
    },
    {
      id: 'poolShare',
      name: 'Pool share',
      width: '20%',
      cell: (row) => (
        <BigNumberValue
          value={row.poolShare}
          decimals={8}
          fractionDigits={2}
          keepCommas
          percentage
          threshold={PercentageThreshold}
        />
      ),
    },
    {
      id: 'action',
      name: '',
      width: '5%',
      cell: (row) => <i className="far fa-angle-right" />,
      center: true,
    },
  ];
  return (
    <BoxContainer>
      <StyledBox>
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
        {!currentAccount && !account ? (
          <StyledConnect>
            <StyleImageWallet src={imgWallet} />
            <StyledMessage>Connect to a wallet to view your liquidity.</StyledMessage>
            <StyledButtonConnect onClick={connect}>Connect Wallet</StyledButtonConnect>
          </StyledConnect>
        ) : (
          <DataTable
            data={formatedPairs}
            columns={columns}
            loading={loading || lpSupplies?.length !== pairs?.length || !account}
            noDataComponent={
              <StyledNoLiquidity>
                <StyleImageWallet src={imgNoLiquidity} />
                <StyledMessage>No liquidity found</StyledMessage>
                <StyledNoLiquidityText>
                  Don't see a pool you joined?{' '}
                  <StyledNoLiquidityTextLink to="/pools/import">
                    Import it
                  </StyledNoLiquidityTextLink>
                  <br />
                  Unstake your tokens from farms to see them here.
                </StyledNoLiquidityText>
              </StyledNoLiquidity>
            }
            onRowClicked={onRowClick}
            highlightOnHover
          />
        )}
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
const StyledConnect = styled.div`
  margin-top: 95px;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledButtonConnect = styled(Button)`
  width: auto;
  padding-left: 20px;
  padding-right: 20px;
`;

const StyledMessage = styled.div`
  padding: 20px 0;
  color: ${({ theme }) => theme.muted};
  text-align: center;
`;

const StyledNoLiquidity = styled.div`
  text-align: center;
  margin: 80px 0;
  font-size: 16px;
  img {
    width: 65px;
  }
  div {
    padding-top: 15px;
  }
`;

const StyledNoLiquidityText = styled.div`
  border-top: 1px dashed ${({ theme }) => theme.box.border};
  line-height: 1.44;
  color: ${({ theme }) => theme.gray3};
`;

const StyledNoLiquidityTextLink = styled(NavLink)`
  color: ${({ theme }) => theme.success};
  &:hover {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyledLPInfo = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  .name {
    font-weight: normal;
    font-size: 14px;
    margin-left: 0;
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
      font-weight: 500;
      font-size: 16px;
      margin-left: 12px;
    }
    img {
      width: 36px;
    }
  `}
`;

const StyledLpBalance = styled.div`
  color: ${({ theme }) => theme.success};
`;
const StyleImageWallet = styled.img`
  width: 57px;
  margin: auto;
`;

export default MyPools;
