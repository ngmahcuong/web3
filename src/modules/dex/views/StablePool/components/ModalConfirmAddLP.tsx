import React, { useCallback, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
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
import { CurrencyThreshold, TokenThreshold } from '../../../../../utils/constants';
import { StablePoolConfig } from '../../../../stablepool/models/StablePool';
import { formatBigNumber } from '../../../../../utils/numbers';
import { useHandleTransactionReceipt } from '../../../../../hooks/useHandleTransactionReceipt';
import { Zero } from '@ethersproject/constants';
import { useStableSwapBasepool } from '../../../hooks/useStableSwapBasepool';
import { useTokenConfig } from '../../../../../hooks/useTokenConfig';
import { useZapBasePool } from '../../../hooks/useZapBasePool';
import { TokenSymbol } from '../../../../../components/TokenSymbol';
import { useAssetsInfo } from '../hook/useAssetsInfo';
export type ModalConfirmAddLPProps = ModalProps & {
  onAdded: (txHash: any) => void;
  symbols: string[];
  amounts: BigNumber[];
  poolConfig: StablePoolConfig;
  usingZap?: boolean;
  estimateAmount?: BigNumber;
};

export const ModalConfirmAddLP: React.FC<ModalConfirmAddLPProps> = ({
  onDismiss,
  onAdded,
  symbols,
  amounts,
  poolConfig,
  usingZap,
  estimateAmount,
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
      return (await zapBasePool.addLiquidity(
        poolConfig?.basePool,
        amounts,
        Zero,
        getDeadline(),
      )) as TransactionResponse;
    }
    return (await basepool.addLiquidity(amounts, Zero, getDeadline())) as TransactionResponse;
  }, [usingZap, basepool, amounts, getDeadline, zapBasePool, poolConfig?.basePool]);

  const onAddLiquidity = useCallback(async () => {
    if (!symbols || !amounts) {
      return;
    }
    setLoading(true);
    try {
      let summary =
        `Add liquidity ` +
        symbols
          ?.map((item, index) =>
            amounts[index]?.gt(Zero)
              ? `${formatBigNumber(amounts[index], tokenInfos[index].decimals, {
                  fractionDigits: 3,
                  significantDigits: 0,
                  compact: false,
                })}  ${tokenInfos[index].name}`
              : null,
          )
          .filter((x) => !!x)
          .join(' and ');
      const tx = await handleTransactionReceipt(summary, createTransaction);
      if (tx) {
        setLoading(false);
        return tx;
      }
    } catch (error) {
      setLoading(false);
    }
  }, [amounts, createTransaction, handleTransactionReceipt, symbols, tokenInfos]);

  const onButtonSubmitClick = useCallback(async () => {
    if (!amounts) {
      return;
    }
    setLoading(true);
    try {
      const result = await onAddLiquidity();
      if (result) {
        onAdded(result?.hash);
      }
    } catch (error) {
      console.debug('add liquidity error ', error);
    }
    setLoading(false);
    onDismiss();
  }, [amounts, onAddLiquidity, onAdded, onDismiss]);

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
        <StyledTokenReceive>
          <div className="value">
            <BigNumberValue
              value={estimateAmount}
              decimals={token?.decimals}
              fractionDigits={10}
              threshold={TokenThreshold.DEFAULT}
              keepCommas
            />
          </div>
          <div className="name">{chTokenInfos?.map((t) => t.name)?.join('/')}</div>
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
          <div className="label-info">Deposit</div>
          {symbols?.map((item, index) => {
            return amounts[index]?.gt(Zero) ? (
              <StyledLPInfo key={index}>
                <StyledLPSymbol>
                  <div className="icon">
                    <TokenSymbol symbol={item} size={30} />
                  </div>
                  <div className="name">
                    {tokenInfos[index]?.name || tokenInfos[index]?.symbol}
                  </div>
                </StyledLPSymbol>
                <div className="value">
                  <BigNumberValue
                    value={amounts[index]}
                    decimals={tokenInfos[index].decimals}
                    fractionDigits={6}
                    threshold={CurrencyThreshold}
                    keepCommas
                  />
                </div>
              </StyledLPInfo>
            ) : null;
          })}
        </StyledAddInfo>
        <StyledButtonAdd
          block
          onClick={onButtonSubmitClick}
          isLoading={loading}
          disabled={loading}
        >
          Confirm Add Liquidity
        </StyledButtonAdd>
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

const StyledTokenReceive = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.success};
  .value {
    margin-right: 5px;
    font-weight: bold;
    font-size: 20px;
  }
  .name {
    font-weight: 500;
  }
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

const StyledButtonAdd = styled(Button)`
  font-weight: 500;
`;
