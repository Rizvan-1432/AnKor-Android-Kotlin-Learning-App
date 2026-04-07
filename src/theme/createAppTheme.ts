import { createTheme } from '@mui/material/styles'

export function createAppTheme(options: {
  isDark: boolean
  fontSize: number
  highContrast: boolean
}) {
  const { isDark, fontSize, highContrast } = options

  const secondaryText = highContrast
    ? isDark
      ? '#e4e4e7'
      : '#3f3f46'
    : isDark
      ? '#9ca3af'
      : '#64748b'

  return createTheme({
    palette: isDark
      ? {
          mode: 'dark',
          contrastThreshold: highContrast ? 4.5 : 3,
          primary: {
            main: '#7cb3ff',
            light: '#a8cfff',
            dark: '#5a9cf5',
            contrastText: '#030712',
          },
          secondary: {
            main: '#94a3b8',
            light: '#b8c4d4',
            dark: '#6b7a90',
          },
          error: { main: '#f87171' },
          warning: { main: '#fbbf24' },
          success: { main: '#4ade80' },
          info: { main: '#38bdf8' },
          background: {
            default: '#0b0d12',
            paper: '#13161f',
          },
          text: {
            primary: '#f4f4f5',
            secondary: secondaryText,
          },
          divider: 'rgba(255, 255, 255, 0.085)',
          action: {
            active: 'rgba(255, 255, 255, 0.72)',
            hover: 'rgba(255, 255, 255, 0.06)',
            selected: 'rgba(124, 179, 255, 0.16)',
            disabled: 'rgba(255, 255, 255, 0.28)',
            disabledBackground: 'rgba(255, 255, 255, 0.08)',
          },
        }
      : {
          mode: 'light',
          contrastThreshold: highContrast ? 4.5 : 3,
          primary: {
            main: '#2563eb',
            light: '#3b82f6',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#64748b',
            light: '#77859d',
            dark: '#475569',
          },
          error: { main: '#dc2626' },
          warning: { main: '#d97706' },
          success: { main: '#059669' },
          info: { main: '#0284c7' },
          background: {
            default: '#eef2f7',
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a',
            secondary: secondaryText,
          },
          divider: 'rgba(15, 23, 42, 0.09)',
          action: {
            active: 'rgba(15, 23, 42, 0.72)',
            hover: 'rgba(15, 23, 42, 0.05)',
            selected: 'rgba(37, 99, 235, 0.1)',
            disabled: 'rgba(15, 23, 42, 0.32)',
            disabledBackground: 'rgba(15, 23, 42, 0.06)',
          },
        },
    shape: {
      borderRadius: 11,
    },
    typography: {
      fontFamily:
        '"DM Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize,
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontWeight: 600, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius * 1.15,
            textTransform: 'none',
            fontWeight: 600,
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius * 1.35,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius * 1.25,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            backgroundImage: 'none',
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontWeight: 500,
            borderRadius: theme.shape.borderRadius,
          }),
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
    },
  })
}
