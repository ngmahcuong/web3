import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  background: '#121313',
  black: '#382c1a',
  white: '#fff',
  red: '#f22623',
  muted: '#c3d6ce',
  success: '#5cd896',
  warning: '#bc8346',
  danger: '#d94457',
  gray1: '#e2e0e0',
  gray2: '#d7d7d7',
  gray3: '#c3d6ce',
  gray4: '#737676',
  gray5: '#cbcbcb',
  gray6: '#909294',
  header: {
    background: '#4b9b70',
    background2: '#29322d',
    background3: '#131714',
  },
  green: '#4a9b7021',
  orange: '#c28058',
  box: {
    background: '#29322d',
    border: '#27322c',
    innerBackground: '#29322d',
    innerBackground2: '#323f38',
    itemBackground: '#202924',
    itemBackgroundHover: '#2b342f',
    text: '#ffffff',
    header: '#29322d',
    border2: '#42534a',
    border3: '#42534a',
    border4: '#4d5752',
  },
  button: {
    primary: {
      backgroundDisabled: '#666e69',
      hover: '#4dab79',
      background: '#428f65',
    },
    danger: {
      background: '#d94457',
      hover: '#f06779',
    },
    outline: {
      color: '#ffffff',
    },
    toggle: {
      background: '#428f65',
      color: '#ffffff',
    },
    connect: {
      color: '#ffffff',
      background: 'transparent',
      borderColor: '#fff',
      hover: '#4dab79',
    },
  },
  input: {
    border: '#121313',
    disable: '#c3d6ce',
    background: '#121313',
    placeholder: '#ffffff4d',
  },
  text: {
    primary: '#ffffff',
    highlight: '#5cd896',
    muted: '#bebab1',
    warning: '#c28058',
  },
  card: {
    header: '#29322d',
    body: '#202924',
    secondary: '#29322d',
    border: '#27322c',
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
