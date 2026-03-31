import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
// import Button from "@mui/material/Button";
import LayersIcon from "@mui/icons-material/Layers";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Paper from "@mui/material/Paper";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { Tooltip, Avatar, ThemeProvider } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { PaletteMode } from "@mui/material";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";

import Heropage from "./Heropage";
import Pages from "./pages";
import BuildBlogs from "./BuildBlogs";
import Bookmark from "./Bookmark";
import { buildTheme } from "./theme";

const drawerWidth = 240;

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent("#fff")}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": { opacity: 1, backgroundColor: "#aab4be" },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent("#fff")}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles("dark", { backgroundColor: "#003892" }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 10,
  },
}));

const Main = styled("main", { shouldForwardProp: (p) => p !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (p) => p !== "open",
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

type ViewType = "heropage" | "pages" | "viewpage" | "Bookmarks";

const navItems: { text: string; icon: React.ReactNode; view: ViewType }[] = [
  { text: "Create Blogs", icon: <NoteAddRoundedIcon />, view: "heropage" },
  { text: "Published Blogs", icon: <DescriptionIcon />, view: "pages" },
  { text: "View Blogs", icon: <FormatBoldIcon />, view: "viewpage" },
  { text: "Saved Blogs", icon: <BookmarkBorderIcon />, view: "Bookmarks" },
];

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

const getInitials = (f: string, l: string) =>
  `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase();

export default function DrawerSlider() {
  const muiTheme = useTheme();
  const navigate = useNavigate();

  const [mode, setMode] = useState<PaletteMode>("light");
  const appTheme = useMemo(() => buildTheme(mode), [mode]);

  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("viewpage");
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [userdetail, setUserDetail] = useState<UserDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserDetail(snap.data() as UserDetail);
      } catch (e) {
        console.error(e);
      }
    });
    return () => unsub();
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case "heropage":
        return <Heropage />;
      case "pages":
        return <Pages />;
      case "viewpage":
        return <BuildBlogs searchQuery={String(searchQuery)} />;
      case "Bookmarks":
        return <Bookmark />;
      default:
        return <BuildBlogs searchQuery={String(searchQuery)} />;
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" open={open} elevation={0}>
          <Toolbar
            sx={{
              px: { xs: 2, md: 4 },
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton
                onClick={() => setOpen(true)}
                edge="start"
                sx={[{ color: "text.secondary" }, open && { display: "none" }]}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LayersIcon sx={{ fontSize: 18, color: "white" }} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: `'Playfair Display', serif`,
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    letterSpacing: "-0.02em",
                    color: "text.primary",
                  }}
                >
                  Build
                  <Box component="span" sx={{ color: "primary.main" }}>
                    Blogs
                  </Box>
                </Typography>
              </Box>
            </Box>

            {/* <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
              {["Engineering", "Design", "Product", "Authors"].map((label) => (
                <Typography
                  key={label}
                  component="a"
                  href="#"
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "text.disabled",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    "&:hover": { color: "primary.main" },
                    transition: "color 0.2s",
                  }}
                >
                  {label}
                </Typography>
              ))}
            </Box> */}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {activeView === "viewpage" && (
                <Paper
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    height: 34,
                    borderRadius: "6px",
                    "&:focus-within": { borderColor: "primary.main" },
                    transition: "border-color 0.2s",
                  }}
                >
                  <SearchIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                  <InputBase
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles…"
                    sx={{ fontSize: "0.8rem", width: 160, "& input": { p: 0 } }}
                  />
                </Paper>
              )}
              {/* <Button
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: "text.primary",
                  color: "background.paper",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  px: 2.25,
                  py: 0.875,
                  minHeight: 0,
                  "&:hover": { bgcolor: "primary.main", color: "white" },
                  transition: "background 0.2s",
                }}
              >
                Subscribe
              </Button> */}
              <Tooltip
                title={
                  userdetail
                    ? `${userdetail.firstName} ${userdetail.lastName}`
                    : "Profile"
                }
              >
                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{ p: 0 }}
                >
                  <Avatar sx={{ width: 34, height: 34, fontSize: "0.75rem" }}>
                    {userdetail
                      ? getInitials(userdetail.firstName, userdetail.lastName)
                      : "?"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                anchorEl={userMenuAnchor}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
              >
                {["Profile", "Logout"].map((s) => (
                  <MenuItem
                    key={s}
                    onClick={() => {
                      if (s === "Profile") navigate("/profile");
                      else navigate("/");
                      setUserMenuAnchor(null);
                    }}
                  >
                    <Typography sx={{ fontSize: "0.875rem" }}>{s}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            {open && (
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  flexGrow: 1,
                  ml: 1,
                  fontFamily: `'Playfair Display', serif`,
                  color: "text.primary",
                }}
              >
                {navItems.find((n) => n.view === activeView)?.text ??
                  "Dashboard"}
              </Typography>
            )}
            <IconButton onClick={() => setOpen(false)}>
              {muiTheme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>

          <Divider />

          <List sx={{ px: 1, pt: 1 }}>
            {navItems.map(({ text, icon, view }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => setActiveView(view)}
                  selected={activeView === view}
                >
                  <ListItemIcon
                    sx={{
                      color: activeView === view ? "inherit" : "text.secondary",
                      minWidth: 40,
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: activeView === view ? 700 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ mt: "auto" }} />

          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              {mode === "light" ? "Light mode" : "Dark mode"}
            </Typography>
            <MaterialUISwitch
              checked={mode === "dark"}
              onChange={() =>
                setMode((m) => (m === "light" ? "dark" : "light"))
              }
            />
          </Box>
        </Drawer>

        <Main open={open}>
          <DrawerHeader />
          {renderContent()}
        </Main>
      </Box>
    </ThemeProvider>
  );
}
