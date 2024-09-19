import styled from 'styled-components';
// import CommingSoon from '../../../../components/CommingSoon';
import { screenUp } from '../../../../utils/styles';
import { LimitOrderBox } from './components/LimitOrderBox';
import { LimitOrderMyOrder } from './components/LimitOrderMyOrder';
const LimitOrder: React.FC = () => {
  return (
    <BoxContainer>
      {/* <CommingSoon /> */}
      <StyledContent>
        <LimitOrderMyOrder />
        <LimitOrderBox />
      </StyledContent>
    </BoxContainer>
  );
};

const BoxContainer = styled.div``;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: 5fr 3fr;
    grid-gap: 30px;
    padding-top: 16px;
  `}
`;

export default LimitOrder;
