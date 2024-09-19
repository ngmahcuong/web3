import 'styled-components';

declare module 'styled-components' {
  interface DefaultTheme {
    background: string;
    black: string;
    white: string;
    red: string;
    muted: string;
    success: string;
    warning: string;
    danger: string;
    gray1: string;
    gray2: string;
    gray3: string;
    gray4: string;
    gray5: string;
    gray6: string;
    header: {
      background: string;
      background2: string;
      background3: string;
    };
    green?: string;
    orange: string;
    box: {
      background: string;
      border: string;
      innerBackground: string;
      innerBackground2: string;
      itemBackground: string;
      itemBackgroundHover: string;
      text: string;
      header: string;
      border2: string;
      border3: string;
      border4: string;
    };
    button: {
      primary: {
        backgroundDisabled: string;
        hover: string;
        background: string;
      };
      danger: {
        background: string;
        hover: string;
      };
      outline: {
        color: string;
      };
      toggle: {
        background: string;
        color: string;
      };
      connect: {
        color: string;
        background: string;
        borderColor: string;
        hover: string;
      };
    };
    input: {
      border: string;
      disable: string;
      background: string;
      placeholder: string;
    };
    text: {
      primary: string;
      highlight: string;
      muted: string;
      warning: string;
    };
    card: {
      header: string;
      body: string;
      secondary: string;
      border: string;
    };
    badge: {
      background: string;
      color: string;
    };
    icon: {
      border: string;
    };
  }
}
