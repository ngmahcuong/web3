import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export type Size = 'sm' | 'md' | 'lg';

const Heights: Record<Size, number> = {
  sm: 30,
  md: 40,
  lg: 46,
};

const BorderRadius = {
  sm: '3px',
  md: '3px',
  lg: '3px',
};

const FontSize = {
  sm: '14px',
  md: '16px',
  lg: '16px',
};

const FontWeight = {
  sm: 500,
  md: 500,
  lg: 500,
};

const buttonStyle = css<{
  error?: boolean;
  size?: Size;
  block?: boolean;
  isLoading?: boolean;
}>`
  padding: 0 10px;
  font-size: ${(p) => FontSize[p.size || 'lg']};
  border-radius: ${(p) => BorderRadius[p.size || 'lg']};
  font-weight: ${(p) => FontWeight[p.size || 'lg']};
  color: ${(p) => p.theme.white};
  line-height: 1;
  display: ${(p) => (p.block ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  height: ${(p) => Heights[p.size || 'lg']}px;
  width: ${(p) => (p.block ? '100%' : '')};
  background-color: ${({ theme }) => theme.button.primary.background};

  i,
  img {
    margin-right: 8px;
    margin-bottom: 1px;
  }

  :not(:disabled) {
    cursor: pointer;
    :hover {
      background-color: ${({ theme }) => theme.button.primary.hover};
    }
  }
  :disabled {
    pointer-events: none;
    color: ${(p) => p.theme.gray3};
    background: ${(p) => p.theme.button.primary.backgroundDisabled};
  }

  &::after {
    content: ' ';
    text-align: left;
    width: 1rem;
    animation: dots 1.4s linear infinite;
    display: ${(p) => (p.isLoading ? 'inline-block' : 'none')};
  }
`;

const buttonOutlineStyle = css<{
  error?: boolean;
  size?: Size;
  block?: boolean;
  isLoading?: boolean;
}>`
  position: relative;
  z-index: 1;
  padding: 0px 10px;
  font-size: ${(p) => FontSize[p.size || 'lg']};
  border-radius: ${(p) => BorderRadius[p.size || 'lg']};
  font-weight: ${(p) => FontWeight[p.size || 'lg']};
  color: ${({ theme }) => theme.button.outline.color};
  display: ${(p) => (p.block ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  height: ${(p) => Heights[p.size || 'lg']}px;
  border: solid 1px ${({ theme }) => theme.button.outline.color};

  i,
  img {
    margin-right: 8px;
    margin-bottom: 1px;
  }

  :not(:disabled) {
    cursor: pointer;
    :hover {
      background-color: ${({ theme }) => theme.button.primary.background};
      border-color: ${({ theme }) => theme.button.primary.background};
      color: ${(p) => p.theme.white};
    }
  }

  :disabled {
    pointer-events: none;
    color: ${(p) => p.theme.gray3};
    border: 1px solid ${({ error, theme }) => (error ? theme.danger : theme.black)};
  }

  &::after {
    content: ' ';
    text-align: left;
    width: 1rem;
    animation: dots 1.4s linear infinite;
    display: ${(p) => (p.isLoading ? 'inline-block' : 'none')};
  }
`;

export const Button = styled.button<{
  error?: boolean;
  size?: Size;
  block?: boolean;
  isLoading?: boolean;
}>`
  ${buttonStyle};
`;

export const ButtonOutline = styled.button<{
  error?: boolean;
  size?: Size;
  block?: boolean;
  isLoading?: boolean;
}>`
  ${buttonOutlineStyle};
`;

export const ButtonLink = styled(NavLink)<{
  error?: boolean;
  size?: Size;
  block?: boolean;
}>`
  ${buttonStyle};
`;

export const ButtonLinkOutline = styled(NavLink)<{
  error?: boolean;
  size?: Size;
  block?: boolean;
}>`
  ${buttonOutlineStyle};
`;
