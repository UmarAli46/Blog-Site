import { createTheme, type PaletteMode } from "@mui/material";

export const TOKENS = {
  copper:       "#C26E3E",
  copperLight:  "#E58D5B",
  copperDark:   "#A0592E",
  copperFaint:  "#F5DFD0",
  copperMid:    "#E8B48A",

  inkDark:  "#1A1A1A",
  inkMid:   "#4A4A4A",
  inkLight: "#888888",

  creamBg:    "#F9F5F0",
  creamPaper: "#FFFFFF",
  creamBorder:"#E0DCD6",
  creamDeep:  "#F2EBE3",

  
  darkBg:     "#121212",
  darkPaper:  "#1E1B18",     
  darkBorder: "#3A342E",
  darkDeep:   "#2A241F",
};

export const buildTheme = (mode: PaletteMode) => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main:  TOKENS.copper,
        light: TOKENS.copperLight,
        dark:  TOKENS.copperDark,
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? TOKENS.darkBg    : TOKENS.creamBg,
        paper:   isDark ? TOKENS.darkPaper : TOKENS.creamPaper,
      },
      text: {
        primary:   isDark ? "#F0EBE4" : TOKENS.inkDark,
        secondary: isDark ? "#B8A898" : TOKENS.inkMid,
        disabled:  isDark ? "#6E6056" : TOKENS.inkLight,
      },
      divider: isDark ? TOKENS.darkBorder : TOKENS.creamBorder,
      error:   { main: "#D84040" },
      success: { main: "#3DAA63" },
    },

    typography: {
      fontFamily: `'Lato', sans-serif`,
      h1: { fontFamily: `'Playfair Display', serif` },
      h2: { fontFamily: `'Playfair Display', serif` },
      h3: { fontFamily: `'Playfair Display', serif` },
      h4: { fontFamily: `'Playfair Display', serif` },
      h5: { fontFamily: `'Playfair Display', serif` },
      h6: { fontFamily: `'Playfair Display', serif` },
    },

    shape: { borderRadius: 8 },

    components: { 
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');
          * { box-sizing: border-box; }
          body { transition: background-color 0.3s ease, color 0.3s ease; }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontFamily: `'Lato', sans-serif`,
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? TOKENS.darkBorder : TOKENS.creamBorder}`,
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? TOKENS.darkBorder : TOKENS.creamBorder },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontFamily: `'Lato', sans-serif` },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: isDark ? TOKENS.darkBorder : TOKENS.creamBorder },
              "&:hover fieldset": { borderColor: TOKENS.copper },
              "&.Mui-focused fieldset": { borderColor: TOKENS.copper },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: TOKENS.copper },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            "&.Mui-selected": {
              backgroundColor: TOKENS.copper,
              color: "#FFFFFF",
              "&:hover": { backgroundColor: TOKENS.copperDark },
              "& .MuiListItemIcon-root": { color: "#FFFFFF" },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? TOKENS.darkPaper : TOKENS.creamPaper,
            borderBottom: `1px solid ${isDark ? TOKENS.darkBorder : TOKENS.creamBorder}`,
            color: isDark ? "#F0EBE4" : TOKENS.inkDark,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? TOKENS.darkPaper : TOKENS.creamPaper,
            borderRight: `1px solid ${isDark ? TOKENS.darkBorder : TOKENS.creamBorder}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            border: `1px solid ${isDark ? TOKENS.darkBorder : TOKENS.creamBorder}`,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: { "& .MuiAlert-root": { borderRadius: 8 } },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: TOKENS.copper,
            fontFamily: `'Lato', sans-serif`,
            fontWeight: 700,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? TOKENS.darkDeep : TOKENS.inkDark,
            fontFamily: `'Lato', sans-serif`,
            fontSize: "0.75rem",
          },
        },
      },
    },
  });
};