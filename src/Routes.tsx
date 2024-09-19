import { lazy } from 'react';
import { Redirect, Route } from 'react-router-dom';
const Lending = lazy(() => import('./modules/lending/views/Lending'));
const Lockdrop = lazy(() => import('./modules/lending/views/Lockdrop'));
const Swap = lazy(() => import('./modules/dex/views/Swap'));
const Launchpad = lazy(() => import('./modules/launchpad/views/LaunchpadDetail'));
const Pools = lazy(() => import('./modules/dex/views/Pools'));
const Staking = lazy(() => import('./modules/staking/views'));
const Faucet = lazy(() => import('./modules/faucet/views'));

const Routes: React.FC = () => {
  return (
    <>
      <Route path="/" exact>
        <Redirect to="/lending" />
      </Route>
      <Route path="/lending" component={Lending} />
      <Route path="/swap" component={Swap} />
      <Route path="/pools" component={Pools} />
      <Route path="/lockdrop" component={Lockdrop} />
      <Route path="/launchpad" component={Launchpad} />
      <Route path="/staking" component={Staking} />
      <Route path="/faucet" component={Faucet} />
    </>
  );
};

export default Routes;
