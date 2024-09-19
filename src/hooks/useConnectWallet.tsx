import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useMemo } from 'react';
import { ModalSelectWallet } from '../components/AccountModal/ModalSelectWallet';
import { networkUrls, supportedChainIds, config, ConnectorName } from '../config';
import { NetworkConnector } from '../libs/NetworkConnector';
import useModal from './useModal';

export const useModalConnectWallet = (): readonly [() => void, () => void] => {
  const modal = useMemo(() => {
    return <ModalSelectWallet />;
  }, []);
  return useModal(modal, 'select-wallet');
};

export const evmConnectors: Record<ConnectorName, AbstractConnector> = {
  injected: new InjectedConnector({
    supportedChainIds,
  }),
  walletconnect: new WalletConnectConnector({
    supportedChainIds,
    rpc: networkUrls,
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
  }),
  network: new NetworkConnector({
    urls: networkUrls,
    defaultChainId: config.defaultChainId,
  }),
};
