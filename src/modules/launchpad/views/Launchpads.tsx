import React from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { getLaunchpadConfigs } from '../../../config';
import bgLaunchpadRight from '../../../assets/images/launchpad-right.png';
import PageHeaderContainer, {
  PageHeaderMetaInfo,
} from '../../../components/PageHeaderContainer';
import { container, screenUp } from '../../../utils/styles';
import LaunchpadItem from './components/LaunchpadItem';

const LaunchPads: React.FC = () => {
  const { chainId } = useWeb3React();
  const launchpadConfigs = getLaunchpadConfigs(chainId);

  return (
    <StyledContainer>
      <PageHeaderContainer title={'Launchpad'} iconBg={bgLaunchpadRight}>
        <PageHeaderMetaInfo>
          Private projects require participants to complete the KYC process of identity
          verification. The process is very simple and quick to complete, but we recommend you
          complete it sooner rather than later, as KYC can take up to a day to approve. If you
          leave it until the last minute before the IDO start time, you may miss out on the IDO
          itself.
        </PageHeaderMetaInfo>
      </PageHeaderContainer>
      <StyledContent>
        {launchpadConfigs.map((item, index) => (
          <LaunchpadItem config={launchpadConfigs[index]} index={index} key={index} />
        ))}
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;
const StyledContent = styled.div`
  ${container};
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 25px;
  ${screenUp('lg')`
  grid-template-columns: repeat(4, 1fr);
  `}
  padding-top: 32px;
`;

export default LaunchPads;
