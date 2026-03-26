import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Container,
  Paper,
  Stack,
  createTheme,
  ThemeProvider,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  // VerifiedUser as VerifiedUserIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

const theme = createTheme({
  palette: {
    primary: { main: "#1565C0", light: "#1E88E5", dark: "#0D47A1" },
    secondary: { main: "#42A5F5" },
    background: { default: "#F0F6FF", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.5px" },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.95rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(21,101,192,0.12)",
        },
      },
    },
  },
});

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: alpha("#1565C0", 0.05),
        border: "1px solid",
        borderColor: alpha("#1565C0", 0.1),
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha("#1565C0", 0.09),
          borderColor: alpha("#1565C0", 0.25),
          transform: "translateX(4px)",
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
        >
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function Profile() {
  const [userdetail, setUserDetail] = useState<UserDetail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetail(docSnap.data() as UserDetail);
        }
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

  if (!userdetail) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress
            size={48}
            thickness={4}
            sx={{ color: "primary.main" }}
          />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Loading your profile...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, rgba(30,136,229,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(21,101,192,0.08) 0%, transparent 60%)",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              mb: 3,
              background:
                "linear-gradient(135deg, #1565C0 0%, #1E88E5 50%, #42A5F5 100%)",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.08)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)",
              }}
            />

            <Box sx={{ p: { xs: 3, md: 4 }, position: "relative", zIndex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    bgcolor: "rgba(255,255,255,0.2)",
                    border: "3px solid rgba(255,255,255,0.5)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                  }}
                >
                  {getInitials(userdetail.firstName, userdetail.lastName)}
                </Avatar>

                <Box>
                  <Typography
                    variant="h4"
                    color="white"
                    gutterBottom
                    sx={{ mb: 0.5 }}
                  >
                    {userdetail.firstName} {userdetail.lastName}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>

          <Card elevation={0} sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <AccountCircleIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" color="primary.main">
                  Profile Information
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <InfoRow
                  icon={<PersonIcon sx={{ fontSize: 20 }} />}
                  label="First Name"
                  value={userdetail.firstName}
                />
                <InfoRow
                  icon={<PersonIcon sx={{ fontSize: 20 }} />}
                  label="Last Name"
                  value={userdetail.lastName}
                />
                <InfoRow
                  icon={<EmailIcon sx={{ fontSize: 20 }} />}
                  label="Email Address"
                  value={userdetail.email}
                />
              </Stack>

              <Divider sx={{ my: 3, borderColor: alpha("#1565C0", 0.1) }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  background: "linear-gradient(135deg, #1565C0, #1E88E5)",
                  boxShadow: "0 4px 16px rgba(21,101,192,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0D47A1, #1565C0)",
                    boxShadow: "0 6px 20px rgba(21,101,192,0.45)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
          >
            Your data is secure and encrypted
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Profile;
