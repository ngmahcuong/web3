import { Zero } from '@ethersproject/constants';
import { useWeb3React } from '@web3-react/core';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getTokenByAddress } from '../../../../../config';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { container, screenUp } from '../../../../../utils/styles';
import { LockPoolInfo, PoolGroupsInfo } from '../../../models/Lockdrop';
import { LockDropConnectWallet } from './LockDropConnectWallet';
import { LockDropDepositItem } from './LockDropDepositItem';
import { LockDropWithdrawItem } from './LockDropWithdrawItem';
import { LockDropNoData } from './LockDropNoData';
import Loading from '../../../../../components/Loading';

const LockList: React.FC<{
  isYourTab: boolean;
  poolsData: LockPoolInfo[];
  isLoading?: boolean;
}> = ({ poolsData, isYourTab, isLoading }) => {
  const [poolGroupsInfo, setPoolGroupsInfo] = useState<PoolGroupsInfo[]>([]);
  const [yourPools, setYourPools] = useState<LockPoolInfo[]>([]);

  useEffect(() => {
    const groupData: PoolGroupsInfo[] = Array.from(
      poolsData.reduce(
        (m, item) => m.set(item.token, [...(m.get(item.token) || []), item]),
        new Map(),
      ),
      ([token, item]) => ({ token, pools: item }),
    );

    setPoolGroupsInfo(groupData);
    setYourPools(poolsData.filter((p) => p?.depositedValue?.gt(Zero)));
  }, [poolsData]);

  return isLoading ? (
    <Loading />
  ) : (
    <StyledLockListContainer>
      {isYourTab ? (
        <LockdropYourPool pools={yourPools} />
      ) : (
        <LockdropAllPool pools={poolGroupsInfo} />
      )}
    </StyledLockListContainer>
  );
};

export const LockdropYourPool: React.FC<{
  pools?: LockPoolInfo[];
}> = ({ pools }) => {
  const { account } = useUserWallet();
  return account ? (
    isEmpty(pools) ? (
      <LockDropNoData />
    ) : (
      <StyledLockList>
        {pools?.map((poolItem, key) => (
          <LockDropWithdrawItem pool={poolItem} key={key} />
        ))}
      </StyledLockList>
    )
  ) : (
    <LockDropConnectWallet />
  );
};

export const LockdropAllPool: React.FC<{
  pools?: PoolGroupsInfo[];
}> = ({ pools }) => {
  const { chainId } = useWeb3React();
  return (
    <>
      {pools?.map((poolGroupItem, key1) => (
        <StyledLockCategory key={key1}>
          <div className="title">
            Lock {getTokenByAddress(chainId, poolGroupItem?.token)?.name}
          </div>
          <StyledLockList>
            {poolGroupItem?.pools.map((poolItem, key2) => (
              <LockDropDepositItem pool={poolItem} key={key2} />
            ))}
          </StyledLockList>
        </StyledLockCategory>
      ))}
    </>
  );
};

const StyledLockListContainer = styled.div`
  ${container};
  padding-top: 25px;
`;

const StyledLockCategory = styled.div`
  margin-bottom: 32px;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 10px;
  }
`;

const StyledLockList = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 25px;
  ${screenUp('lg')`
     grid-template-columns: repeat(4, 1fr);
  `}
`;

export default LockList;
