import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { screenUp } from '../../../../utils/styles';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import { useWeb3React } from '@web3-react/core';
import iconReceive from '../../../../assets/icons/ic-receive.svg';
import { useHistory } from 'react-router-dom';
import { useCurrencyBalance } from '../../../../state/user/hooks';
import { BigNumber } from 'ethers';
import { useEstimateReceiveAmount } from './hook/useEstimateReceiveAmount';
import { ButtonRemoveLP } from './components/ButtonRemoveLP';
import PriceInfo from './components/PriceInfo';
import { getWrappedToken } from '../../../../config';
import { Toggle } from '../../../../components/Toggle';
import { Zero } from '@ethersproject/constants';
import { Button } from '../../../../components/Buttons';
import { useUniswapRouter } from '../../hooks/useUniswapRouter';
import { useUniswapToken } from '../../hooks/useUniswapToken';
import { calcPrice } from '../../utils/liquidity';
import { useUniswapPair } from '../../hooks/useUniswapPair';
import { useLiquidityTokenPermit } from '../../hooks/useLiquidityTokenPermit';
import { TokenInputWithPermit } from '../../components/TokenInputWithPermit';
import { PairInfo, PairState } from '../../models/Pair';
import { Currency } from '@uniswap/sdk-core';
import { DexTokenSymbol } from '../../components/DexTokenSymbol';
import { useDexApprove } from '../../../lending/hooks/useDexApprove';
import { useUserWallet } from '../../../../providers/UserWalletProvider';
import { TokenThreshold } from '../../../../utils/constants';

export type RemoveLiquidityProps = {
  currencyA: Currency;
  currencyB: Currency;
  pairInfo: PairInfo;
  onAdd: () => void;
};

