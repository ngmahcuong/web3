import React from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import bgInfoLeft from '../../../../../assets/images/swap-create-pool-bg-left.png';
import bgInfoRight from '../../../../../assets/images/swap-create-pool-bg-right.png';
import bgInfoLeftDark from '../../../../../assets/images/swap-create-pool-bg-left-dark.png';
import bgInfoRightDark from '../../../../../assets/images/swap-create-pool-bg-right-dark.png';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../state';

const CreatePoolInfo: React.FC = () => {
  const state = useSelector((t: AppState) => t.application.theme);

  return (
    <StyledContainer state={state}>
      <div className="label">Create New Pool</div>
      <p>
        You are the first liquidity provider.
        <br />
        The ratio of tokens you add will set the price of this pool.
        <br />
        Once you are happy with the rate click supply to review.
      </p>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ state: 'dark' | 'light' }>`
  padding: 30px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  position: relative;
  height: 443px;
  .label {
    color: ${({ theme }) => theme.text.primary};
    font-size: 24px;
    font-weight: bold;
    padding-bottom: 12px;
  }

  p {
    line-height: 2.13;
    margin-bottom: 0;
    z-index: 2;
  }

  ::before {
    content: '';
    display: none;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 148px;
    height: 148px;
    background-image: ${({ state }) =>
      state === 'light' ? `url(${bgInfoLeft})` : `url(${bgInfoLeftDark})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: bottom left;
    z-index: 0;
  }
  ::after {
    content: '';
    display: none;
    position: absolute;
    bottom: 30px;
    right: 30px;
    width: 356px;
    height: 312px;
    background-image: ${({ state }) =>
      state === 'light' ? `url(${bgInfoRight})` : `url(${bgInfoRightDark})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: bottom right;
    z-index: 0;
  }
  ${screenUp('lg')`
    ::before {
      display: block;
    }
    ::after {
      display: block;
    }
  `}
`;

export default CreatePoolInfo;
