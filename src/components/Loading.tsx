import styled from 'styled-components';
import loadingBlack from '../assets/images/loading-black.png';
import loadingWhite from '../assets/images/loading-white.png';
import { useToggleTheme } from '../state/application/hooks';
import { screenUp } from '../utils/styles';

const Loading: React.FC = () => {
  const [theme] = useToggleTheme();

  return (
    <StyledLoading>
      <img src={theme === 'dark' ? loadingWhite : loadingBlack} alt="logo" />
    </StyledLoading>
  );
};

export default Loading;

const StyledLoading = styled.div`
  padding: 200px 0 50px 0;
  text-align: center;

  img {
    width: 150px;
    opacity: 0.9;
    transform-origin: top center;
    animation-name: swing;
    animation-iteration-count: infinite;
    animation-duration: 1000ms;
  }
  ${screenUp('lg')`
    img {
      width: 200px;
    }
  `}
`;
