import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
  return `${Math.max(1, Math.round(words / 200))} min read`;
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

  const displayContent = post?.content ?? "";

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "#fff",
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
            py={2}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/drawer")}
              sx={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#6e727a",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                "&:hover": { color: "#1a6fd4", bgcolor: "transparent" },
              }}
            >
              Back
            </Button>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#1a1a2e",
                }}
              >
                The
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#1a6fd4",
                }}
              >
                Blogs
              </Typography>
            </Stack>

            <Box sx={{ width: 80 }} />
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
          <CircularProgress sx={{ color: "#e94560" }} />
        </Box>
      )}

      {error && (
        <Box textAlign="center" py={10}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      )}

      {post && (
        <>
          <Box
            sx={{
              width: "100%",
              height: { xs: 240, sm: 360, md: 480 },
              background: image
                ? undefined
                : "linear-gradient(135deg, #1259e6 0%, #5dd4ff 60%, #257aeaaf 100%)",
              backgroundImage: image ? `url("${image}")` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.38)",
              }}
            />
            {!image && (
              <Typography
                sx={{
                  color: alpha("#fff", 0.1),
                  fontSize: { xs: "6rem", md: "10rem" },
                  fontWeight: 700,
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "'Georgia', serif",
                }}
              >
                {titleInitials(post.title)}
              </Typography>
            )}
          </Box>
          <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              mb={3}
              flexWrap="wrap"
            >
              <Chip
                label="ARTICLE"
                size="small"
                sx={{
                  bgcolor: "#1a6fd4",
                  color: "#fff",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                }}
              />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon
                  sx={{ fontSize: 13, color: "text.secondary" }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  {formatDate(post.createdAt)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon
                  sx={{ fontSize: 13, color: "#text.secondary" }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  {readTime}
                </Typography>
              </Stack>
            </Stack>

            <Typography
              sx={{
                fontFamily: "'Georgia', serif",
                fontWeight: 700,
                fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.25,
                mb: 4,
                letterSpacing: "-0.02em",
              }}
            >
              {post.title}
            </Typography>

            <Divider sx={{ mb: 5 }} />

            <Box
              dangerouslySetInnerHTML={{ __html: displayContent }}
              sx={{
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.9,
                color: "text.primary",
                fontFamily: "'Georgia', serif",
                "& h1, & h2": {
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  mt: 5,
                  mb: 2,
                  lineHeight: 1.3,
                },
                "& h3, & h4": {
                  fontFamily: "'Georgia', serif",
                  fontWeight: 600,
                  mt: 4,
                  mb: 1.5,
                },
                "& p": { mb: 2.5 },
                "& a": {
                  color: "#1a6fd4",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                },
                "& blockquote": {
                  borderLeft: "4px solid #1a6fd4",
                  ml: 0,
                  pl: 3,
                  py: 0.5,
                  my: 4,
                  bgcolor: alpha("#1a6fd4", 0.04),
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
                  bgcolor: isDark ? "#2a2a2a" : "#f3f4f6",
                  color: isDark ? "#90caf9" : "#1a6fd4",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                },
                "& pre": {
                  bgcolor: "#1a1a2e",
                  color: "#e5e7eb",
                  p: 3,
                  borderRadius: 2,
                  overflowX: "auto",
                  my: 3,
                  "& code": { bgcolor: "transparent", color: "inherit", p: 0 },
                },
                "& strong": { fontWeight: 700 },
                "& figure.image": {
                  margin: "2rem 0",
                  textAlign: "center",
                },
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
            <Divider sx={{ mt: 8, mb: 4 }} />
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              variant="outlined"
              sx={{
                borderColor: "text.primary",
                color: "text.primary",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                "&:hover": {
                  borderColor: "#1a6fd4",
                  color: "#1a6fd4",
                  bgcolor: "transparent",
                },
              }}
            >
              Back to Articles
            </Button>
          </Container>
        </>
      )}
    </Box>
  );
}
