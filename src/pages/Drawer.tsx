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
import Heropage from "./Heropage";
import Pages from "./pages";
import { useState, useEffect } from "react";
import Viewpage from "./Viewpage";
import Bookmark from "./Bookmark";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Tooltip, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";

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
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff",
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...theme.applyStyles("dark", { backgroundColor: "#8796A5" }),
      },
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
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff",
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles("dark", { backgroundColor: "#003892" }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...theme.applyStyles("dark", { backgroundColor: "#8796A5" }),
  },
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
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
  shouldForwardProp: (prop) => prop !== "open",
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

interface ChangeEvent {
  change: any;
  check: boolean;
}

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

export default function DrawerSlider({ change, check }: ChangeEvent) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>("viewpage");
  const [User, setUser] = React.useState<null | HTMLElement>(null);
  const [userdetail, setUserDetail] = useState<UserDetail | null>(null);

  const settings = ["Profile", "Logout"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            setUserDetail(snap.data() as UserDetail);
          }
        } catch (err) {
          console.error("Failed to fetch user details:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUser(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case "heropage":
        return <Heropage />;
      case "pages":
        return <Pages />;
      case "viewpage":
        return <Viewpage />;
      case "Bookmarks":
        return <Bookmark />;
      default:
        return <Viewpage />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[{ mr: 2 }, open && { display: "none" }]}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h5" noWrap>
            Build Blogs
          </Typography>

          <Box sx={{ flexGrow: 4, display: "flex", justifyContent: "end" }} />

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "end" }}>
            <Tooltip
              title={
                userdetail
                  ? `${userdetail.firstName} ${userdetail.lastName}`
                  : "Profile"
              }
            >
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: "primary.dark" }}>
                  {userdetail
                    ? getInitials(userdetail.firstName, userdetail.lastName)
                    : "?"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={User}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(User)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    if (setting === "Profile") navigate("/profile");
                    else if (setting === "Logout") navigate("/");
                    handleCloseUserMenu();
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
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
              sx={{ flexGrow: 1, ml: 1 }}
            >
              {navItems.find((n) => n.view === activeView)?.text ?? "Dashboard"}
            </Typography>
          )}
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List>
          {navItems.map(({ text, icon, view }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                onClick={() => setActiveView(view)}
                selected={activeView === view}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            alignItems: "flex-end",
          }}
        >
          <FormControlLabel
            control={
              <MaterialUISwitch
                sx={{
                  m: 1,
                }}
                defaultChecked
                color="default"
                onChange={change}
                checked={check}
              />
            }
            label="Mode switch"
          />
        </Box>
      </Drawer>

      <Main open={open}>{renderContent()}</Main>
    </Box>
  );
}
