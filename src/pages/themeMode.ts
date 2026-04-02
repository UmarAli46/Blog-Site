
import { useState} from "react";
import type { PaletteMode } from "@mui/material";

export const useThemeMode = () => {
  const [mode, setMode] = useState<PaletteMode>(() => {
   
    return (localStorage.getItem("themeMode") as PaletteMode) ?? "light";
  });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next); 
      return next;
    });
  };

  return { mode, toggleMode };
};