const RemoveLiquidity: React.FC<RemoveLiquidityProps> = ({
  currencyA,
  currencyB,
  pairInfo,
  onAdd,
}) => {
  const { library, chainId } = useWeb3React();
  const { account } = useUserWallet();
  const [swapRouter] = useUniswapRouter();

  const [inputAmount, setInputAmount] = useState<BigNumber | undefined>(undefined);
  const wrapTokenAddress = useMemo(() => {
    return getWrappedToken(chainId)?.address;
  }, [chainId]);

  const history = useHistory();

  const oneCurrencyIsETH = currencyA?.isNative || currencyB?.isNative;
  const oneCurrencyIsWETH =
    currencyA?.wrapped.address === wrapTokenAddress ||
    currencyB?.wrapped.address === wrapTokenAddress;

  const { pairState, liquidityToken, liquidityTokenSupply, reserveA, reserveB } = pairInfo;

  const lpToken = useUniswapToken(liquidityToken);
  const lpBalance = useCurrencyBalance(lpToken);

  const { tokenAmountA, tokenAmountB, tokenAmountAMin, tokenAmountBMin } =
    useEstimateReceiveAmount(inputAmount, reserveA, reserveB, lpBalance, liquidityTokenSupply);

  const { loadingSubmit, approve, isApproved } = useDexApprove(
    liquidityToken,
    swapRouter?.address,
  );

  const priceA = useMemo(() => {
    if (!reserveB || !reserveA || !currencyA || !currencyB) {
      return;
    }
    return calcPrice(reserveA, reserveB, currencyA?.decimals, currencyB?.decimals);
  }, [reserveB, reserveA, currencyA, currencyB]);

  const priceB = useMemo(() => {
    if (!reserveB || !reserveA || !currencyA || !currencyB) {
      return;
    }
    return calcPrice(reserveB, reserveA, currencyB?.decimals, currencyA?.decimals);
  }, [reserveB, reserveA, currencyA, currencyB]);

  const pairContract = useUniswapPair(liquidityToken);

  const { enabling, signatureData, gatherPermitSignature, resetSignature } =
    useLiquidityTokenPermit(liquidityToken, inputAmount);

  async function onAttemptToApprove() {
    if (!pairContract || !library) throw new Error('missing dependencies');
    if (gatherPermitSignature) {
      try {
        await gatherPermitSignature();
      } catch (error) {
        if (error?.code !== 4001) {
          await approve();
        }
      }
    } else {
      await approve();
    }
  }

  const onUserInput = useCallback(
    (amount: BigNumber) => {
      resetSignature();
      setInputAmount(amount);
    },
    [resetSignature],
  );

  const reset = useCallback(() => {
    setInputAmount(undefined);
  }, [setInputAmount]);

  const onToggle = useCallback(() => {
    if (!currencyA || !currencyB) return;
    if (oneCurrencyIsETH) {
      history.push(
        `/pools/remove/${currencyA?.isNative ? wrapTokenAddress : currencyA?.wrapped.address}/${
          currencyB?.isNative ? wrapTokenAddress : currencyB?.wrapped.address
        }`,
      );
    } else {
      history.push(
        `/pools/remove/${
          currencyA?.wrapped.address === wrapTokenAddress ? 'ETH' : currencyA?.wrapped.address
        }/${
          currencyB?.wrapped.address === wrapTokenAddress ? 'ETH' : currencyB?.wrapped.address
        }`,
      );
    }
  }, [currencyA, currencyB, history, oneCurrencyIsETH, wrapTokenAddress]);

  return (
    <BoxContainer>
      {!lpBalance && account ? (
        <StyledLoading>
          <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
        </StyledLoading>
      ) : (
        <>
          <StyledBox>
            <TokenInputWithPermit
              maxValue={lpBalance}
              decimals={lpToken?.decimals}
              value={inputAmount}
              onChange={onUserInput}
              label="Remove Amount"
              currencyA={currencyA?.wrapped.address}
              currencyB={currencyB?.wrapped.address}
              size="lg"
            />
            <StyledReceiveIcon>
              <img src={iconReceive} alt="" />
            </StyledReceiveIcon>
            <StyledEstimateReceive>
              <StyledEstimateReceiveHeader>
                <div className="label">Receive</div>
                {wrapTokenAddress && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                  <StyledSelectReceive>
                    <Toggle checked={!oneCurrencyIsETH} onClick={onToggle} />
                    <StyledToggleLabel>Withdraw into WETH</StyledToggleLabel>
                  </StyledSelectReceive>
                ) : null}
              </StyledEstimateReceiveHeader>
              <StyledReceiveInfo>
                <StyledReceiveItem>
                  <StyledReceiveItemName>
                    <DexTokenSymbol address={currencyA?.wrapped.address} size={30} />
                    <div className="name">{currencyA?.symbol}</div>
                  </StyledReceiveItemName>
                  <div className="value">
                    <BigNumberValue
                      value={tokenAmountA}
                      decimals={currencyA?.decimals}
                      fractionDigits={6}
                      threshold={TokenThreshold[currencyA?.symbol] || TokenThreshold.DEFAULT}
                      keepCommas
                    />
                  </div>
                </StyledReceiveItem>
                <StyledReceiveItem>
                  <StyledReceiveItemName>
                    <DexTokenSymbol address={currencyB?.wrapped.address} size={30} />
                    <div className="name">{currencyB?.symbol}</div>
                  </StyledReceiveItemName>
                  <div className="value">
                    <BigNumberValue
                      value={tokenAmountB}
                      decimals={currencyB?.decimals}
                      fractionDigits={6}
                      threshold={TokenThreshold[currencyB?.symbol] || TokenThreshold.DEFAULT}
                      keepCommas
                    />
                  </div>
                </StyledReceiveItem>
              </StyledReceiveInfo>
            </StyledEstimateReceive>
          </StyledBox>
          <StyledFooter>
            {priceA && priceB && (
              <PriceInfo
                priceA={priceA}
                priceB={priceB}
                currencyA={currencyA?.symbol}
                currencyB={currencyB?.symbol}
              />
            )}
            <StyledButtons>
              {inputAmount && inputAmount.gt(Zero) && (
                <StyledButtonApprove
                  isLoading={loadingSubmit || enabling}
                  disabled={loadingSubmit || enabling || isApproved || !!signatureData}
                  onClick={onAttemptToApprove}
                >
                  {isApproved || signatureData ? 'Approved' : 'Approve'}
                </StyledButtonApprove>
              )}
              <ButtonRemoveLP
                pairInfo={pairInfo}
                liquidity={inputAmount}
                amountAMin={tokenAmountAMin}
                amountBMin={tokenAmountBMin}
                onRemoved={reset}
                signatureData={signatureData}
                pairState={pairState}
                loadingPair={pairState === PairState.LOADING}
              />
            </StyledButtons>
          </StyledFooter>
        </>
      )}
    </BoxContainer>
  );
};

const BoxContainer = styled.div`
  border: solid 1px ${({ theme }) => theme.box.border};
`;

const StyledReceiveIcon = styled.div`
  padding: 12px 0;
  text-align: center;
  img {
    margin: auto;
  }
`;

const StyledBox = styled.div`
  padding: 16px 10px;
  background-color: ${({ theme }) => theme.box.background};
  ${screenUp('lg')`
    padding: 20px;
  `}
`;

const StyledReceiveItemName = styled.div`
  display: flex;
  align-items: center;
  .name {
    margin-left: 8px;
  }
`;

const StyledReceiveInfo = styled.div`
  margin-top: 8px;
  padding: 16px;
  background-color: ${({ theme }) => theme.box.innerBackground2};
`;

const StyledReceiveItem = styled.div`
  display: flex;
  justify-content: space-between;
  .value {
    color: ${({ theme }) => theme.success};
  }
  &:last-child {
    padding-top: 12px;
  }
`;

const StyledEstimateReceive = styled.div``;

const StyledEstimateReceiveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .label {
    font-weight: 500;
  }
`;

const StyledFooter = styled(StyledBox)`
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

const StyledButtons = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  gap: 20px;
  width: 100%;
  button {
    width: 100%;
  }
`;

const StyledSelectReceive = styled.div`
  display: flex;
  align-items: center;
`;

const StyledToggleLabel = styled.span`
  color: ${({ theme }) => theme.muted};
  margin-left: 6px;
`;

const StyledButtonApprove = styled(Button)`
  font-weight: 500;
`;

const StyledLoading = styled.div`
  background-color: ${({ theme }) => theme.box.background};
  height: 531px;
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`;

export default RemoveLiquidity;
