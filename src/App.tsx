import React, { Suspense, useMemo } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Switch } from 'react-router';
import { store } from './state';
import { Updaters } from './state/updaters';
import Modals from './providers/Modals';
import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { Theme } from './providers/Theme/Theme';
import { Container } from './components/Container';
import { Popups } from './components/Popups';
import FactoryProvider from './providers/ContractRegistryProvider';
import Loading from './components/Loading';
import { QueuedMulticallProvider } from '@reddotlabs/multicall-react';
import Routes from './Routes';
import { Web3ReactUserWalletProvider } from './providers/UserWalletProvider';
import AutoConnectHelper from './components/AutoConnectHelper';
import { getMulticallAddress } from './config';
import Header from './components/Header';
import GraphProvider from './providers/GraphProvider';

const getLibrary = (p: ExternalProvider | JsonRpcFetchFunc) => {
  return new Web3Provider(p);
};

export const App: React.FC = () => {
  return (
    <Providers>
      <Popups />
      <Header />
      <Container>
        <Suspense fallback={<Loading />}>
          <Switch>
            <Routes />
          </Switch>
        </Suspense>
      </Container>
    </Providers>
  );
};

export default App;

const MulticallProvider: React.FC = ({ children }) => {
  const { library, chainId } = useWeb3React();
  const address = useMemo(() => {
    return getMulticallAddress(chainId);
  }, [chainId]);

  return (
    <QueuedMulticallProvider rpcProvider={library} multicallAddress={address}>
      {children}
    </QueuedMulticallProvider>
  );
};

const Providers: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <MulticallProvider>
        <Web3ReactUserWalletProvider getLibrary={getLibrary}>
          <Provider store={store}>
            <AutoConnectHelper />
            <Theme>
              <FactoryProvider>
                <GraphProvider>
                  <Updaters />
                  <Modals>
                    <BrowserRouter>{children}</BrowserRouter>
                  </Modals>
                </GraphProvider>
              </FactoryProvider>
            </Theme>
          </Provider>
        </Web3ReactUserWalletProvider>
      </MulticallProvider>
    </Web3ReactProvider>
  );
};
