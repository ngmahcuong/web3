import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  background: '#e6e4e2',
  black: '#382c1a',
  white: '#fff',
  red: '#f22623',
  muted: '#686b6b',
  success: '#418e65',
  warning: '#bc8346',
  danger: '#d94457',
  gray1: '#e2e0e0',
  gray2: '#d7d7d7',
  gray3: '#606060',
  gray4: '#737676',
  gray5: '#cbcbcb',
  gray6: '#909294',
  header: {
    background: '#4b9b70',
    background2: '#428f65',
    background3: '#4a9b70',
  },
  orange: '#c28058',
  green: '#4a9b7021',
  box: {
    background: '#f3eee8',
    innerBackground: '#ebe6e1',
    innerBackground2: '#ebe6e1',
    itemBackground: '#fbf6f0',
    itemBackgroundHover: '#f5f0ea',
    text: '#606060',
    border: '#e2e0e0',
    header: '#f3eee8',
    border2: '#d3d3d3',
    border3: '#d2d1d1',
    border4: '#e2e0e0',
  },
  button: {
    primary: {
      backgroundDisabled: '#b8b7b7',
      hover: '#4dab79',
      background: '#428f65',
    },
    danger: {
      background: '#d94457',
      hover: '#f06779',
    },
    outline: {
      color: '#428f65',
    },
    toggle: {
      background: '#ffffff',
      color: '#428f65',
    },
    connect: {
      color: '#428f66',
      background: '#ffffff',
      borderColor: '#e2e0e0',
      hover: '#eae5df',
    },
  },
  input: {
    border: '#e2e0e0',
    disable: '#60606099',
    background: '#ffffff',
    placeholder: '#382c1a4d',
  },
  text: {
    primary: '#382c1a',
    highlight: '#428f65',
    muted: '#606060',
    warning: '#c28058',
  },
  card: {
    header: '#f3eee8',
    body: '#fbf6f0',
    secondary: '#6060601a',
    border: '#e2e0e0',
  },
  badge: {
    background: 'rgb(66, 143, 101, 30%)',
    color: '#428f65',
  },
  icon: {
    border: '#d8d7d7',
  },
};

export default theme;
