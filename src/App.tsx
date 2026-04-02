import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTheme } from "./pages/theme";
import { lazy, Suspense, useState, useMemo } from "react";
import { CircularProgress, Box } from "@mui/material";
import type { PaletteMode } from "@mui/material";

const Authpage = lazy(() => import("./pages/Authpage"));
const DrawerSlider = lazy(() => import("./pages/Homepage"));
const BlogDetail = lazy(() => import("./pages/Blogview"));
const Profile = lazy(() => import("./pages/profile"));

const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <CircularProgress sx={{ color: "#1a6fd4" }} />
  </Box>
);

function App() {
  const [mode, setMode] = useState<PaletteMode>("light");
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Authpage />} />
            <Route
              path="/HomePage/*"
              element={<DrawerSlider mode={mode} toggleMode={toggleMode} />}
            />

            <Route path="/blogview/:id" element={<BlogDetail />} />

            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
