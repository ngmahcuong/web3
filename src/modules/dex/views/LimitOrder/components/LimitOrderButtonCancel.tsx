import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ButtonOutline } from '../../../../../components/Buttons';
import { getWrappedToken } from '../../../../../config';
import { useHandleTransactionReceipt } from '../../../../../hooks/useHandleTransactionReceipt';
import useModal from '../../../../../hooks/useModal';
import { useExpertModeManager } from '../../../../../state/dex/hooks';
import { ETH_ADDRESS } from '../../../../../utils/constants';
import { formatBigNumber } from '../../../../../utils/numbers';
import { useLimitOrderContract } from '../../../hooks/useLimitOrderContract';
import { LimitOrderData } from '../../../models/Graphql';
import { ModalConfirmCancelOrder } from './ModalConfirmCancelOrder';

interface LimitOrderButtonCancelProps {
  order: LimitOrderData;
  onLoad: () => void;
}

const LimitOrderButtonCancel: FC<LimitOrderButtonCancelProps> = ({ order, onLoad }) => {
  const { chainId } = useWeb3React();
  const { estimate } = useLimitOrderContract();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);
  const wrappedToken = getWrappedToken(chainId);
  const [isExpertMode] = useExpertModeManager();

  const getTokenDetail = useCallback(
    (params?: { id?: string; name?: string; symbol?: string; decimals?: string }) => {
      if (params?.id === ETH_ADDRESS.toLowerCase()) {
        return wrappedToken;
      } else {
        return {
          ...params,
          decimals: parseInt(params?.decimals),
          address: getAddress(params.id),
        };
      }
    },
    [wrappedToken],
  );

  const [showConfirm] = useModal(
    useMemo(() => {
      return <ModalConfirmCancelOrder order={order} onCompleted={onLoad} />;
    }, [onLoad, order]),
    'ConfirmCancelOrder',
  );

  const cancelOrder = useCallback(async () => {
    return await estimate('cancelOrder', [
      order?.id,
      order.inputToken?.id === wrappedToken?.address?.toLowerCase() ? true : false,
    ]);
  }, [estimate, order?.id, order.inputToken?.id, wrappedToken?.address]);

  const onCancelOrder = useCallback(async () => {
    setLoading(true);
    try {
      const inputToken = getTokenDetail(order?.inputToken);
      const outputToken = getTokenDetail(order?.outputToken);
      const tx = await handleTransactionReceipt(
        `Cancel order from ${formatBigNumber(
          BigNumber.from(order.inputAmount),
          inputToken.decimals,
          {
            fractionDigits: 3,
            significantDigits: 0,
            compact: false,
          },
        )} ${inputToken?.symbol} to ${formatBigNumber(
          BigNumber.from(order.outputAmount),
          outputToken.decimals,
          {
            fractionDigits: 3,
            significantDigits: 0,
            compact: false,
          },
        )} ${outputToken?.symbol}`,
        cancelOrder,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
        onLoad?.();
      }
    } catch (ex) {
      console.debug('cancel order error ', ex);
      setLoading(false);
    }
  }, [
    cancelOrder,
    getTokenDetail,
    handleTransactionReceipt,
    onLoad,
    order.inputAmount,
    order?.inputToken,
    order.outputAmount,
    order?.outputToken,
  ]);

  const onButtonClick = useCallback(() => {
    if (isExpertMode) {
      return onCancelOrder();
    }
    return showConfirm();
  }, [isExpertMode, showConfirm, onCancelOrder]);

  return (
    <StyledButtonOutline
      disabled={loading}
      size="sm"
      error
      onClick={onButtonClick}
      isLoading={loading}
    >
      <i className="far fa-trash-alt" />
    </StyledButtonOutline>
  );
};

const StyledButtonOutline = styled(ButtonOutline)`
  border: solid 1px ${({ theme }) => theme.danger};
  color: ${({ theme }) => theme.danger};
  :not(:disabled) {
    :hover {
      background-color: ${({ theme }) => theme.danger};
      border-color: ${({ theme }) => theme.danger};
      color: ${(p) => p.theme.white};
    }
  }
  :disabled {
    pointer-events: none;
    border: 1px solid ${({ error, theme }) => (error ? theme.danger : theme.black)};
  }

  i {
    margin-left: 0px;
    margin-right: 1px;
    margin-bottom: 0px;
    margin-top: 0px;
  }
`;

export default LimitOrderButtonCancel;
