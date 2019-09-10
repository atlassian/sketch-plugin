import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Global, css } from '@emotion/core';
import { ThemeProvider } from 'emotion-theming';
import WindowFocusContext from './context/WindowFocusContext';
import SymbolPalette from './SymbolPalette';
import getTheme from './theme/getTheme';

window.controller = {};

const SketchTheme = {
  Light: 'light',
  Dark: 'dark',
};

const App = () => {
  const [sketchTheme, setSketchTheme] = useState(SketchTheme.Light);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    window.controller.setSketchTheme = value => setSketchTheme(value);
  }, []);
  useEffect(() => {
    window.controller.setIsFocused = value => setIsFocused(!!value);
  }, []);

  const theme = getTheme(sketchTheme === SketchTheme.Dark);

  return (
    <ThemeProvider theme={theme}>
      <WindowFocusContext.Provider value={isFocused}>
        <Global
          styles={css`
            html {
              position: fixed;
            }
            body {
              margin: 0;
            }
          `}
        />
        <SymbolPalette />
      </WindowFocusContext.Provider>
    </ThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
