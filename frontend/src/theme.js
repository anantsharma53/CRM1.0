import { createTheme } from "@mui/material/styles";

const commonTypography = {
  fontFamily: '"Outfit", "Inter", system-ui, sans-serif',
  h1: { fontFamily: '"Cabinet Grotesk", "Outfit", sans-serif', fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-0.02em", lineHeight: 1.1 },
  h2: { fontFamily: '"Cabinet Grotesk", "Outfit", sans-serif', fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em" },
  h3: { fontFamily: '"Cabinet Grotesk", "Outfit", sans-serif', fontWeight: 700, fontSize: "1.5rem" },
  h4: { fontFamily: '"Cabinet Grotesk", "Outfit", sans-serif', fontWeight: 700, fontSize: "1.25rem" },
  h5: { fontFamily: '"Cabinet Grotesk", "Outfit", sans-serif', fontWeight: 600, fontSize: "1.125rem" },
  h6: { fontFamily: '"Cabinet Grotesk", "Outfit", sans-serif', fontWeight: 600, fontSize: "1rem" },
  button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.02em" },
  overline: { fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#132A13", light: "#31572C", dark: "#0A170A", contrastText: "#FFFFFF" },
    secondary: { main: "#A6422F", light: "#D26B58", dark: "#7A2E20", contrastText: "#FFFFFF" },
    background: { default: "#F4F5F7", paper: "#FFFFFF" },
    text: { primary: "#121212", secondary: "#5C6B64", disabled: "#A0AAB2" },
    divider: "#E2E8F0",
    success: { main: "#4F772D" },
    warning: { main: "#D97736" },
    error: { main: "#9E2A2B" },
    info: { main: "#4A6FA5" },
  },
  shape: { borderRadius: 8 },
  typography: commonTypography,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#F4F5F7" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, boxShadow: "none", padding: "9px 18px", textTransform: "none", fontWeight: 600 },
        containedPrimary: { "&:hover": { backgroundColor: "#0A170A", boxShadow: "none" } },
        outlined: { borderColor: "#E2E8F0" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: "none", border: "1px solid #E2E8F0", backgroundImage: "none" },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", boxShadow: "none" } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: "#FAFAFA",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#132A13", borderWidth: 2 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #E2E8F0", padding: "14px 16px", fontSize: "0.875rem" },
        head: { fontWeight: 700, backgroundColor: "#F8F9FA", color: "#5C6B64", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundColor: "#0B100E", color: "#F4F5F7", borderRight: "none" } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 4, fontWeight: 600, fontSize: "0.72rem" } } },
  },
});

export const CHART_COLORS = ["#132A13", "#A6422F", "#729B79", "#D97736", "#4A6FA5", "#5C6B64", "#4F772D"];
