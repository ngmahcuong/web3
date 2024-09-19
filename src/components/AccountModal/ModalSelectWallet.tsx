import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Modal, {
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '../Modal/ModalStyles';
import MetamaskLogo from '../../assets/images/wallets/Metamask.png';
import WalletConnectLogo from '../../assets/images/wallets/WalletConnect.png';
import TrustWalletLogo from '../../assets/images/wallets/TrustWallet.svg';
import MathWalletLogo from '../../assets/images/wallets/MathWallet.svg';
import safeWalletLogo from '../../assets/images/wallets/SafeWallet.svg';
import TokenPocketLogo from '../../assets/images/wallets/TokenPocker.svg';
import { evmConnectors } from '../../hooks/useConnectWallet';
import { useState } from 'react';
import { UnsupportedChainIdError } from '@web3-react/core';
import { ChainId, ConnectorName, getChainConfig, getChainName } from '../../config';
import { Button, ButtonOutline } from '../Buttons';
import { useUserWallet } from '../../providers/UserWalletProvider';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import { UserRejectedRequestError as WalletConnectUserRejected } from '@web3-react/walletconnect-connector';
import { useDispatch } from 'react-redux';
import { connectToAccount } from '../../state/user/actions';

export type ModalSelectWalletProps = {
  onDismiss?: () => void;
};

const wallets: Array<{
  name: string;
  logo: string;
  connectorName: ConnectorName;
}> = [
  {
    name: 'MetaMask',
    logo: MetamaskLogo,
    connectorName: 'injected',
  },
  {
    name: 'Wallet Connect',
    logo: WalletConnectLogo,
    connectorName: 'walletconnect',
  },
  {
    name: 'Math Wallet',
    logo: MathWalletLogo,
    connectorName: 'injected',
  },
  {
    name: 'Trust Wallet',
    logo: TrustWalletLogo,
    connectorName: 'injected',
  },
  {
    name: 'Token Pocket',
    logo: TokenPocketLogo,
    connectorName: 'injected',
  },
  {
    name: 'Safe Wallet',
    logo: safeWalletLogo,
    connectorName: 'injected',
  },
];

type State =
  | { type: 'init' }
  | {
      type: 'loading';
    }
  | {
      type: 'wrongChain';
      expected: ChainId;
    };

export const ModalSelectWallet: React.FC<ModalSelectWalletProps> = ({ onDismiss }) => {
  const [wallet, setWallet] = useState<number>();
  const { error, activate, active, account, setError, chainId } = useUserWallet();
  const [state, setState] = useState<State>({ type: 'init' });
  const chainConfig = getChainConfig(ChainId.ropsten);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError) {
      setState({
        type: 'wrongChain',
        expected: ChainId.ropsten,
      });
    } else if (
      error instanceof UserRejectedRequestError ||
      error instanceof WalletConnectUserRejected
    ) {
      setState({
        type: 'init',
      });
      setWallet(null);
    }
  }, [error]);

  const onConnect = useCallback((ev: React.MouseEvent<HTMLButtonElement>) => {
    const id = +ev.currentTarget.dataset.wallet;
    setWallet(id);
    setState({ type: 'loading' });
  }, []);

  useEffect(() => {
    if (wallet == null) {
      return;
    }
    activate(evmConnectors[wallets[wallet].connectorName]);
  }, [wallet, activate]);

  const changeWallet = useCallback(() => {
    setWallet(null);
    setError(null);
    setState({
      type: 'init',
    });
  }, [setError]);

  useEffect(() => {
    if (account && active) {
      setState({ type: 'init' });
      onDismiss();
      const connector = wallet ? wallets[wallet].connectorName : 'injected';
      dispatch(
        connectToAccount({
          account,
          connector,
          chainId: chainId as ChainId,
        }),
      );
    }
  }, [account, active, chainId, dispatch, onDismiss, wallet]);

  const switchNetWork = useCallback(
    async (chainId: number) => {
      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + chainId.toString(16) }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: chainConfig.chainName,
                  chainId: '0x' + chainConfig.chainId.toString(16),
                  rpcUrls: [chainConfig.rpcUrl],
                  blockExplorerUrls: [chainConfig.blockExplorerUrl],
                  nativeCurrency: chainConfig.nativeCurrency,
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
    },
    [chainConfig],
  );

  const onClose = useCallback(() => {
    setError(null);
    onDismiss();
    setState({
      type: 'init',
    });
  }, [onDismiss, setError]);

  return (
    <StyledModal size="xs">
      <ModalHeader>
        <ModalTitle>Connect wallet</ModalTitle>
        <ModalCloseButton onClick={onClose} />
      </ModalHeader>
      <StyledModalContent>
        {state.type === 'init' && (
          <div>
            {wallets.map((item, index) => (
              <React.Fragment key={index}>
                {wallet == null || wallet === index ? (
                  <StyledWallet key={index} data-wallet={index} onClick={onConnect}>
                    {item.name}
                    <img src={item.logo} alt={item.name} />
                  </StyledWallet>
                ) : null}
              </React.Fragment>
            ))}
          </div>
        )}

        {state.type === 'loading' ? (
          <LoadingMessage>
            <span>Initializing</span>
          </LoadingMessage>
        ) : state.type === 'wrongChain' ? (
          <WrongChain>
            This dApp run on {getChainName(state.expected)} only. Please switch network on your
            wallet.
            <p>Please note that some wallet does not support switching network</p>
            <ModalButtons>
              <ButtonOutline onClick={changeWallet} size="md">
                Change Wallet
              </ButtonOutline>
              <Button onClick={() => switchNetWork(state.expected)} size="md">
                Switch network
              </Button>
            </ModalButtons>
          </WrongChain>
        ) : null}
      </StyledModalContent>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)``;

const StyledModalContent = styled(ModalContent)`
  padding: 0 24px 0 24px;
`;

const StyledWallet = styled.button`
  display: ${(p) => (p.hidden ? 'none' : 'flex')};
  align-items: center;
  width: 100%;
  padding: 14px 0;
  font-size: 16px;
  font-weight: normal;
  gap: 10px;

  img {
    width: 30px;
    height: 30px;
    margin-left: auto;
  }

  &:hover {
    color: ${({ theme }) => theme.success};
  }
  :not(:last-child) {
    border-bottom: 1px dashed ${(p) => p.theme.box.border};
  }
`;

const LoadingMessage = styled.div`
  margin: 20px 0;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 3px;

  span {
    &::after {
      content: ' ';
      text-align: left;
      width: 1rem;
      animation: dots 1.4s linear infinite;
      display: inline-block;
    }
  }
`;

const ModalButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WrongChain = styled.div`
  padding: 20px 0;
  font-size: 14px;
  font-weight: normal;
`;
