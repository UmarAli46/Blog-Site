import { useState } from "react";
import { auth, googleProvider, db } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  Box,
  Button,
  // Checkbox,
  CircularProgress,
  Divider,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  ShoppingBag,
  Google,
  CheckCircleOutline,
} from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      dark: "#1d4ed8",
      light: "#60a5fa",
    },
    background: {
      default: "#dbeeff",
    },
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      color: "#1e3a5f",
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      color: "#1e3a5f",
    },
    h6: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      color: "#fff",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f0f7ff",
            borderRadius: "10px",
            "& fieldset": { borderColor: "#bfdbfe", borderWidth: "1.5px" },
            "&:hover fieldset": { borderColor: "#2563eb" },
            "&.Mui-focused fieldset": { borderColor: "#2563eb" },
            "&.Mui-focused": { backgroundColor: "#fff" },
          },
          "& .MuiInputLabel-root": { color: "#4a7aaa", fontSize: "13px" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
          "& input": { color: "#1e3a5f" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: "10px", textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

type TabType = "signin" | "signup";

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick }) => (
  <Button
    fullWidth
    onClick={onClick}
    sx={{
      py: 1.5,
      borderRadius: "50px",
      border: "2px solid",
      borderColor: active ? "#fff" : "rgba(255,255,255,0.35)",
      background: active ? "#fff" : "transparent",
      color: active ? "#1d4ed8" : "rgba(255,255,255,0.75)",
      fontWeight: 600,
      letterSpacing: "0.06em",
      fontSize: "14px",
      boxShadow: active ? "0 8px 24px rgba(0,0,0,0.18)" : "none",
      transform: active ? "translateX(8px)" : "none",
      transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
      "&:hover": {
        background: active ? "#fff" : "rgba(255,255,255,0.12)",
        borderColor: active ? "#fff" : "rgba(255,255,255,0.6)",
        color: active ? "#1d4ed8" : "#fff",
        transform: active ? "translateX(8px)" : "translateX(4px)",
      },
    }}
  >
    {label}
  </Button>
);

