import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, lazy, Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";

// const Authentication = lazy(() => import("./pages/Authentication"));
const Authpage = lazy(() => import("./pages/Authpage"));
const DrawerSlider = lazy(() => import("./pages/Drawer"));
const Heropage = lazy(() => import("./pages/Heropage"));
const Pages = lazy(() => import("./pages/pages"));
const Viewpage = lazy(() => import("./pages/Viewpage"));
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
  const handleSave = (blog: { title: string; content: string }) => {
    console.log("Blog data:", blog);
  };

  const [darkMode, setDarkMode] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Authpage />} />
            <Route
              path="/drawer"
              element={
                <DrawerSlider
                  check={darkMode}
                  change={() => setDarkMode(!darkMode)}
                />
              }
            />
            <Route
              path="/heropage"
              element={<Heropage onSave={handleSave} />}
            />
            <Route path="/pages" element={<Pages />} />
            <Route path="/viewpage" element={<Viewpage />} />
            <Route path="/blogview/:id" element={<BlogDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
