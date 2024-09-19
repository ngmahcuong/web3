import { Zero } from '@ethersproject/constants';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PairInfo, PairState } from '../../../models/Pair';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { screenUp } from '../../../../../utils/styles';
import { MinimalPositionCard } from '../../../components/MinimalPositionCard';
import noPoolFound from '../../../../../assets/images/no-pool.png';

export type PoolStatusProps = {
  pairInfo: PairInfo;
};

export const PoolStatus: React.FC<PoolStatusProps> = ({ pairInfo }) => {
  const { account } = useUserWallet();
  const {
    currencyA,
    currencyB,
    liquidityToken,
    liquidityTokenSupply,
    reserveA,
    reserveB,
    pairState,
  } = pairInfo;
  const lpBalance = useTokenBalance(liquidityToken);

  const isLoading = useMemo(() => {
    return (
      pairState === PairState.LOADING || (pairState === PairState.EXISTS && lpBalance === null)
    );
  }, [pairState, lpBalance]);

  const message = useMemo(() => {
    if (!currencyA || !currencyB) {
      return 'Select a token to find your liquidity';
    } else if (pairState === PairState.EXISTS && (!lpBalance || lpBalance?.lte(Zero))) {
      return 'You don’t have liquidity in this pool';
    } else if (pairState === PairState.NOT_EXISTS) {
      return 'No pool found';
    }
  }, [currencyA, currencyB, lpBalance, pairState]);

  return !isLoading && account ? (
    <>
      {pairState === PairState.EXISTS &&
      lpBalance?.gt(Zero) &&
      !currencyA.wrapped.equals(currencyB.wrapped) ? (
        <MinimalPositionCard
          currencyA={currencyA}
          currencyB={currencyB}
          lpToken={liquidityToken}
          liquidityTokenSupply={liquidityTokenSupply}
          reserveA={reserveA}
          reserveB={reserveB}
        />
      ) : message ? (
        <StyledBox>
          <StyledMessage>{message}</StyledMessage>
        </StyledBox>
      ) : (
        <></>
      )}
    </>
  ) : (
    <></>
  );
};

const StyledBox = styled.div`
  padding: 15px 12px;
  margin: auto;
  margin-top: 0px;
  align-items: center;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.box.itemBackground};
  ${screenUp('lg')`
    padding: 20px;
    padding-bottom: 0;
    margin-top: 0px;
  `}
`;

const StyledMessage = styled.div`
  color: ${({ theme }) => theme.gray3};
  text-align: center;
  margin-top: 70px;
  position: relative;
  font-size: 14px;
  ::after {
    content: '';
    position: absolute;
    bottom: 30px;
    width: 40px;
    height: 50px;
    left: 50%;
    transform: translateX(-50%);
    background-image: url(${noPoolFound});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: bottom right;
  }
`;
