import NativeLightTheme from './NativeLightTheme';
import NativeDarkTheme from './NativeDarkTheme';

const getTheme = isDark => {
  if (isDark) {
    return NativeDarkTheme;
  }
  return NativeLightTheme;
};

export default getTheme;
