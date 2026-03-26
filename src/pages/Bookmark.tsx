import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  alpha,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

function getBookmarkKey(): string {
  const user = auth.currentUser;
  return user ? `bookmarks_${user.uid}` : "bookmarks_guest";
}

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
  return `${Math.max(1, Math.round((div.textContent || "").trim().split(/\s+/).length / 200))} min read`;
}
function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
function htmlToExcerpt(html: string, max = 120) {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
function titleInitials(title: string) {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function BookmarkPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const key = `bookmarks_${user.uid}`;
        const saved = localStorage.getItem(key);
        setBookmarkIds(saved ? JSON.parse(saved) : []);
      } else {
        setBookmarkIds([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (bookmarkIds.length === 0) {
        setLoading(false);
        setPosts([]);
        return;
      }
      try {
        setLoading(true);
        const fetched = await Promise.all(
          bookmarkIds.map(async (id) => {
            const snap = await getDoc(doc(db, "blogs", id));
            if (!snap.exists()) return null;
            return { id: snap.id, ...snap.data() } as BlogPost;
          }),
        );
        setPosts(fetched.filter(Boolean) as BlogPost[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [bookmarkIds]);

  // ✅ Remove a single bookmark using user-scoped key
  const removeBookmark = (id: string) => {
    const key = getBookmarkKey();
    const updated = bookmarkIds.filter((b) => b !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setBookmarkIds(updated);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    const key = getBookmarkKey();
    localStorage.setItem(key, JSON.stringify([]));
    setBookmarkIds([]);
    setPosts([]);
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", mt: 5 }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={6}
        >
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BookmarkIcon sx={{ color: "#1a6fd4", fontSize: "1.4rem" }} />
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                Saved Articles
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.8rem",
                color: "text.secondary",
                letterSpacing: "0.05em",
              }}
            >
              {posts.length} article{posts.length !== 1 ? "s" : ""} saved
            </Typography>
          </Stack>

          {posts.length > 0 && (
            <Button
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              onClick={clearAll}
              sx={{
                color: "text.secondary",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "4px",
                px: 2,
                "&:hover": {
                  color: "#e53935",
                  borderColor: "#e53935",
                  bgcolor: "rgba(229,57,53,0.05)",
                },
              }}
            >
              Clear All
            </Button>
          )}
        </Stack>
        <Divider sx={{ borderColor: theme.palette.divider, mb: 5 }} />{" "}
        {loading && (
          <Stack alignItems="center" py={10} spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "3px solid",
                borderColor: theme.palette.divider,
                borderTopColor: "#1a6fd4",
                animation: "spin 0.9s linear infinite",
                "@keyframes spin": { to: { transform: "rotate(360deg)" } },
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Loading saved articles…
            </Typography>
          </Stack>
        )}
        {!loading && posts.length === 0 && (
          <Stack alignItems="center" py={12} spacing={3}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: alpha("#1a6fd4", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookmarkBorderIcon sx={{ fontSize: "2rem", color: "#1a6fd4" }} />
            </Box>
            <Typography
              sx={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.4rem",
                color: "text.secondary",
              }}
            >
              No saved articles yet
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.82rem",
                color: "text.disabled",
                textAlign: "center",
                maxWidth: 320,
              }}
            >
              Bookmark articles while reading and they'll appear here.
            </Typography>
            {/* <Button
              onClick={() => navigate("/drawer")}
              sx={{
                mt: 1,
                color: "#1a6fd4",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "1px solid #b5d4f4",
                borderRadius: "4px",
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#1a6fd4",
                  bgcolor: alpha("#1a6fd4", 0.05),
                },
              }}
            >
              Browse Articles
            </Button> */}
          </Stack>
        )}
        {!loading && posts.length > 0 && (
          <Stack spacing={2}>
            {posts.map((post) => {
              const image = extractFirstImage(post.content);
              const readTime = estimateReadTime(post.content);
              const excerpt = htmlToExcerpt(post.content);
              return (
                <Card
                  key={post.id}
                  sx={{
                    bgcolor: "background.paper",
                    border: `1px solid ${theme.palette.divider}`, // ✅ real theme value
                    borderRadius: "10px",
                    boxShadow: "none",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    overflow: "hidden",
                    transition:
                      "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      borderColor: "#1a6fd4",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 24px rgba(26,111,212,0.10)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 160 },
                      minHeight: { xs: 140, sm: "auto" },
                      flexShrink: 0,
                      background: image
                        ? `url(${image}) center/cover no-repeat`
                        : "linear-gradient(135deg, #1f4095 0%, #1a6fd4 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!image && (
                      <Typography
                        sx={{
                          fontFamily: "'Georgia', serif",
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          color: alpha("#fff", 0.15),
                        }}
                      >
                        {titleInitials(post.title)}
                      </Typography>
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      flex: 1,
                      p: { xs: 2.5, md: 3 },
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'Georgia', serif",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          color: "text.primary",
                          mb: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Helvetica Neue', sans-serif",
                          fontSize: "0.82rem",
                          color: "text.secondary",
                          lineHeight: 1.6,
                          mb: 2,
                        }}
                      >
                        {excerpt}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={2}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <CalendarTodayIcon
                            sx={{ fontSize: 12, color: "#1a6fd4" }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "'Helvetica Neue', sans-serif",
                              fontSize: "0.72rem",
                              color: "text.secondary",
                            }}
                          >
                            {formatDate(post.createdAt)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 12, color: "#1a6fd4" }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "'Helvetica Neue', sans-serif",
                              fontSize: "0.72rem",
                              color: "text.secondary",
                            }}
                          >
                            {readTime}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Remove bookmark">
                          <IconButton
                            size="small"
                            onClick={() => removeBookmark(post.id)}
                            sx={{
                              color: "text.disabled",
                              "&:hover": {
                                color: "#e53935",
                                bgcolor: "rgba(229,57,53,0.06)",
                              },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/blogview/${post.id}`)}
                          sx={{
                            color: "text.disabled",
                            "&:hover": {
                              color: "#1a6fd4",
                              bgcolor: "rgba(26,111,212,0.08)",
                            },
                          }}
                        >
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
