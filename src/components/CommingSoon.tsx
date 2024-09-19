import styled from 'styled-components';
import comingsoon from '../assets/images/coming-soon.png';
import bgcomingsoon from '../assets/images/bg-coming-soon.png';
import { screenUp } from '../utils/styles';

const CommingSoon: React.FC = () => {
  return (
    <StyledCommingSoon>
      <img src={comingsoon} alt="comming-soon" />
      <StyledText>Coming soon</StyledText>
    </StyledCommingSoon>
  );
};

export default CommingSoon;

const StyledCommingSoon = styled.div`
  margin-bottom: -50px;
  position: relative;
  min-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  img {
    width: 220px;
  }
  ::before {
    content: '';
    display: block;
    position: absolute;
    z-index: -1;
    bottom: 0px;
    right: 20px;
    width: 200px;
    height: 230px;
    background-image: url(${bgcomingsoon});
    background-size: 200px;
    background-repeat: no-repeat;
    background-position: right bottom;
    ${screenUp('lg')`
        right: 35px;
        width: 400px;
        height: 380px;
        background-size: 300px;
      `}
  }
`;

const StyledText = styled.div`
  padding-top: 20px;
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  text-align: center;
  ${screenUp('lg')`
    font-size: 40px;
  `}
`;
