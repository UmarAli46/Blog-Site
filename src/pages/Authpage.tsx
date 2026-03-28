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
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  Alert,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  FiberManualRecord,
  Create as PenIcon,
  CheckCircleOutline,
} from "@mui/icons-material";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C18.622 14.233 17.64 11.925 17.64 9.2z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const BrandPanel: React.FC = () => (
  <Box
    sx={{
      flex: 1,
      maxWidth: 380,
      display: { xs: "none", md: "flex" },
      flexDirection: "column",
      gap: 3.5,
      animation: "fadeSlideUp 0.7s ease both",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          bgcolor: "text.primary",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PenIcon sx={{ color: "#f9f5f0", fontSize: 18 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          color: "text.primary",
          letterSpacing: "0.02em",
        }}
      >
        Inkwell
      </Typography>
    </Box>

    <Typography
      component="h1"
      sx={{
        fontFamily: "'Playfair Display', serif",
        fontSize: { md: 34, lg: 38 },
        lineHeight: 1.2,
        color: "text.primary",
      }}
    >
      Where{" "}
      <Box component="em" sx={{ fontStyle: "italic", color: "primary.main" }}>
        ideas
      </Box>
      <br />
      find their voice.
    </Typography>

    <Typography
      sx={{
        fontSize: 15,
        lineHeight: 1.7,
        color: "text.secondary",
        fontWeight: 300,
      }}
    >
      A space for thoughtful writing, curious readers, and the stories worth
      telling. Join thousands of writers already publishing on Inkwell.
    </Typography>

    <Stack spacing={1.5}>
      {[
        "Publish to a global audience instantly",
        "Clean, distraction-free writing editor",
        "Build your readership with every post",
        "Analytics to understand your impact",
      ].map((f) => (
        <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <FiberManualRecord
            sx={{ fontSize: 8, color: "primary.main", flexShrink: 0 }}
          />
          <Typography sx={{ fontSize: 14, color: "text.primary" }}>
            {f}
          </Typography>
        </Box>
      ))}
    </Stack>
  </Box>
);

const SignInPanel: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/drawer"))
      .catch(() => {
        setSnackbarMessage("Invalid credentials. Please try again.");
        setOpenSnackbar(true);
      });
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then(() => navigate("/drawer"))
      .catch(() => {
        setSnackbarMessage("Google sign-in failed. Please try again.");
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = (
    _event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 24,
          color: "text.primary",
          mb: 0.75,
        }}
      >
        Welcome back
      </Typography>
      <Typography
        sx={{
          fontSize: 13.5,
          color: "text.secondary",
          mb: 3.5,
          fontWeight: 300,
        }}
      >
        Sign in to continue writing and reading.
      </Typography>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.25,
          borderColor: "divider",
          color: "text.primary",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          borderRadius: "10px",
          textTransform: "none",
          "&:hover": { borderColor: "#aaa", bgcolor: "background.default" },
        }}
      >
        Continue with Google
      </Button>

      <Divider sx={{ my: 2.75, fontSize: 12, color: "text.secondary" }}>
        or sign in with email
      </Divider>

      <Stack spacing={2}>
        <TextField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          size="small"
          InputProps={{ sx: { borderRadius: "9px", fontSize: 14 } }}
        />
        <TextField
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            sx: { borderRadius: "9px", fontSize: 14 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1.5,
          mb: 2.75,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              sx={{
                color: "text.secondary",
                "&.Mui-checked": { color: "primary.main" },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Remember me
            </Typography>
          }
          sx={{ mr: 0 }}
        />
        <Link
          href="#"
          underline="hover"
          sx={{ fontSize: 13, color: "primary.main", fontWeight: 500 }}
        >
          Forgot password?
        </Link>
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={handleSignIn}
        sx={{
          py: 1.4,
          bgcolor: "text.primary",
          color: "#fff",
          borderRadius: "10px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 500,
          textTransform: "none",
          "&:hover": { bgcolor: "#2e2e2e" },
          "&:active": { transform: "scale(0.98)" },
        }}
      >
        Sign In
      </Button>

      <Typography
        sx={{
          mt: 2,
          fontSize: 12,
          color: "text.secondary",
          textAlign: "center",
        }}
      >
        Don't have an account?{" "}
        <Link
          component="button"
          onClick={onSwitch}
          underline="hover"
          sx={{
            color: "primary.main",
            fontWeight: 500,
            fontSize: 12,
            verticalAlign: "baseline",
          }}
        >
          Create one free →
        </Link>
      </Typography>

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
    </Box>
  );
};

const SignUpPanel: React.FC = () => {
  const [showPass, setShowPass] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
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

  const handleGoogleSignUp = () => {
    signInWithPopup(auth, googleProvider)
      .then(() => navigate("/drawer"))
      .catch((err) => setError(err.message || "Google sign-up failed."));
  };

  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 340,
          gap: 2,
          animation: "fadeSlideUp 0.4s ease both",
        }}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            bgcolor: "text.primary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 28px rgba(26,26,26,0.25)",
            animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
            "@keyframes popIn": {
              from: { transform: "scale(0)" },
              to: { transform: "scale(1)" },
            },
          }}
        >
          <CheckCircleOutline sx={{ fontSize: 36, color: "#fff" }} />
        </Box>
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            color: "text.primary",
          }}
        >
          Account created!
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          Your Inkwell account is ready. Redirecting…
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 24,
          color: "text.primary",
          mb: 0.75,
        }}
      >
        Start writing today
      </Typography>
      <Typography
        sx={{
          fontSize: 13.5,
          color: "text.secondary",
          mb: 3.5,
          fontWeight: 300,
        }}
      >
        Create your free Inkwell account in seconds.
      </Typography>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignUp}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.25,
          borderColor: "divider",
          color: "text.primary",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          borderRadius: "10px",
          textTransform: "none",
          "&:hover": { borderColor: "#aaa", bgcolor: "background.default" },
        }}
      >
        Sign up with Google
      </Button>

      <Divider sx={{ my: 2.75, fontSize: 12, color: "text.secondary" }}>
        or sign up with email
      </Divider>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: "8px", fontSize: 13 }}
        >
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <TextField
            label="First name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError("");
            }}
            size="small"
            InputProps={{ sx: { borderRadius: "9px", fontSize: 14 } }}
          />
          <TextField
            label="Last name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
            size="small"
            InputProps={{ sx: { borderRadius: "9px", fontSize: 14 } }}
          />
        </Box>
        <TextField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          fullWidth
          size="small"
          InputProps={{ sx: { borderRadius: "9px", fontSize: 14 } }}
        />
        <TextField
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          fullWidth
          size="small"
          InputProps={{
            sx: { borderRadius: "9px", fontSize: 14 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirmPass}
          onChange={(e) => {
            setConfirmPass(e.target.value);
            setError("");
          }}
          fullWidth
          size="small"
          InputProps={{ sx: { borderRadius: "9px", fontSize: 14 } }}
        />
      </Stack>

      <Button
        fullWidth
        variant="contained"
        onClick={handleSignUp}
        disabled={loading}
        sx={{
          mt: 2.5,
          py: 1.4,
          bgcolor: "text.primary",
          color: "#fff",
          borderRadius: "10px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 500,
          textTransform: "none",
          "&:hover": { bgcolor: "#2e2e2e" },
          "&:active": { transform: "scale(0.98)" },
          "&.Mui-disabled": { bgcolor: "#aaa", color: "#fff" },
        }}
      >
        {loading ? (
          <CircularProgress size={22} sx={{ color: "#fff" }} />
        ) : (
          "Create Account"
        )}
      </Button>

      <Typography
        sx={{
          mt: 2,
          fontSize: 12,
          color: "text.secondary",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        By creating an account you agree to our{" "}
        <Link
          href="#"
          underline="hover"
          sx={{ color: "primary.main", fontSize: 12 }}
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          underline="hover"
          sx={{ color: "primary.main", fontSize: 12 }}
        >
          Privacy Policy
        </Link>
        .
      </Typography>
    </Box>
  );
};

const Authpage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2.5,
        py: 5,
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 10% 20%, rgba(200,98,42,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgba(200,98,42,0.05) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { md: 7.5 },
          width: "100%",
          maxWidth: 1100,
        }}
      >
        <BrandPanel />

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: "28px 20px", sm: "44px 40px" },
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 32px rgba(26,26,26,0.08)",
            animation: "fadeSlideUp 0.7s 0.15s ease both",
          }}
        >
          <Box
            sx={{ bgcolor: "#ede8e1", borderRadius: "10px", p: "4px", mb: 4 }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                minHeight: "unset",
                "& .MuiTab-root": {
                  minHeight: 36,
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "text.secondary",
                  borderRadius: "7px",
                  transition: "all 0.22s ease",
                  p: "6px 12px",
                },
                "& .Mui-selected": {
                  color: "text.primary !important",
                  bgcolor: "#fff",
                  boxShadow: "0 1px 6px rgba(26,26,26,0.1)",
                },
              }}
            >
              <Tab label="Sign In" />
              <Tab label="Create Account" />
            </Tabs>
          </Box>

          {tab === 0 ? (
            <SignInPanel onSwitch={() => setTab(1)} />
          ) : (
            <SignUpPanel />
          )}
        </Paper>
      </Box>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default Authpage;
