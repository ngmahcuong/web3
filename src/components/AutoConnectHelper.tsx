import { useWeb3React } from '@web3-react/core';
import { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { config, networkUrls, supportedChainIds } from '../config';
import { evmConnectors } from '../hooks/useConnectWallet';
import { NetworkConnector } from '../libs/NetworkConnector';
import { useUserWallet } from '../providers/UserWalletProvider';
import { AppState } from '../state';
import { changeChain } from '../state/user/actions';

const ReadConnector = new NetworkConnector({
  urls: networkUrls,
  defaultChainId: config.defaultChainId,
});

const AutoConnectHelper: React.FC = () => {
  const { connector, activate, chainId } = useWeb3React();
  const user = useSelector((s: AppState) => s.user);
  const wallet = useUserWallet();
  const dispatch = useDispatch();

  useEffect(() => {
    console.info('Activate read connector');
    activate(ReadConnector);
  }, [activate]);

  // change chain id when user connected
  useEffect(() => {
    if (user.chainId && chainId !== user.chainId && connector instanceof NetworkConnector) {
      connector.changeChainId(user.chainId);
    }
  }, [chainId, connector, user.chainId]);

  useEffect(() => {
    if (!wallet.active && user.connector) {
      const connector = evmConnectors[user.connector];
      let isResolved = false;
      connector
        .getChainId()
        .then((cId) => {
          isResolved = true;
          if (supportedChainIds.includes(+cId)) {
            if (window.ethereum?.isMetaMask) {
              window.ethereum._metamask.isUnlocked().then((isUnlocked) => {
                if (isUnlocked) {
                  wallet.activate(connector);
                } else {
                  dispatch(changeChain());
                }
              });
              return;
            }
          }
        })
        .catch((e) => {
          console.warn('Cannot get chainId from saved connector', e);
        });
      setTimeout(() => {
        if (!isResolved) {
          dispatch(changeChain());
        }
      }, 100);
    }
  }, [dispatch, user.connector, wallet, wallet.active]);

  useLayoutEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (id) => {
        console.info('detech switch to chain', id);
        if (connector instanceof NetworkConnector) {
          connector.getChainId().then((currentId) => {
            if (currentId === +id) {
              return;
            }
            if (supportedChainIds.includes(+id)) {
              connector.changeChainId(+id);
            } else {
              connector.changeChainId(config.defaultChainId);
              dispatch(changeChain());
            }
          });
        }
      });
    }
  }, [connector, dispatch]);

  return <></>;
};

export default AutoConnectHelper;
