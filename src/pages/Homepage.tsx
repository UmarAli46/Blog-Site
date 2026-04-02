import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { Tooltip, Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";

import Heropage from "./Heropage";
import Pages from "./pages";
import BuildBlogs from "./BuildBlogs";
import Bookmark from "./Bookmark";
import Footer from "../pages/components/Footer";

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

interface Props {
  toggleMode: () => void;
  mode: "light" | "dark";
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

const navItems: { text: string; icon: React.ReactNode; path: string }[] = [
  { text: "View Blogs", icon: <FormatBoldIcon />, path: "" },
  { text: "Create Blogs", icon: <NoteAddRoundedIcon />, path: "create" },
  { text: "Published Blogs", icon: <DescriptionIcon />, path: "published" },
  { text: "Saved Blogs", icon: <BookmarkBorderIcon />, path: "saved" },
];

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

const getInitials = (f: string, l: string) =>
  `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase();

export default function DrawerSlider({ mode, toggleMode }: Props) {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [userdetail, setUserDetail] = useState<UserDetail | null>(null);
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

  return (
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
            <Box
              onClick={() => navigate("/Homepage")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                cursor: "pointer",
              }}
            >
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
                  cursor: "pointer",
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
              MENU
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
          {navItems.map(({ text, icon, path }) => {
            const fullPath = `/Homepage${path ? `/${path}` : ""}`;
            const isActive = location.pathname === fullPath;

            return (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(fullPath)}
                  selected={isActive}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "inherit" : "text.secondary",
                      minWidth: 40,
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
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
          <MaterialUISwitch checked={mode === "dark"} onChange={toggleMode} />
        </Box>
      </Drawer>

      <Main open={open}>
        <Routes>
          <Route index element={<BuildBlogs />} />
          <Route path="create" element={<Heropage />} />
          <Route path="published" element={<Pages />} />
          <Route path="saved" element={<Bookmark />} />

          <Route path="*" element={<Navigate to="/Homepage" replace />} />
        </Routes>
        <Footer />
      </Main>
    </Box>
  );
}
