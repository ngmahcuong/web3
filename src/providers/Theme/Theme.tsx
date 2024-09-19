import React, { useLayoutEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../../components/GlobalStyle';
import { AppState } from '../../state';
import dark from './dark';
import light from './light';

const AllThemes = {
  dark,
  light,
};

export const Theme: React.FC = ({ children }) => {
  const theme = useSelector((t: AppState) => t.application.theme);

  const themeValue = useMemo(() => {
    return AllThemes[theme];
  }, [theme]);

  useLayoutEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  return (
    <ThemeProvider theme={themeValue}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};
