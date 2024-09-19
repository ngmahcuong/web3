import React, { useState } from 'react';
import { useCallback } from 'react';
import { Button } from '../../../../../components/Buttons';
import styled from 'styled-components';
import { useGetSlippagePrecise } from '../../../../../state/application/hooks';
import { BigNumberValue } from '../../../../../components/BigNumberValue';
import { BigNumber } from 'ethers';
import { useEstimateReceiveAmount } from '../hook/useEstimateReceiveAmount';
import { useTokenBalance } from '../../../../../state/user/hooks';
import Modal from '../../../../../components/Modal';
import {
  ModalCloseButton,
  ModalHeader,
  ModalProps,
  ModalTitle,
} from '../../../../../components/Modal/ModalStyles';
import { PairInfo } from '../../../models/Pair';
import { DexTokenSymbol } from '../../../components/DexTokenSymbol';
import { CurrencyThreshold, TokenThreshold } from '../../../../../utils/constants';
import { useRemoveLiquidity } from '../../../hooks/useRemoveLiquidity';

export type ModalConfirmRemoveLPProps = ModalProps & {
  onRemoved: (txHash: string) => void;
  liquidity: BigNumber;
  pairInfo: PairInfo;
  signatureData: { v: number; r: string; s: string; deadline: number } | null;
  isApproved: boolean;
};

export const ModalConfirmRemoveLP: React.FC<ModalConfirmRemoveLPProps> = ({
  onDismiss,
  onRemoved,
  pairInfo,
  liquidity,
  signatureData,
  isApproved,
}) => {
  const { currencyA, currencyB, reserveA, reserveB, liquidityToken, liquidityTokenSupply } =
    pairInfo;
  const lpBalance = useTokenBalance(liquidityToken);
  const slippage = useGetSlippagePrecise();

  const { tokenAmountA, tokenAmountB, tokenAmountAMin, tokenAmountBMin } =
    useEstimateReceiveAmount(liquidity, reserveA, reserveB, lpBalance, liquidityTokenSupply);

  const executeRemove = useRemoveLiquidity(
    currencyA,
    currencyB,
    liquidity,
    tokenAmountAMin,
    tokenAmountBMin,
    signatureData,
    isApproved,
  );
  const [loading, setLoading] = useState(false);
  const onRemove = useCallback(async () => {
    if (!liquidity) {
      return;
    }
    setLoading(true);
    try {
      const result = await executeRemove();
      if (result?.tx) {
        onRemoved(result?.tx?.hash);
      }
    } catch (error) {
      console.debug('add liquidity error ', error);
    }
    setLoading(false);
    onDismiss();
  }, [executeRemove, liquidity, onDismiss, onRemoved]);

  return (
    <Modal size="sm">
      <StyledModalHeader>
        <ModalCloseButton onClick={onDismiss} />
        <StyledModalTitle>You will receive</StyledModalTitle>
        <StyledTokenReceive>
          <StyledTokenDeposited>
            <DexTokenSymbol address={currencyA?.wrapped.address} size={30} />
            <div className="value">
              <BigNumberValue
                value={tokenAmountA}
                decimals={currencyA?.decimals}
                fractionDigits={6}
                threshold={CurrencyThreshold}
                keepCommas
              />
            </div>
            <div className="name">{currencyA?.symbol}</div>
          </StyledTokenDeposited>
          <StyledTokenDeposited>
            <DexTokenSymbol address={currencyB?.wrapped.address} size={30} />
            <div className="value">
              <BigNumberValue
                value={tokenAmountB}
                decimals={currencyB?.decimals}
                fractionDigits={6}
                threshold={CurrencyThreshold}
                keepCommas
              />
            </div>
            <div className="name">{currencyB?.symbol}</div>
          </StyledTokenDeposited>
        </StyledTokenReceive>
        <StyledReceiveDes>
          Output is estimated. If the price changes by more than{' '}
          <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} /> your
          transaction will revert
        </StyledReceiveDes>
      </StyledModalHeader>
      <StyledModalBody>
        <div className="label">Transaction Overview</div>
        <StyledRemoveInfo>
          <div className="label-info">Burn</div>
          <StyledLPInfo>
            <StyledLPSymbol>
              <div className="icon">
                <DexTokenSymbol address={currencyA?.wrapped.address} size={30} />
                <DexTokenSymbol address={currencyB?.wrapped.address} size={30} />
              </div>
              <div className="name">
                {currencyA?.symbol}/{currencyB?.symbol} LP
              </div>
            </StyledLPSymbol>
            <div className="value">
              <BigNumberValue
                value={liquidity}
                decimals={18}
                fractionDigits={10}
                threshold={TokenThreshold.DEFAULT}
                keepCommas
              />
            </div>
          </StyledLPInfo>
        </StyledRemoveInfo>
        <StyledButtonRemove block onClick={onRemove} isLoading={loading} disabled={loading}>
          Confirm Remove Liquidity
        </StyledButtonRemove>
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
  font-weight: 600;
  line-height: 1.2;
  font-size: 16px;
  margin-bottom: 2px;
`;

const StyledModalBody = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  .label {
    font-weight: 500;
  }
`;

const StyledTokenReceive = styled.div`
  display: grid;
  gap: 10px;
  position: relative;
  grid-template-columns: 1fr 1fr;
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
  padding: 20px 0;
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

const StyledRemoveInfo = styled.div`
  margin-top: 8px;
  .label-info {
    color: ${({ theme }) => theme.gray3};
  }
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

const StyledButtonRemove = styled(Button)`
  font-weight: 500;
`;