const Authentication: React.FC = () => {
  const [tab, setTab] = useState<TabType>("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState<boolean>(false);
  // const [remember, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const switchTab = (t: TabType): void => {
    setTab(t);
    setError("");
    setSuccess(false);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setConfirmPass("");
  };

  const createUser = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
      });

      setLoading(false);
      setSuccess(true);

      setTimeout(() => navigate("/drawer"), 1800);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Signup failed.");
    }
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/drawer");
      })
      .catch(() => {
        setSnackbarMessage("Invalid User");
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleSubmit = (): void => {
    if (tab === "signin") {
      handleSignIn();
    } else {
      createUser();
    }
  };

  const signupwithgoogle = () => {
    signInWithPopup(auth, googleProvider).then(() => {
      navigate("/drawer");
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #c7dff7 0%, #dbeeff 50%, #b8d4f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)",
            top: -200,
            left: -200,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(96,165,250,0.15), transparent 70%)",
            bottom: -150,
            right: -100,
            pointerEvents: "none",
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            width: { xs: "100%", md: 860 },
            minHeight: 520,
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow:
              "0 4px 6px rgba(37,99,235,0.07), 0 24px 60px rgba(37,99,235,0.18), 0 0 0 1px rgba(255,255,255,0.9)",
            animation: "cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both",
            "@keyframes cardIn": {
              from: { opacity: 0, transform: "translateY(36px) scale(0.97)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: "48px 32px",
              background:
                "linear-gradient(160deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%)",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                top: -80,
                left: -80,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                bottom: -60,
                right: -60,
              },
            }}
          >
            {[
              { top: 30, left: -90, opacity: 0.08 },
              { top: 100, left: -50, opacity: 0.05 },
              { bottom: 30, right: -90, opacity: 0.08 },
            ].map((pos, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  border: "36px solid",
                  borderColor: `rgba(255,255,255,${pos.opacity})`,
                  transform: "rotate(45deg)",
                  ...pos,
                }}
              />
            ))}

            <Box
              sx={{
                width: 70,
                height: 70,
                background: "rgba(255,255,255,0.18)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
                position: "relative",
                zIndex: 1,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              <ShoppingBag sx={{ fontSize: 34, color: "#fff" }} />
            </Box>

            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                lineHeight: 1.3,
                mb: 1,
                position: "relative",
                zIndex: 1,
              }}
            >
              Welcome to
              <br />
              Blogs
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                textAlign: "center",
                mb: 5,
                position: "relative",
                zIndex: 1,
                fontWeight: 300,
              }}
            >
              Your favourite shopping destination
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                width: "100%",
                position: "relative",
                zIndex: 1,
              }}
            >
              <TabButton
                label="SIGN IN"
                active={tab === "signin"}
                onClick={() => switchTab("signin")}
              />
              <TabButton
                label="SIGN UP"
                active={tab === "signup"}
                onClick={() => switchTab("signup")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              background: "#fff",
              p: { xs: "36px 28px", md: "48px 44px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: "linear-gradient(90deg, #1d4ed8, #60a5fa, #1d4ed8)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              },
              "@keyframes shimmer": {
                from: { backgroundPosition: "0% 0%" },
                to: { backgroundPosition: "200% 0%" },
              },
            }}
          >
            {success && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(240,247,255,0.97)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  animation: "fadeIn 0.4s ease",
                  "@keyframes fadeIn": {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 28px rgba(37,99,235,0.35)",
                    mb: 2,
                    animation:
                      "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
                    "@keyframes popIn": {
                      from: { transform: "scale(0)" },
                      to: { transform: "scale(1)" },
                    },
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 36, color: "#fff" }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  {tab === "signin" ? "Welcome back!" : "Account created!"}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#7aaacb" }}>
                  {tab === "signin"
                    ? "You're successfully signed in."
                    : "Your account is ready to use."}
                </Typography>
              </Box>
            )}

            <Box
              key={tab}
              sx={{
                animation: "slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
                "@keyframes slideIn": {
                  from: { opacity: 0, transform: "translateX(16px)" },
                  to: { opacity: 1, transform: "translateX(0)" },
                },
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #dbeeff, #bfdbfe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    border: "2px solid rgba(37,99,235,0.12)",
                  }}
                >
                  {tab === "signin" ? (
                    <Person sx={{ fontSize: 28, color: "#2563eb" }} />
                  ) : (
                    <ShoppingBag sx={{ fontSize: 26, color: "#2563eb" }} />
                  )}
                </Box>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  {tab === "signin" ? "Sign In" : "Create Account"}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: "#7aaacb", fontWeight: 300 }}
                >
                  {tab === "signin"
                    ? "Enter your credentials to access your account"
                    : "Fill in your details to get started"}
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: "8px", fontSize: 13 }}
                >
                  {error}
                </Alert>
              )}

              {tab === "signup" && (
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="First Name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ fontSize: 18, color: "#94b8d4" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Last Name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ fontSize: 18, color: "#94b8d4" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 18, color: "#94b8d4" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Password"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                sx={{ mb: tab === "signup" ? 1.5 : 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ fontSize: 18, color: "#94b8d4" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass(!showPass)}
                        edge="end"
                        size="small"
                      >
                        {showPass ? (
                          <VisibilityOff
                            sx={{ fontSize: 18, color: "#94b8d4" }}
                          />
                        ) : (
                          <Visibility sx={{ fontSize: 18, color: "#94b8d4" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {tab === "signup" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                    setError("");
                  }}
                  sx={{ mb: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 18, color: "#94b8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <Divider sx={{ mt: 1 }} />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  py: 1.4,
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  fontSize: "15px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  boxShadow: "0 6px 20px rgba(37,99,235,0.38)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1e40af, #2563eb)",
                    boxShadow: "0 10px 28px rgba(37,99,235,0.48)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : tab === "signin" ? (
                  "LOGIN →"
                ) : (
                  "CREATE ACCOUNT →"
                )}
              </Button>

              <Divider
                sx={{
                  my: 2,
                  "&::before, &::after": { borderColor: "#e0eeff" },
                }}
              >
                <Typography sx={{ fontSize: 11, color: "#a0c0d8", px: 1 }}>
                  Or Login With
                </Typography>
              </Divider>

              <Grid container spacing={1} sx={{ width: 1430 }}>
                {[
                  { icon: <Google sx={{ fontSize: 18 }} />, label: "Google" },
                ].map(({ icon, label }) => (
                  <Grid size={4} key={label}>
                    <Button
                      onClick={signupwithgoogle}
                      fullWidth
                      variant="outlined"
                      startIcon={icon}
                      sx={{
                        borderColor: "#bfdbfe",
                        color: "#3b6fa0",
                        fontSize: "12px",
                        py: 1,
                        "&:hover": {
                          borderColor: "#2563eb",
                          color: "#1d4ed8",
                          background: "#f0f7ff",
                          boxShadow: "0 3px 10px rgba(37,99,235,0.1)",
                        },
                      }}
                    >
                      {label}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  justifyContent: "center",
                  mt: 2,
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: 13, color: "#7aaacb" }}>
                  {tab === "signin"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </Typography>
                <Link
                  href="#"
                  underline="hover"
                  onClick={(e) => {
                    e.preventDefault();
                    switchTab(tab === "signin" ? "signup" : "signin");
                  }}
                  sx={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}
                >
                  {tab === "signin" ? "Sign Up" : "Sign In"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Authentication;
