import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { container } from '../../../../utils/styles';
import PoolDetail from '../PoolDetail';
import StablePool from '../StablePool';
import ImportPool from '../ImportPool';
import MyPools from './components/MyPools';
import Info from './components/Info';
import PoolsPage from './Pools';
import { useFetchGraphPoolDatas } from '../../hooks/useFetchGraphPoolDatas';
import { useUpdateTokenList } from '../../hooks/useUpdateTokenList';

const Pools: React.FC = () => {
  useFetchGraphPoolDatas();
  useUpdateTokenList();
  return (
    <StyledContainer>
      {(window.location.pathname === '/pools' ||
        window.location.pathname === '/pools/my-pools') && <Info />}
      <StyledContent>
        <Switch>
          <Route exact path={'/pools'} component={PoolsPage} />
          <Route exact path={'/pools/my-pools'} component={MyPools} />
          <Route path="/pools/import" exact component={ImportPool} />
          <Route path="/pools/add" exact component={PoolDetail} />
          <Route path="/pools/add/:currencyIdA" exact component={PoolDetail} />
          <Route path="/pools/add/:currencyIdA/:currencyIdB" exact component={PoolDetail} />
          <Route path="/pools/remove/:currencyIdA/:currencyIdB" exact component={PoolDetail} />
          <Route path="/pools/stable/add/:poolAddress" exact component={StablePool} />
          <Route path="/pools/stable/remove/:poolAddress" exact component={StablePool} />
        </Switch>
      </StyledContent>
    </StyledContainer>
  );
};

export default Pools;

const StyledContainer = styled.div``;

const StyledContent = styled.div`
  ${container};
`;
