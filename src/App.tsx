import "./App.css";
import Authentication from "./pages/Authentication";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Heropage from "./pages/Heropage";
import DrawerSlider from "./pages/Drawer";
import Pages from "./pages/pages";
import Viewpage from "./pages/Viewpage";
import BlogDetail from "./pages/Blogview";
import Profile from "./pages/profile";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";

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
    <>
      <BrowserRouter>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Authentication />} />
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
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
