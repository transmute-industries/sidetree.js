import React from 'react';
import { Theme as ThemeType } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// https://materialui.co/colors/

const primaryFont = 'Rajdhani';
// not sure why this is happening...
// but it looks correct without this.
// const secondaryFont = "Roboto Condensed";
const tertiaryFont = 'Lato';

import { ColorModeContext } from './dark-mode-toggle';

export const Theme = ({ children }: { children: any }) => {
  const [mode, setMode] = React.useState('dark');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const primaryPurpleNormal = '#594aa8';
  const primaryPurpleLight = '#7e71c1';
  const theme: ThemeType = React.useMemo(() => {
    const primaryColorDark = '#151726';

    const prefersDarkMode = mode === 'dark';
    const primaryColor = prefersDarkMode
      ? primaryPurpleLight
      : primaryPurpleLight;
    const secondaryColor = prefersDarkMode ? '#4FC3F7' : '#4FC3F7';
    const backgroundPaper = prefersDarkMode ? primaryColorDark : '#E8EAF6';
    const textSecondary = prefersDarkMode ? '#8286a3' : '#8286a3';
    const textPrimary = prefersDarkMode ? '#E0E0E0' : '#212121';
    const borderColor = prefersDarkMode
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.12);';

    return createTheme({
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              backgroundColor: backgroundPaper,
              border: 'none',
              borderWidth: 0,
              borderStyle: 'solid',
              borderColor: borderColor,
              borderBottomWidth: 'thin',
            },
          },
        },
      },
      palette: {
        mode,

        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
        },
        text: {
          primary: textPrimary,
          secondary: textSecondary,
        },
        background: {
          default: backgroundPaper,
          paper: backgroundPaper,
        },
      },
      typography: {
        fontFamily: primaryFont,
        fontSize: 16,
        h1: {
          color: primaryColor,
          fontFamily: primaryFont,
          fontWeight: 400,
        },
        h2: {
          fontFamily: primaryFont,
          fontWeight: 400,
        },
        h3: {
          fontSize: '28pt',
          fontFamily: 'unset',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          fontWeight: 100,
        },
        h4: {
          fontSize: '18pt',
          fontFamily: 'unset',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          fontWeight: 100,
        },
        h5: {
          fontFamily: tertiaryFont,
        },
        h6: {
          fontFamily: tertiaryFont,
        },
      },
    } as any);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
