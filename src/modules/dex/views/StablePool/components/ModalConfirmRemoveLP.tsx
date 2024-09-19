import React, { useCallback, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Zero } from '@ethersproject/constants';
import { Button } from '../../../../../components/Buttons';
import styled from 'styled-components';
import { useGetDeadline, useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import Modal, {
  ModalCloseButton,
  ModalHeader,
  ModalProps,
  ModalTitle,
} from '../../../../../components/Modal/ModalStyles';
import { BigNumber } from 'ethers';
import { CurrencyThreshold } from '../../../../../utils/constants';
import { StablePoolConfig } from '../../../../stablepool/models/StablePool';
import { formatBigNumber } from '../../../../../utils/numbers';
import { useHandleTransactionReceipt } from '../../../../../hooks/useHandleTransactionReceipt';
import { useStableSwapBasepool } from '../../../hooks/useStableSwapBasepool';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useTokenConfig } from '../../../../../hooks/useTokenConfig';
import { useZapBasePool } from '../../../hooks/useZapBasePool';
import { useAssetsInfo } from '../hook/useAssetsInfo';

export type ModalConfirmAddLPProps = ModalProps & {
  onRemoved: (txHash: any) => void;
  symbols: string[];
  amount: BigNumber;
  poolConfig: StablePoolConfig;
  usingZap?: boolean;
  estimateAmounts?: BigNumber[];
  singleOutput: boolean;
  selectedOutputIndex: number;
};
export const ModalConfirmRemoveLP: React.FC<ModalConfirmAddLPProps> = ({
  onDismiss,
  onRemoved: onAdded,
  symbols,
  amount,
  poolConfig,
  usingZap,
  estimateAmounts,
  singleOutput,
  selectedOutputIndex,
}) => {
  const slippage = useGetSlippagePrecise();
  const [loading, setLoading] = useState(false);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const token = useTokenConfig(poolConfig?.lpToken);
  const basepool = useStableSwapBasepool(token.name);
  const zapBasePool = useZapBasePool(token.name);
  const getDeadline = useGetDeadline();
  const tokenInfos = useAssetsInfo(symbols);
  const chTokenInfos = useAssetsInfo(poolConfig?.chAssets);

  const createTransaction = useCallback(async () => {
    if (usingZap) {
      if (singleOutput) {
        return (await zapBasePool.removeLiquidityOneToken(
          poolConfig?.basePool,
          amount,
          selectedOutputIndex,
          Zero,
          getDeadline(),
        )) as TransactionResponse;
      } else {
        return (await zapBasePool.removeLiquidity(
          poolConfig?.basePool,
          amount,
          [Zero, Zero],
          getDeadline(),
        )) as TransactionResponse;
      }
    }
    if (singleOutput) {
      return (await basepool.removeLiquidityOneToken(
        amount,
        selectedOutputIndex,
        Zero,
        getDeadline(),
      )) as TransactionResponse;
    } else {
      return (await basepool.removeLiquidity(
        amount,
        [Zero, Zero],
        getDeadline(),
      )) as TransactionResponse;
    }
  }, [
    usingZap,
    singleOutput,
    zapBasePool,
    poolConfig?.basePool,
    amount,
    selectedOutputIndex,
    getDeadline,
    basepool,
  ]);

  const onRemoveLiquidity = useCallback(async () => {
    if (!poolConfig || !amount) {
      return;
    }
    setLoading(true);
    try {
      let summary = `Remove liquidity ${formatBigNumber(amount, token?.decimals, {
        fractionDigits: 3,
        significantDigits: 0,
        compact: false,
      })}  ${token?.name}`;
      const tx = await handleTransactionReceipt(summary, createTransaction);
      if (tx) {
        setLoading(false);
        return tx;
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    amount,
    createTransaction,
    handleTransactionReceipt,
    poolConfig,
    token?.decimals,
    token?.name,
  ]);

  const onRemove = useCallback(async () => {
    if (!amount) {
      return;
    }
    setLoading(true);
    try {
      const result = await onRemoveLiquidity();
      if (result) {
        onAdded(result.hash);
      }
    } catch (error) {
      console.debug('remove liquidity error ', error);
    }
    setLoading(false);
    onDismiss();
  }, [amount, onRemoveLiquidity, onAdded, onDismiss]);

  return (
    <Modal size="sm">
      <StyledModalHeader>
        <ModalCloseButton onClick={onDismiss} />
        <StyledModalTitle>
          <div className="icon">
            {symbols?.map((item, index) => (
              <TokenSymbol symbol={item} size={46} key={index} />
            ))}
          </div>
          You will receive
        </StyledModalTitle>
        <StyledTokenReceive length={symbols.length}>
          {tokenInfos?.map((item, index) => (
            <StyledTokenDeposited key={index}>
              <TokenSymbol symbol={item?.symbol} size={30} />
              <div className="value">
                <BigNumberValue
                  value={estimateAmounts && estimateAmounts[index]}
                  decimals={tokenInfos[index].decimals}
                  fractionDigits={2}
                  threshold={CurrencyThreshold}
                  keepCommas
                />
              </div>
              <div className="name">{item?.name}</div>
            </StyledTokenDeposited>
          ))}
        </StyledTokenReceive>
        <StyledReceiveDes>
          Output is estimated. If the price changes by more than{' '}
          <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} /> your
          transaction will revert
        </StyledReceiveDes>
      </StyledModalHeader>
      <StyledModalBody>
        <div className="label">Transaction Overview</div>
        <StyledAddInfo>
          <div className="label-info">Burn</div>
          <StyledLPInfo>
            <StyledLPSymbol>
              <div className="icon">
                {symbols?.map((item, index) => (
                  <TokenSymbol symbol={item} size={30} key={index} />
                ))}
              </div>
              <div className="name">{chTokenInfos?.map((t) => t.name)?.join('/')}</div>
            </StyledLPSymbol>
            <div className="value">
              <BigNumberValue
                value={amount}
                decimals={18}
                fractionDigits={6}
                threshold={CurrencyThreshold}
                keepCommas
              />
            </div>
          </StyledLPInfo>
        </StyledAddInfo>
        <StyledButton block onClick={onRemove} isLoading={loading} disabled={loading}>
          Confirm Remove Liquidity
        </StyledButton>
      </StyledModalBody>
    </Modal>
  );
};

const StyledModalHeader = styled(ModalHeader)`
  background-color: ${({ theme }) => theme.box.innerBackground};
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 14px 20px;
  button {
    position: absolute;
    right: 24px;
    padding: 0;
  }
`;

const StyledModalTitle = styled(ModalTitle)`
  font-weight: normal;
  text-align: center;
  line-height: 2;
  margin-top: 7px;
  font-size: 16px;
  .icon {
    display: flex;
    justify-content: center;
    img {
      z-index: 1;
      &:last-child {
        z-index: 0;
        margin-left: -4px;
      }
    }
  }
`;

const StyledModalBody = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  .label {
    font-weight: 500;
  }
`;

const StyledTokenReceive = styled.div<{ length?: number }>`
  display: grid;
  gap: 10px;
  position: relative;
  grid-template-columns: ${({ length }) => (length > 1 ? '1fr 1fr' : '')};
  width: 100%;
`;

const StyledReceiveDes = styled.div`
  margin: 16px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.gray3};
  text-align: center;
`;

const StyledLPInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  .value {
    text-align: right;
  }
`;

const StyledLPSymbol = styled.div`
  display: flex;
  align-items: center;
  .name {
    margin-left: 7px;
  }
  .icon {
    display: flex;
    img {
      z-index: 1;
      &:last-child {
        z-index: 0;
        margin-left: -4px;
      }
    }
  }
`;

const StyledAddInfo = styled.div`
  margin-top: 8px;
  margin-bottom: 15px;
  .label-info {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyledButton = styled(Button)`
  font-weight: 500;
`;

const StyledTokenDeposited = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
  border: solid 1px ${({ theme }) => theme.box.border2};
  margin-top: 14px;
  color: ${({ theme }) => theme.success};
  .value {
    font-size: 20px;
    font-weight: bold;
    margin-left: 5px;
  }
  .name {
    font-size: 16px;
    margin-left: 5px;
  }
`;
