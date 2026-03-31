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
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
// import { useTheme } from "@mui/material/styles";
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

function getBookmarkKey() {
  return auth.currentUser
    ? `bookmarks_${auth.currentUser.uid}`
    : "bookmarks_guest";
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
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
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
  // const theme = useTheme();
  // const isDark = theme.palette.mode === "dark";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        const saved = localStorage.getItem(`bookmarks_${user.uid}`);
        setBookmarkIds(saved ? JSON.parse(saved) : []);
      } else {
        setBookmarkIds([]);
        setLoading(false);
      }
    });
    return () => unsub();
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
            return snap.exists()
              ? ({ id: snap.id, ...snap.data() } as BlogPost)
              : null;
          }),
        );
        setPosts(fetched.filter(Boolean) as BlogPost[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [bookmarkIds]);

  const removeBookmark = (id: string) => {
    const updated = bookmarkIds.filter((b) => b !== id);
    localStorage.setItem(getBookmarkKey(), JSON.stringify(updated));
    setBookmarkIds(updated);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    localStorage.setItem(getBookmarkKey(), JSON.stringify([]));
    setBookmarkIds([]);
    setPosts([]);
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", mt: 5 }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={6}
        >
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BookmarkIcon
                sx={{ color: "primary.main", fontSize: "1.4rem" }}
              />
              <Typography
                sx={{
                  fontFamily: `'Playfair Display', serif`,
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
              variant="caption"
              sx={{ color: "text.secondary", letterSpacing: "0.05em" }}
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
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "4px",
                px: 2,
                "&:hover": {
                  color: "error.main",
                  borderColor: "error.main",
                  bgcolor: "transparent",
                },
              }}
            >
              Clear All
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 5 }} />

        {loading && (
          <Stack alignItems="center" py={10} spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "3px solid",
                borderColor: "divider",
                borderTopColor: "primary.main",
                animation: "spin 0.9s linear infinite",
                "@keyframes spin": { to: { transform: "rotate(360deg)" } },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "text.disabled",
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
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "primary.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookmarkBorderIcon
                sx={{ fontSize: "2rem", color: "primary.main" }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: `'Playfair Display', serif`,
                fontSize: "1.4rem",
                color: "text.secondary",
              }}
            >
              No saved articles yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                textAlign: "center",
                maxWidth: 320,
              }}
            >
              Bookmark articles while reading and they'll appear here.
            </Typography>
          </Stack>
        )}

        {/* Cards */}
        {!loading && posts.length > 0 && (
          <Stack spacing={2}>
            {posts.map((post) => {
              const image = extractFirstImage(post.content);
              const readTime = estimateReadTime(post.content);
              const excerpt = htmlToExcerpt(post.content);
              return (
                <Card
                  key={post.id}
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    overflow: "hidden",
                    borderRadius: "10px",
                    transition:
                      "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 24px rgba(194,110,62,0.12)",
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
                        : "linear-gradient(140deg,#1e1008 0%,#7A3E1E 55%,#C26E3E 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!image && (
                      <Typography
                        sx={{
                          fontFamily: `'Playfair Display', serif`,
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.1)",
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
                          fontFamily: `'Playfair Display', serif`,
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
                        variant="body2"
                        sx={{ color: "text.secondary", lineHeight: 1.6, mb: 2 }}
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
                        {[
                          {
                            icon: (
                              <CalendarTodayIcon
                                sx={{ fontSize: 12, color: "primary.main" }}
                              />
                            ),
                            text: formatDate(post.createdAt),
                          },
                          {
                            icon: (
                              <AccessTimeIcon
                                sx={{ fontSize: 12, color: "primary.main" }}
                              />
                            ),
                            text: readTime,
                          },
                        ].map((m, i) => (
                          <Stack
                            key={i}
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            {m.icon}
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {m.text}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Remove bookmark">
                          <IconButton
                            size="small"
                            onClick={() => removeBookmark(post.id)}
                            sx={{
                              color: "text.disabled",
                              "&:hover": {
                                color: "error.main",
                                bgcolor: "action.hover",
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
                              color: "primary.main",
                              bgcolor: "action.hover",
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
