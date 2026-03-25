import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Stack,
  Button,
  alpha,
  Alert,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase-config";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  authorName?: string | null;
}

function htmlToExcerpt(html: string, maxLength = 160): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  return text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + "…"
    : text;
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadTime(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  const wordCount = (div.textContent || "").trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(wordCount / 200))} min read`;
}

function titleInitials(title: string): string {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getBookmarkKey(): string {
  const user = auth.currentUser;
  return user ? `bookmarks_${user.uid}` : "bookmarks_guest";
}

function FeaturedCard({
  post,
  bookmarked,
  onBookmark,
}: {
  post: BlogPost;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  const image = extractFirstImage(post.content);
  const excerpt = htmlToExcerpt(post.content, 220);
  const readTime = estimateReadTime(post.content);
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        borderRadius: 3,
        minHeight: { md: 400 },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          minHeight: { xs: 220, md: "auto" },
          background: image
            ? `url(${image}) center/cover no-repeat`
            : "linear-gradient(135deg, #384e83 0%, #3e83d8 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!image && (
          <Typography
            sx={{
              color: alpha("#fff", 0.15),
              fontSize: "5rem",
              fontWeight: 700,
            }}
          >
            {titleInitials(post.title)}
          </Typography>
        )}
      </Box>

      <CardContent
        sx={{
          flex: 1,
          p: { xs: 3, md: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Chip
              label="LATEST"
              size="small"
              sx={{
                bgcolor: "#e94560",
                color: "#fff",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 700,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
              }}
            />
            <IconButton
              size="small"
              onClick={onBookmark}
              sx={{ color: bookmarked ? "#e94560" : "text.secondary" }}
            >
              {bookmarked ? (
                <BookmarkIcon fontSize="small" />
              ) : (
                <BookmarkBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
          <Typography
            variant="h3"
            sx={{
              mb: 1,
              lineHeight: 1.3,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            {post.title}
          </Typography>

          {post.authorName && (
            <Stack direction="row" spacing={0.8} alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "#1a6fd4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}
                >
                  {post.authorName
                    .split(" ")
                    .map((w) => w[0]?.toUpperCase() ?? "")
                    .join("")
                    .slice(0, 2)}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.8rem",
                }}
              >
                {post.authorName}
              </Typography>
            </Stack>
          )}

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, fontSize: "0.95rem" }}
          >
            {excerpt}
          </Typography>
        </Box>

        <Box>
          <Divider sx={{ mb: 2 }} />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon
                  sx={{ fontSize: 13, color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.createdAt)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon
                  sx={{ fontSize: 13, color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {readTime}
                </Typography>
              </Stack>
            </Stack>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/blogview/${post.id}`)}
              sx={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "text.primary",
                p: 0,
                "&:hover": { bgcolor: "transparent", opacity: 0.8 },
              }}
            >
              Read
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function PostCard({
  post,
  bookmarked,
  onBookmark,
}: {
  post: BlogPost;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  const image = extractFirstImage(post.content);
  const excerpt = htmlToExcerpt(post.content, 120);
  const readTime = estimateReadTime(post.content);
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        cursor: "pointer",
      }}
      onClick={() => navigate(`/blogview/${post.id}`)}
    >
      <Box
        sx={{
          height: 180,
          background: image
            ? `url(${image}) center/cover no-repeat`
            : "linear-gradient(135deg, #384e83 0%, #3e83d8 70%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {!image && (
          <Typography
            sx={{
              color: alpha("#fff", 0.15),
              fontSize: "3.5rem",
              fontWeight: 700,
            }}
          >
            {titleInitials(post.title)}
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark();
          }}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            color: bookmarked ? "#e94560" : "text.secondary",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          {bookmarked ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <CardContent
        sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 1, lineHeight: 1.4, fontSize: "1rem" }}
        >
          {post.title}
        </Typography>

        {/* ✅ Author name */}
        {post.authorName && (
          <Stack direction="row" spacing={0.6} alignItems="center" mb={1.5}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: "#1a6fd4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ fontSize: "0.5rem", fontWeight: 700, color: "#fff" }}
              >
                {post.authorName
                  .split(" ")
                  .map((w) => w[0]?.toUpperCase() ?? "")
                  .join("")
                  .slice(0, 2)}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 600,
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              {post.authorName}
            </Typography>
          </Stack>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            fontSize: "0.85rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {excerpt}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {readTime}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarTodayIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Viewpage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const key = `bookmarks_${user.uid}`;
        const saved = localStorage.getItem(key);
        setBookmarks(saved ? JSON.parse(saved) : []);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data: BlogPost[] = await Promise.all(
          snapshot.docs.map(async (blogDoc) => {
            const d = blogDoc.data();
            let authorName: string | null = d.authorName ?? null;

            if (!authorName && d.userEmail) {
              try {
                const userSnap = await getDoc(doc(db, "users", d.userEmail));
                if (userSnap.exists()) {
                  const { firstName, lastName } = userSnap.data();
                  if (firstName || lastName) {
                    authorName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
                  }
                }
                if (!authorName) authorName = d.userEmail;
              } catch {
                authorName = d.userEmail ?? null;
              }
            }

            return {
              id: blogDoc.id,
              title: d.title ?? "Untitled",
              content: d.content ?? "",
              createdAt: d.createdAt ?? Date.now(),
              updatedAt: d.updatedAt ?? Date.now(),
              authorName,
            };
          }),
        );

        setPosts(data);
      } catch (err) {
        console.error("Firebase fetch error:", err);
        setError(
          "Failed to load articles. Check your Firebase config and Firestore rules.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ✅ Toggle bookmark using user-specific key
  const toggleBookmark = (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const key = `bookmarks_${user.uid}`;
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    localStorage.setItem(key, JSON.stringify(updated));
    setBookmarks(updated);
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      htmlToExcerpt(p.content).toLowerCase().includes(search.toLowerCase()),
  );

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          borderBottom: "1px solid #dde3ee",
          bgcolor: "background.default",
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
            mt={4}
          >
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: "text.primary",
                }}
              >
                The
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: "#1a6fd4",
                }}
              >
                Blogs
              </Typography>
            </Stack>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: "text.primary",
                borderRadius: 1,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                px: 2,
                "&:hover": { bgcolor: "#1a6fd4" },
              }}
            >
              Subscribe
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          background:
            "linear-gradient(135deg, #2294cdeb 0%, #4176df 60%, #1a6fd4 100%)",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: alpha("#fff", 0.06),
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            spacing={2}
            alignItems={{ xs: "center", md: "flex-start" }}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUpIcon sx={{ color: "#60a5fa", fontSize: 18 }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#93c5fd",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Engineering · Design · Product
              </Typography>
            </Stack>
            <Typography
              variant="h1"
              sx={{
                color: "#fff",
                fontSize: { xs: "2.2rem", md: "3.8rem" },
                maxWidth: 640,
              }}
            >
              Ideas worth building.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha("#fff", 0.65),
                maxWidth: 480,
                fontSize: "1rem",
              }}
            >
              Thoughtful writing on software, design, and the craft of creating
              products people love.
            </Typography>
            <TextField
              placeholder="Search articles…"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                mt: 2,
                width: { xs: "100%", md: 380 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: alpha("#fff", 0.08),
                  borderRadius: 1,
                  color: "#fff",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "0.875rem",
                  "& fieldset": { borderColor: alpha("#fff", 0.2) },
                  "&:hover fieldset": { borderColor: alpha("#fff", 0.4) },
                  "&.Mui-focused fieldset": { borderColor: "#4f7cb4" },
                },
                "& input::placeholder": {
                  color: alpha("#fff", 0.2),
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: alpha("#fff", 0.4), fontSize: 18 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 4, fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={300}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress sx={{ color: "#1a6fd4" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                Loading articles…
              </Typography>
            </Stack>
          </Box>
        )}

        {!loading && !error && (
          <>
            {featured && (
              <Box mb={6}>
                <FeaturedCard
                  post={featured}
                  bookmarked={bookmarks.includes(featured.id)}
                  onBookmark={() => toggleBookmark(featured.id)}
                />
              </Box>
            )}

            {rest.length > 0 && (
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={3}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "0.8rem",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    All Articles
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "'Helvetica Neue', sans-serif" }}
                  >
                    {rest.length} article{rest.length !== 1 ? "s" : ""}
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  {rest.map((post) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                      <PostCard
                        post={post}
                        bookmarked={bookmarks.includes(post.id)}
                        onBookmark={() => toggleBookmark(post.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {filtered.length === 0 && (
              <Box textAlign="center" py={10}>
                <Typography variant="h6" color="text.secondary">
                  No articles found.
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {posts.length === 0
                    ? "No posts published yet."
                    : "Try a different search term."}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>

      <Box sx={{ bgcolor: "#1a6fd4", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="sm">
          <Stack spacing={2.5} alignItems="center" textAlign="center">
            <Typography
              variant="h4"
              sx={{ color: "#fff", fontSize: { xs: "1.6rem", md: "2rem" } }}
            >
              Never miss an article.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha("#fff", 0.6),
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            >
              Get the latest posts straight to your inbox.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              width="100%"
              maxWidth={420}
            >
              <TextField
                placeholder="your@email.com"
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha("#fff", 0.06),
                    color: "#fff",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontSize: "0.875rem",
                    "& fieldset": { borderColor: alpha("#fff", 0.2) },
                    "&:hover fieldset": { borderColor: alpha("#fff", 0.4) },
                    "&.Mui-focused fieldset": { borderColor: "#1a6fd4" },
                  },
                  "& input::placeholder": {
                    color: alpha("#fff", 0.35),
                    opacity: 1,
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#ffffff",
                  px: 3,
                  borderRadius: 1,
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "black",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#1558b0", color: "white" },
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
