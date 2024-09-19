import {
  css,
  CSSObject,
  Interpolation,
  InterpolationFunction,
  ThemedStyledProps,
} from 'styled-components';

export const BreakPoints = {
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
  xxxl: '1600px',
};

export function screenUp(minWidth: keyof typeof BreakPoints, props?: any) {
  return function (
    style:
      | string
      | TemplateStringsArray
      | CSSObject
      | InterpolationFunction<ThemedStyledProps<any, any>>,
    ...args: Array<Interpolation<ThemedStyledProps<any, any>>>
  ) {
    let css = '';
    if (Array.isArray(style)) {
      css = style
        .map((part, i) => {
          const arg = args[i];
          if (typeof arg === 'string') {
            return part + arg;
          }

          if (typeof arg === 'function') {
            return part + arg.call(null, props);
          }

          return part;
        })
        .join('');
    } else {
      css = style.toString();
    }
    return `@media screen and (min-width: ${BreakPoints[minWidth]}) {` + css + '}';
  };
}

export type ColorVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'white'
  | 'black'
  | 'gray3'
  | 'text.primary';

export const colorVariant = css<{ variant: ColorVariant }>`
  color: ${(p) => (p.variant ? p.theme[p.variant] : p.theme.black)};
`;

export const tabColor = css<{ active: boolean }>`
  color: ${({ active, theme }) => (active ? theme.white : '#686b6b')};
  background-color: ${({ active, theme }) => (active ? theme.success : '#dbd8d4')};
`;

export const container = css`
  max-width: 1488px;
  width: auto;
  padding: 0 15px;
  margin: 0 auto;
`;
