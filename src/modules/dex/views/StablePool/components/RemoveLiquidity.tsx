import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { Button } from '../../../../../components/Buttons';
import { BigNumber } from 'ethers';
import RemoveStableTokenInput from './RemoveStableTokenInput';
import { useCalculateRemoveEstimateAmount } from '../hook/useCalculateRemoveEstimateAmount';
import useModal from '../../../../../hooks/useModal';
import { ModalConfirmRemoveLP } from './ModalConfirmRemoveLP';
import { ModalSuccess } from '../../../../../components/ModalSuccess';
import { StablePoolConfig, StablePool } from '../../../../stablepool/models/StablePool';
import { useApprove } from '../../../../../hooks/useApprove';
import { getTokenByAddress } from '../../../../../config';
import { useWeb3React } from '@web3-react/core';
import iconReceive from '../../../../../assets/icons/ic-receive.svg';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { SlippagePrecision, TokenThreshold } from '../../../../../utils/constants';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { useAssetsInfo } from '../hook/useAssetsInfo';
import { screenUp } from '../../../../../utils/styles';
import { ButtonSelectOutputAsset } from './ButtonSelectOutputAsset';
import { useCalculateSingleAssetRemoveEstimateAmount } from '../hook/useCalculateSingleAssetRemoveEstimateAmount';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
import { Zero } from '@ethersproject/constants';
import { parseUnits } from 'ethers/lib/utils';

enum ButtonStatus {
  notConnect,
  loadBalance,
  notApprove,
  notInput,
  insufficientBalance,
  ready,
  inSubmit,
  loading,
}

export type RemoveLiquidityProps = {
  poolConfig: StablePoolConfig;
  poolInfo: StablePool;
  usingZap: boolean;
  tokens: string[];
};

