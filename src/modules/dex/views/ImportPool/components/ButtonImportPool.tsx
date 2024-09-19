import { Zero } from '@ethersproject/constants';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../../../components/Buttons';
import { useModalConnectWallet } from '../../../../../hooks/useConnectWallet';
import { PairInfo, PairState } from '../../../models/Pair';
import { useUserWallet } from '../../../../../providers/UserWalletProvider';
import { useTokenBalance } from '../../../../../state/user/hooks';
import { screenUp } from '../../../../../utils/styles';
import { useSavePool } from '../../../../../state/dex/hooks';
enum ButtonStatus {
  notConnect,
  noExits,
  noBalance,
  invalidPair,
  loading,
  notSelectedToken,
  ready,
}

export type ButtonImportPoolProps = {
  pairInfo: PairInfo;
};

export const ButtonImportPool: React.FC<ButtonImportPoolProps> = ({ pairInfo }) => {
  const { account } = useUserWallet();
  const { currencyA, currencyB, liquidityToken, pairState, isStablePool } = pairInfo;
  const lpBalance = useTokenBalance(liquidityToken);
  const [connect] = useModalConnectWallet();
  const history = useHistory();
  const savePool = useSavePool();

  const isLoading = useMemo(() => {
    return (
      pairState === PairState.LOADING || (pairState === PairState.EXISTS && lpBalance === null)
    );
  }, [pairState, lpBalance]);

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!currencyA || !currencyB) {
      return ButtonStatus.notSelectedToken;
    }
    if (currencyA === currencyB || currencyA.wrapped.equals(currencyB.wrapped)) {
      return ButtonStatus.invalidPair;
    }
    if (isLoading) {
      return ButtonStatus.loading;
    }
    if (pairState === PairState.NOT_EXISTS) {
      return ButtonStatus.noExits;
    }
    if (pairState === PairState.EXISTS && (!lpBalance || lpBalance?.lte(Zero))) {
      return ButtonStatus.noBalance;
    }
    return ButtonStatus.ready;
  }, [account, currencyA, currencyB, isLoading, lpBalance, pairState]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
      case ButtonStatus.noExits:
      case ButtonStatus.noBalance:
        return false;
      default:
        return true;
    }
  }, [status]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect wallet`;
      case ButtonStatus.notSelectedToken:
        return `Select a token`;
      case ButtonStatus.noExits:
        return `Create pool`;
      case ButtonStatus.noBalance:
        return `Add liquidity`;
      case ButtonStatus.loading:
        return `Loading`;
      case ButtonStatus.invalidPair:
        return 'Invalid Pair';
      default:
        return 'Add Liquidity';
    }
  }, [status]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        connect();
        break;
      }
      case ButtonStatus.noExits:
      case ButtonStatus.noBalance:
        savePool({
          stable: isStablePool,
          address: liquidityToken,
          tokens: {
            currencyA: currencyA?.wrapped,
            currencyB: currencyB?.wrapped,
          },
        });
        isStablePool
          ? history.push(`/pools/stable/add/${liquidityToken}`)
          : history.push(
              `/pools/add/${
                currencyA?.isNative ? currencyA?.symbol : currencyA?.wrapped?.address
              }/${currencyB?.isNative ? currencyB?.symbol : currencyB?.wrapped?.address}`,
            );
        break;
      default: {
        savePool({
          stable: isStablePool,
          address: liquidityToken,
          tokens: {
            currencyA: currencyA?.wrapped,
            currencyB: currencyB?.wrapped,
          },
        });
        isStablePool
          ? history.push(`/pools/stable/add/${liquidityToken}`)
          : history.push(
              `/pools/add/${
                currencyA?.isNative ? currencyA?.symbol : currencyA?.wrapped?.address
              }/${currencyB?.isNative ? currencyB?.symbol : currencyB?.wrapped?.address}`,
            );
        break;
      }
    }
  }, [
    status,
    savePool,
    liquidityToken,
    currencyA?.isNative,
    currencyA?.symbol,
    currencyA?.wrapped,
    currencyB?.isNative,
    currencyB?.symbol,
    currencyB?.wrapped,
    connect,
    history,
    isStablePool,
  ]);

  const onRemoveClick = useCallback(() => {
    history.push(
      `/pools/remove/${currencyA?.isNative ? currencyA?.symbol : currencyA?.wrapped?.address}/${
        currencyB?.isNative ? currencyB?.symbol : currencyB?.wrapped?.address
      }`,
    );
  }, [
    currencyA?.isNative,
    currencyA?.symbol,
    currencyA?.wrapped,
    currencyB?.isNative,
    currencyB?.symbol,
    currencyB?.wrapped,
    history,
  ]);
  return (
    <StyledButtonWrapper double={status === ButtonStatus.ready}>
      {status === ButtonStatus.ready && (
        <StyledButton disabled={disabled} onClick={onRemoveClick} className="remove">
          Remove Liquidity
        </StyledButton>
      )}
      <StyledButton
        disabled={disabled}
        onClick={onButtonClick}
        isLoading={status === ButtonStatus.loading}
      >
        {buttonText}
      </StyledButton>
    </StyledButtonWrapper>
  );
};

const StyledButton = styled(Button)`
  font-size: 14px;
  width: auto;

  ${screenUp('lg')`
    height: 32px;
  `}
  &.remove {
    background: transparent;
    border: 1px solid ${(p) => p.theme.button.toggle.color};
    color: ${(p) => p.theme.button.toggle.color};
    :hover {
      color: ${(p) => p.theme.white};
      border: 1px solid ${(p) => p.theme.button.toggle.background};
    }
  }
`;
const StyledButtonWrapper = styled.div<{ double?: boolean }>`
  margin: 0 auto;
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 16px;
  grid-auto-columns: 1fr 1fr;
  width: ${(p) => (p.double ? '100%' : 'auto')};
`;
