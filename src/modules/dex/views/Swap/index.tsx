import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { container, screenUp } from '../../../../utils/styles';
import { useUpdateGasPrice } from '../../hooks/useUpdateGasPrice';
import { useUpdateTokenList } from '../../hooks/useUpdateTokenList';
import Info from './components/Info';
import SwapPage from './Swap';
import LimitOrder from '../LimitOrder';

const Swap: React.FC = () => {
  useUpdateTokenList();
  useUpdateGasPrice();

  return (
    <StyledContainer>
      <Info />
      <StyledContent>
        <Switch>
          <Route exact path={'/swap'} component={SwapPage} />
          <Route path="/swap/limit-orders" exact component={LimitOrder} />
        </Switch>
      </StyledContent>
    </StyledContainer>
  );
};

export default Swap;

const StyledContainer = styled.div``;

const StyledContent = styled.div`
  ${container};
  padding-top: 16px;
  ${screenUp('lg')`
    padding-top: 32px;
  `}
`;