const RemoveLiquidity: React.FC<RemoveLiquidityProps> = ({
  poolConfig,
  poolInfo,
  usingZap,
  tokens,
}) => {
  const { account } = useUserWallet();
  const { chainId } = useWeb3React();
  const [connect] = useModalConnectWallet();
  const token = getTokenByAddress(chainId, poolConfig?.address);
  const [amount, setAmount] = useState<BigNumber>();
  const [txHash, setTxHash] = useState<string>();
  const slippage = useGetSlippagePrecise();
  const balance = useTokenBalance(token?.symbol);
  const outputTokens = useAssetsInfo(tokens);
  const [singleOutput, setSingleOutput] = useState(false);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  const { approve, isApproved, loadingSubmit } = useApprove(
    token?.symbol,
    usingZap ? poolConfig?.zap : poolConfig?.basePool,
  );

  const resetAmount = useCallback(() => {
    setAmount(undefined);
  }, [setAmount]);

  const selectedOutput = useMemo(() => {
    return outputTokens && selectedOutputIndex != null
      ? outputTokens[selectedOutputIndex]
      : null;
  }, [outputTokens, selectedOutputIndex]);

  useEffect(() => {
    resetAmount();
  }, [account, resetAmount]);

  const { outputAmounts, bonus, impact } = useCalculateRemoveEstimateAmount(
    amount,
    poolConfig?.basePool,
    poolConfig?.zap,
    usingZap,
    poolInfo,
    poolConfig?.assets,
    poolConfig?.chAssets,
  );

  const outputSingleAssetAmount = useCalculateSingleAssetRemoveEstimateAmount(
    amount,
    poolConfig?.basePool,
    poolConfig?.zap,
    usingZap,
    selectedOutputIndex,
  );

  const estimateOutputSingleAssetAmount = useMemo(() => {
    if (!outputSingleAssetAmount) return;
    return outputSingleAssetAmount.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision);
  }, [outputSingleAssetAmount, slippage]);

  const estimateAmounts = useMemo(() => {
    if (!outputAmounts || outputAmounts.length === 0) return;
    return outputAmounts.map((t) =>
      t.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision),
    );
  }, [outputAmounts, slippage]);

  const onRemoved = useCallback(
    (txHash: string) => {
      setTxHash(txHash);
      resetAmount();
    },
    [resetAmount],
  );

  const [showConfirm] = useModal(
    <ModalConfirmRemoveLP
      onRemoved={onRemoved}
      symbols={singleOutput ? [tokens[selectedOutputIndex]] : tokens}
      poolConfig={poolConfig}
      amount={amount}
      estimateAmounts={singleOutput ? [estimateOutputSingleAssetAmount] : estimateAmounts}
      usingZap={usingZap}
      singleOutput={singleOutput}
      selectedOutputIndex={selectedOutputIndex}
    />,
  );

  const [showModalTransactionSubmitted] = useModal(
    useMemo(() => {
      return <ModalSuccess title={'Transaction submitted'} tx={txHash} hideMetamaskButton />;
    }, [txHash]),
  );

  useEffect(() => {
    if (txHash) {
      showModalTransactionSubmitted();
    }
  }, [showModalTransactionSubmitted, txHash]);

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!isApproved) {
      return ButtonStatus.notApprove;
    }
    if (poolInfo?.loading) {
      return ButtonStatus.loading;
    }
    if (!amount) {
      return ButtonStatus.notInput;
    }
    if (amount && amount?.gt(balance)) {
      return ButtonStatus.insufficientBalance;
    }
    return ButtonStatus.ready;
  }, [account, amount, balance, isApproved, poolInfo?.loading]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      case ButtonStatus.notApprove: {
        return approve();
      }
      default:
        return showConfirm();
    }
  }, [approve, connect, showConfirm, status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.notApprove:
      case ButtonStatus.ready:
        return false;
      default:
        return true;
    }
  }, [status]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect wallet`;
      case ButtonStatus.notInput:
        return `Enter an amount`;
      case ButtonStatus.notApprove:
        return `Approve`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      default:
        return 'Remove Liquidity';
    }
  }, [status]);

  return (
    <BoxContainer>
      <StyledBox>
        <RemoveStableTokenInput
          symbol={token?.symbol}
          assets={poolConfig?.chAssets}
          value={amount}
          onChange={setAmount}
        />
        <StyledReceiveIcon>
          <img src={iconReceive} alt="" />
        </StyledReceiveIcon>
        <StyledEstimateReceive>
          <StyledEstimateReceiveHeader>
            <div className="label">Receive</div>
            <ButtonSelectOutputAsset
              selected={singleOutput ? selectedOutputIndex : -1}
              onSelect={setSelectedOutputIndex}
              onUseSingleOutput={setSingleOutput}
              assetInfos={outputTokens}
            />
          </StyledEstimateReceiveHeader>
          <StyledReceiveInfo>
            {singleOutput ? (
              <StyledReceiveItem>
                <StyledReceiveItemName>
                  <TokenSymbol symbol={selectedOutput?.symbol} size={30} />
                  <div className="name">{selectedOutput?.name || selectedOutput?.symbol}</div>
                </StyledReceiveItemName>
                <div className="value">
                  <BigNumberValue
                    value={estimateOutputSingleAssetAmount}
                    decimals={selectedOutput?.decimals}
                    fractionDigits={2}
                    threshold={TokenThreshold.DEFAULT}
                  />
                </div>
              </StyledReceiveItem>
            ) : (
              <>
                {outputTokens?.map((item, index) => (
                  <StyledReceiveItem key={index}>
                    <StyledReceiveItemName>
                      <TokenSymbol symbol={item.symbol} size={30} />
                      <div className="name">{item.name || item.symbol}</div>
                    </StyledReceiveItemName>
                    <div className="value">
                      <BigNumberValue
                        value={estimateAmounts && estimateAmounts[index]}
                        decimals={item.decimals}
                        fractionDigits={2}
                        threshold={TokenThreshold.DEFAULT}
                      />
                    </div>
                  </StyledReceiveItem>
                ))}
              </>
            )}
          </StyledReceiveInfo>
        </StyledEstimateReceive>
      </StyledBox>
      <StyledFooter>
        <StyledImpact>
          <span>{impact ? 'Price impact' : 'Bonus'}</span>
          {impact ? (
            <StyledValue variant={impact.gt(parseUnits('0.2', 18)) ? 'danger' : 'normal'}>
              {amount?.gt(Zero) && !impact ? (
                <i className="far fa-circle-notch fa-spin" />
              ) : (
                <BigNumberValue
                  value={impact}
                  decimals={18}
                  percentage
                  fractionDigits={4}
                  threshold={TokenThreshold.DEFAULT}
                />
              )}
            </StyledValue>
          ) : (
            <StyledValue variant="success">
              {amount?.gt(Zero) && !bonus ? (
                <i className="far fa-circle-notch fa-spin" />
              ) : (
                <BigNumberValue
                  value={bonus}
                  decimals={18}
                  percentage
                  fractionDigits={4}
                  threshold={TokenThreshold.DEFAULT}
                />
              )}
            </StyledValue>
          )}
        </StyledImpact>
        <StyledButtons>
          <StyledButton
            onClick={onButtonClick}
            disabled={disabled || loadingSubmit}
            isLoading={loadingSubmit}
          >
            {buttonText}
          </StyledButton>
        </StyledButtons>
      </StyledFooter>
    </BoxContainer>
  );
};

const BoxContainer = styled.div``;
const StyledBox = styled.div`
  padding: 16px 10px;
  ${screenUp('lg')`
    padding: 20px;
  `}
`;
const StyledReceiveIcon = styled.div`
  padding: 12px 0;
  text-align: center;
  img {
    margin: auto;
  }
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
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.box.innerBackground2};
`;

const StyledReceiveItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  padding-bottom: 8px;
  .value {
    color: ${({ theme }) => theme.success};
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
  padding-top: 0;
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

const StyledImpact = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
`;

export const StyledValue = styled.div<{
  variant?: 'normal' | 'danger' | 'success';
}>`
  font-size: 14px;
  font-weight: normal;
  color: ${(p) =>
    p?.variant === 'normal'
      ? p.theme.text.primary
      : p?.variant === 'danger'
      ? p.theme.danger
      : p?.variant === 'success'
      ? p.theme.success
      : '#fff'};
`;

const StyledButtons = styled.div`
  flex: 1;
  button {
    width: 100%;
  }
`;

export const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  font-weight: 500;
  color: ${(p) => p.theme.text.primary};
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
    }
  }
`;

const StyledButton = styled(Button)`
  font-weight: 500;
`;

export default RemoveLiquidity;
