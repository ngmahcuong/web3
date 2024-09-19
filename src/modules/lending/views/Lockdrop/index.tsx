import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PageHeaderContainer from '../../../../components/PageHeaderContainer';
import useQuery from '../../../../hooks/useQuery';
import LockDropHeader from './components/LockDropHeader';
import LockDropList from './components/LockDropList';
import { useLockDrop } from './hooks/useLockDrop';
import { useLockDropTVL } from './hooks/useLockDropTVL';
import bgImageRight from '../../../../assets/images/bgImageLockdrop.png';

const Lockdrop: React.FC = () => {
  const { poolsData, isLoading } = useLockDrop();
  const { totalValueLockdrop, totalValueLockdropMine } = useLockDropTVL(poolsData);
  const [isYourTab, setYourTab] = useState(false);
  const query = useQuery();

  useEffect(() => {
    if (query.get('filter') === 'your') {
      setYourTab(true);
    } else {
      setYourTab(false);
    }
  }, [query]);

  return (
    <StyledContainer>
      <PageHeaderContainer reverse iconBg={bgImageRight}>
        <LockDropHeader
          isYourTab={isYourTab}
          totalValue={totalValueLockdrop}
          totalValueMine={totalValueLockdropMine}
          isLoading={isLoading}
        />
      </PageHeaderContainer>
      <LockDropList poolsData={poolsData} isYourTab={isYourTab} isLoading={isLoading} />
    </StyledContainer>
  );
};

export default Lockdrop;

const StyledContainer = styled.div``;
