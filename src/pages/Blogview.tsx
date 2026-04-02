import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Footer from "./components/Footer";
import {
  Box,
  Container,
  Divider,
  Typography,
  Stack,
  Button,
  Chip,
  alpha,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { TOKENS } from "./theme";
import Comments from "../pages/components/comments";

const firebaseConfig = {};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadTime(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  const words = (div.textContent || "").trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 100))} min read`;
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function titleInitials(title: string) {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "blogs", id!));
        if (!snap.exists()) {
          setError("Post not found.");
          return;
        }
        setPost({ id: snap.id, ...snap.data() } as BlogPost);
      } catch {
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const image = post ? extractFirstImage(post.content) : null;
  const readTime = post ? estimateReadTime(post.content) : "";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            py={1.75}
          >
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => navigate(-1)}
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                px: 0,
                "&:hover": {
                  color: TOKENS.copper,
                  bgcolor: "transparent",
                },
              }}
            >
              Back
            </Button>

            <Stack
              onClick={() => navigate(-1)}
              sx={{ cursor: "pointer" }}
              direction="row"
              alignItems="baseline"
              spacing={0.5}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: "text.primary",
                }}
              >
                Build
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: TOKENS.copper,
                }}
              >
                Blogs
              </Typography>
            </Stack>

            <Box sx={{ width: 64 }} />
          </Stack>
        </Container>
      </Box>

      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress
            size={36}
            thickness={3}
            sx={{ color: TOKENS.copper }}
          />
        </Box>
      )}

      {error && (
        <Box textAlign="center" py={12}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              borderColor: TOKENS.copper,
              color: TOKENS.copper,
              "&:hover": {
                borderColor: TOKENS.copperDark,
                color: TOKENS.copperDark,
                bgcolor: "transparent",
              },
            }}
          >
            Go Back
          </Button>
        </Box>
      )}

      {post && (
        <>
          <Box
            sx={{
              width: "100%",
              height: { xs: 220, sm: 340, md: 460 },
              background: image
                ? undefined
                : `linear-gradient(135deg, ${TOKENS.copper} 0%, ${TOKENS.copperLight} 55%, ${TOKENS.copperMid} 100%)`,
              backgroundImage: image ? `url("${image}")` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.32)",
              }}
            />
            {!image && (
              <Typography
                sx={{
                  color: alpha("#fff", 0.12),
                  fontSize: { xs: "5rem", md: "9rem" },
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                  position: "relative",
                  zIndex: 1,
                  userSelect: "none",
                }}
              >
                {titleInitials(post.title)}
              </Typography>
            )}
          </Box>

          <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              mb={3}
              flexWrap="wrap"
            >
              <Chip
                label="Article"
                size="small"
                sx={{
                  bgcolor: TOKENS.copper,
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  height: 22,
                  borderRadius: "4px",
                }}
              />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayOutlinedIcon
                  sx={{ fontSize: 12, color: "text.secondary" }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                  }}
                >
                  {formatDate(post.createdAt)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeOutlinedIcon
                  sx={{ fontSize: 12, color: "text.secondary" }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                  }}
                >
                  {readTime}
                </Typography>
              </Stack>
            </Stack>

            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: "1.85rem", sm: "2.4rem", md: "2.9rem" },
                lineHeight: 1.2,
                mb: 4,
                letterSpacing: "-0.02em",
                color: "text.primary",
              }}
            >
              {post.title}
            </Typography>

            <Divider sx={{ mb: 5 }} />

            <Box
              dangerouslySetInnerHTML={{ __html: post.content }}
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.9,
                color: "text.primary",
                fontFamily: "'DM Sans', sans-serif",
                "& h1, & h2": {
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  mt: 5,
                  mb: 2,
                  lineHeight: 1.3,
                  color: "text.primary",
                },
                "& h3, & h4": {
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                  mt: 4,
                  mb: 1.5,
                  color: "text.primary",
                },
                "& p": { mb: 2.5 },
                "& a": {
                  color: TOKENS.copper,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  "&:hover": { color: TOKENS.copperDark },
                },
                "& blockquote": {
                  borderLeft: `4px solid ${TOKENS.copper}`,
                  ml: 0,
                  pl: 3,
                  py: 0.5,
                  my: 4,
                  bgcolor: isDark
                    ? alpha(TOKENS.copper, 0.07)
                    : TOKENS.copperFaint,
                  borderRadius: "0 8px 8px 0",
                  "& p": { mb: 0, fontStyle: "italic" },
                },
                "& ul, & ol": { pl: 3, mb: 2.5 },
                "& li": { mb: 0.8 },
                "& img": {
                  width: "100%",
                  borderRadius: 2,
                  my: 4,
                  display: "block",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
                "& code": {
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.875em",
                  bgcolor: isDark ? TOKENS.darkDeep : TOKENS.copperFaint,
                  color: isDark ? TOKENS.copperMid : TOKENS.copperDark,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                },
                "& pre": {
                  bgcolor: isDark ? TOKENS.darkDeep : TOKENS.inkDark,
                  color: "#e5e7eb",
                  p: 3,
                  borderRadius: 2,
                  overflowX: "auto",
                  my: 3,
                  "& code": { bgcolor: "transparent", color: "inherit", p: 0 },
                },
                "& strong": { fontWeight: 700 },
                "& figure.image": { margin: "2rem 0", textAlign: "center" },
                "& figure.image img": {
                  width: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
                "& figure.image-style-side": {
                  float: "right",
                  marginLeft: "1.5rem",
                  maxWidth: "50%",
                },
              }}
            />
          </Container>
          <Comments blogId={id!} />
        </>
      )}
      <Footer />
    </Box>
  );
}
