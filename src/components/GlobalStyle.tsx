import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    background-color: ${(p) => p.theme.background};
    color: ${(p) => p.theme.text.primary};
    transition: all 150ms linear;
  }

  button {
    font-family: inherit;
    border: none;
    background: transparent;
    color: inherit;

    &:not(:disabled) {
      cursor: pointer;
    }

    &:focus,
    &:active {
      outline: none;
    }

    :disabled {
      pointer-events: none;
    }
  }

  input {
    font-family: inherit;
    color: inherit;

    &:focus {
      outline: none;
    }
  }

  a, a:visited {
    text-decoration: none;
  }

  a {
    color: inherit;
  }

  h1, h2, h3, h4, h5 {
    margin: 0;
  }

  ul, ol {
    list-style: none;
  }

  .custom-tooltip {
    max-width: 80%
  }

  .no-scroll {
    overflow: hidden;
  }

  span.highlight {
    color: ${(props) => props.theme.success} !important;
  }

  .d-block{
    display: block;
  }
`;
