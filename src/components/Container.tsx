import styled from 'styled-components';
import { screenUp } from '../utils/styles';

export const Container = styled.div`
  padding: 0 0 50px 0;
  margin: auto;
  position: relative;
  ${screenUp('lg')`
    min-height: calc(100vh - 80px);
  `}
`;
