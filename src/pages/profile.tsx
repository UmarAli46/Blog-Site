import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Container,
  Stack,
  alpha,
} from "@mui/material";
import {
  EmailOutlined as EmailIcon,
  PersonOutlined as PersonIcon,
  LogoutOutlined as LogoutIcon,
  BadgeOutlined as BadgeIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { TOKENS } from "./theme";

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        py: 2,
        px: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box
        sx={{
          color: TOKENS.copper,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          opacity: 0.85,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
            fontSize: "0.68rem",
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 500,
            fontSize: "0.95rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function Profile() {
  const [userdetail, setUserDetail] = useState<UserDetail | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserDetail(snap.data() as UserDetail);
      } else navigate("/");
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getInitials = (f: string, l: string) =>
    `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase();

  if (!userdetail) {
    return (
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
          size={36}
          thickness={3}
          sx={{ color: TOKENS.copper }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, letterSpacing: "0.01em" }}
        >
          Loading profile…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 5, md: 10 },
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Avatar
            sx={{
              width: 76,
              height: 76,
              fontSize: "1.6rem",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              bgcolor: TOKENS.copper,
              color: "#fff",
              mx: "auto",
              mb: 2.5,
              boxShadow: `0 0 0 4px ${
                isDark ? alpha(TOKENS.copper, 0.18) : alpha(TOKENS.copper, 0.12)
              }`,
            }}
          >
            {getInitials(userdetail.firstName, userdetail.lastName)}
          </Avatar>

          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "text.primary",
              mb: 0.5,
              letterSpacing: "-0.01em",
            }}
          >
            {userdetail.firstName} {userdetail.lastName}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.85rem" }}
          >
            {userdetail.email}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            px: 3,
            py: 1,
            mb: 3,
          }}
        >
          <InfoRow
            icon={<PersonIcon fontSize="small" />}
            label="First Name"
            value={userdetail.firstName}
          />
          <InfoRow
            icon={<BadgeIcon fontSize="small" />}
            label="Last Name"
            value={userdetail.lastName}
          />
          <InfoRow
            icon={<EmailIcon fontSize="small" />}
            label="Email"
            value={userdetail.email}
          />
        </Box>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            py: 1.4,
            borderColor: isDark ? TOKENS.darkBorder : TOKENS.creamBorder,
            color: "text.primary",
            fontWeight: 600,
            fontSize: "0.9rem",
            borderRadius: 2,
            textTransform: "none",
            letterSpacing: "0.01em",
            "&:hover": {
              borderColor: TOKENS.copper,
              color: TOKENS.copper,
              bgcolor: alpha(TOKENS.copper, 0.05),
            },
            transition: "all 0.2s ease",
          }}
        >
          Sign Out
        </Button>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 3,
            fontSize: "0.7rem",
          }}
        >
          Your data is secure and encrypted
        </Typography>
      </Container>
    </Box>
  );
}

export default Profile;
