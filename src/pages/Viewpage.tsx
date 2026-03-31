import React, { useState, useMemo, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  InputBase,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  Divider,
  Paper,
  Container,
  Grid,
  alpha,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LayersIcon from "@mui/icons-material/Layers";
import ArticleIcon from "@mui/icons-material/Article";
import type { SxProps, Theme } from "@mui/material/styles";
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

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#C26E3E", light: "#E58D5B", dark: "#A0592E" },
    background: { default: "#F9F5F0", paper: "#FFFFFF" },
    text: { primary: "#1A1A1A", secondary: "#4A4A4A", disabled: "#888888" },
  },
  typography: {
    fontFamily: `'DM Sans', sans-serif`,
    h1: { fontFamily: `'Playfair Display', serif` },
    h2: { fontFamily: `'Playfair Display', serif` },
    h3: { fontFamily: `'Playfair Display', serif` },
    h4: { fontFamily: `'Playfair Display', serif` },
    h5: { fontFamily: `'Playfair Display', serif` },
    h6: { fontFamily: `'Playfair Display', serif` },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontFamily: `'DM Sans', sans-serif` },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, border: "1px solid #E0DCD6" },
      },
    },
  },
  shape: { borderRadius: 8 },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  authorName?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    month: "short",
    day: "numeric",
  });
}

function estimateReadTime(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  const wordCount = (div.textContent || "").trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(wordCount / 200))} min`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Gradient pool — cycles through for variety
const GRADIENTS = [
  "linear-gradient(140deg,#1e1008 0%,#7A3E1E 55%,#C26E3E 100%)",
  "linear-gradient(140deg,#08151e 0%,#1E5A7A 55%,#3E9EC2 100%)",
  "linear-gradient(140deg,#0e1e08 0%,#2A6B3E 55%,#3EAA63 100%)",
  "linear-gradient(140deg,#18081e 0%,#5A1E7A 55%,#9A3EC2 100%)",
  "linear-gradient(140deg,#1e1608 0%,#6B5A1E 55%,#C2A43E 100%)",
];

function getGradient(id: string): string {
  const index =
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    GRADIENTS.length;
  return GRADIENTS[index];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}> = ({ children, sx }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, ...sx }}>
    <Box
      sx={{ width: 24, height: 2, bgcolor: "primary.main", flexShrink: 0 }}
    />
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "primary.main",
      }}
    >
      {children}
    </Typography>
  </Box>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

// interface NavbarProps {
//   query: string;
//   onQueryChange: (v: string) => void;
// }

// const Navbar: React.FC<NavbarProps> = ({ query, onQueryChange }) => (
// <AppBar
//   position="sticky"
//   elevation={0}
//   sx={{
//     bgcolor: "background.paper",
//     borderBottom: "1px solid #E0DCD6",
//     color: "text.primary",
//   }}
// >
//   <Toolbar
//     sx={{ px: { xs: 2, md: 6 }, gap: 3, justifyContent: "space-between" }}
//   >
//     <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
//       <Box
//         sx={{
//           width: 32,
//           height: 32,
//           bgcolor: "primary.main",
//           borderRadius: "6px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <LayersIcon sx={{ fontSize: 18, color: "white" }} />
//       </Box>
//       <Typography
//         sx={{
//           fontFamily: `'Playfair Display', serif`,
//           fontWeight: 700,
//           fontSize: "1.2rem",
//           letterSpacing: "-0.02em",
//         }}
//       >
//         Build
//         <Box component="span" sx={{ color: "primary.main" }}>
//           Logs
//         </Box>
//       </Typography>
//     </Box>

//     <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
//       {["Engineering", "Design", "Product", "Authors"].map((label) => (
//         <Typography
//           key={label}
//           component="a"
//           href="#"
//           sx={{
//             fontSize: "0.82rem",
//             fontWeight: 500,
//             color: "text.disabled",
//             textDecoration: "none",
//             letterSpacing: "0.02em",
//             "&:hover": { color: "primary.main" },
//             transition: "color 0.2s",
//           }}
//         >
//           {label}
//         </Typography>
//       ))}
//     </Box>

//     <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//       <Paper
//         variant="outlined"
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 0.75,
//           px: 1.25,
//           height: 34,
//           borderColor: "#E0DCD6",
//           borderRadius: "6px",
//           "&:focus-within": { borderColor: "primary.main" },
//           transition: "border-color 0.2s",
//         }}
//       >
//         <SearchIcon sx={{ fontSize: 14, color: "text.disabled" }} />
//         <InputBase
//           value={query}
//           onChange={(e) => onQueryChange(e.target.value)}
//           placeholder="Search articles…"
//           sx={{ fontSize: "0.8rem", width: 160, "& input": { p: 0 } }}
//         />
//       </Paper>
//       <Button
//         variant="contained"
//         disableElevation
//         sx={{
//           bgcolor: "text.primary",
//           fontSize: "0.8rem",
//           fontWeight: 600,
//           px: 2.25,
//           py: 0.875,
//           minHeight: 0,
//           "&:hover": { bgcolor: "primary.main" },
//           transition: "background 0.2s, transform 0.1s",
//           "&:active": { transform: "translateY(1px)" },
//         }}
//       >
//         Subscribe
//       </Button>
//     </Box>
//   </Toolbar>
// </AppBar>
// );

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero: React.FC<{ featured: BlogPost; totalCount: number }> = ({
  featured,
  totalCount,
}) => {
  const navigate = useNavigate();
  const image = extractFirstImage(featured.content);
  const gradient = getGradient(featured.id);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid #E0DCD6",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg,#C26E3E,#E58D5B,#E8B48A,#C26E3E)",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 4, md: 6 }, px: { xs: 3, md: 6 } }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Left */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip
              label="Engineering · Design · Product"
              size="small"
              sx={{
                bgcolor: "#F5DFD0",
                border: "1px solid rgba(194,110,62,0.2)",
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                mb: 2,
                height: 28,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.2rem", md: "3rem" },
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                mb: 2,
              }}
            >
              Ideas worth
              <br />
              <Box component="em" sx={{ color: "primary.main" }}>
                building.
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "text.secondary",
                lineHeight: 1.75,
                maxWidth: 460,
                mb: 3,
              }}
            >
              Thoughtful writing on software, design, and the craft of creating
              products people love. Written by engineers who ship.
            </Typography>

            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              {[
                { num: String(totalCount), label: "Articles" },
                null,
                { num: "Weekly", label: "Cadence" },
              ].map((item, i) =>
                item === null ? (
                  <Divider
                    key={i}
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: "#E0DCD6" }}
                  />
                ) : (
                  <Box key={i} sx={{ textAlign: "center" }}>
                    <Typography
                      sx={{
                        fontFamily: `'Playfair Display', serif`,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {item.num}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Grid>

          {/* Right: Featured card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              variant="outlined"
              sx={{
                bgcolor: "#F9F5F0",
                borderColor: "#E0DCD6",
                borderRadius: 3,
                p: 2,
              }}
            >
              <SectionLabel sx={{ mb: 1.5 }}>Latest post</SectionLabel>

              <Box
                sx={{
                  height: 140,
                  borderRadius: 2,
                  background: image
                    ? `url(${image}) center/cover no-repeat`
                    : gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  mb: 1.5,
                }}
              >
                <Chip
                  label="Latest"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                    height: 22,
                    borderRadius: "4px",
                  }}
                />
                {!image && (
                  <Typography
                    sx={{
                      fontFamily: `'Playfair Display', serif`,
                      fontSize: "4rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.07)",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {initials(featured.title)}
                  </Typography>
                )}
              </Box>

              <Typography
                variant="h6"
                sx={{ fontSize: "1.1rem", lineHeight: 1.3, mb: 1 }}
              >
                {featured.title}
              </Typography>
              {featured.authorName && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    mb: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: "primary.main",
                      fontSize: "0.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {initials(featured.authorName)}
                  </Avatar>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                  >
                    {featured.authorName}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 1.25 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  {[
                    {
                      icon: <CalendarTodayIcon sx={{ fontSize: 12 }} />,
                      text: formatDate(featured.createdAt),
                    },
                    {
                      icon: <AccessTimeIcon sx={{ fontSize: 12 }} />,
                      text: `${estimateReadTime(featured.content)} read`,
                    },
                  ].map((m, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.disabled",
                        fontSize: "0.75rem",
                      }}
                    >
                      {m.icon}
                      <Typography variant="caption">{m.text}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  endIcon={
                    <ArrowForwardIcon sx={{ fontSize: "13px !important" }} />
                  }
                  onClick={() => navigate(`/blogview/${featured.id}`)}
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    p: 0,
                    minWidth: 0,
                    "&:hover": { background: "none" },
                  }}
                >
                  Read
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ─── Article Card ─────────────────────────────────────────────────────────────

interface ArticleCardProps {
  post: BlogPost;
  saved: boolean;
  onToggleSave: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  saved,
  onToggleSave,
}) => {
  const navigate = useNavigate();
  const image = extractFirstImage(post.content);
  const gradient = getGradient(post.id);
  const excerpt = htmlToExcerpt(post.content, 120);
  const readTime = estimateReadTime(post.content);

  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.22s, box-shadow 0.22s, border-color 0.22s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 20px 48px rgba(194,110,62,0.11)",
          borderColor: "rgba(194,110,62,0.35)",
        },
      }}
    >
      <CardActionArea
        sx={{ flexGrow: 0 }}
        onClick={() => navigate(`/blogview/${post.id}`)}
      >
        <Box
          sx={{
            height: 168,
            background: image
              ? `url(${image}) center/cover no-repeat`
              : gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {!image && (
            <Typography
              sx={{
                fontFamily: `'Playfair Display', serif`,
                fontSize: "3.8rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.07)",
                letterSpacing: "-0.04em",
              }}
            >
              {initials(post.title)}
            </Typography>
          )}
          <Tooltip title={saved ? "Unsave" : "Save"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(255,255,255,0.92)",
                width: 30,
                height: 30,
                borderRadius: "6px",
                "&:hover": { bgcolor: "white" },
              }}
            >
              {saved ? (
                <BookmarkIcon sx={{ fontSize: 13, color: "primary.main" }} />
              ) : (
                <BookmarkBorderIcon
                  sx={{ fontSize: 13, color: "text.secondary" }}
                />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </CardActionArea>

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: "1.2rem 1.3rem !important",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "primary.main",
            mb: 0.75,
          }}
        >
          Article
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontSize: "1.02rem", lineHeight: 1.3, mb: 0.75 }}
        >
          {post.title}
        </Typography>

        {post.authorName && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <Avatar
              sx={{
                width: 18,
                height: 18,
                bgcolor: "primary.main",
                fontSize: "0.48rem",
                fontWeight: 700,
              }}
            >
              {initials(post.authorName)}
            </Avatar>
            <Typography
              sx={{
                fontSize: "0.74rem",
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              {post.authorName}
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "text.secondary",
            lineHeight: 1.65,
            flex: 1,
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {excerpt}
        </Typography>

        <Divider sx={{ mb: 1 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.25 }}>
            {[
              {
                icon: <AccessTimeIcon sx={{ fontSize: 11 }} />,
                text: `${readTime} read`,
              },
              {
                icon: <CalendarTodayIcon sx={{ fontSize: 11 }} />,
                text: formatDate(post.createdAt),
              },
            ].map((m, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.disabled",
                  fontSize: "0.72rem",
                }}
              >
                {m.icon}
                <Typography variant="caption">{m.text}</Typography>
              </Box>
            ))}
          </Box>
          <Button
            endIcon={<ArrowForwardIcon sx={{ fontSize: "11px !important" }} />}
            onClick={() => navigate(`/blogview/${post.id}`)}
            sx={{
              color: "primary.main",
              fontWeight: 600,
              fontSize: "0.72rem",
              p: 0,
              minWidth: 0,
              "&:hover": { background: "none" },
            }}
          >
            Read
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Newsletter ───────────────────────────────────────────────────────────────

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  return (
    <Paper
      sx={{
        bgcolor: "#1A1A1A",
        borderRadius: 4,
        p: { xs: 3, md: 5 },
        mt: 2,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        justifyContent: "space-between",
        gap: 4,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#E58D5B",
            mb: 0.75,
          }}
        >
          Stay in the loop
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: "white", fontSize: "1.7rem", lineHeight: 1.2, mb: 0.75 }}
        >
          Never miss
          <br />a great article.
        </Typography>
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6,
          }}
        >
          Weekly digest of the best posts, straight to your inbox.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        <InputBase
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            bgcolor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "8px",
            px: 2,
            py: 1.25,
            color: "white",
            fontSize: "0.85rem",
            width: 220,
            "&.Mui-focused": { borderColor: "#E58D5B" },
            "& input::placeholder": { color: "rgba(255,255,255,0.35)" },
            transition: "border-color 0.2s",
          }}
        />
        <Button
          variant="contained"
          disableElevation
          sx={{
            bgcolor: "primary.main",
            fontWeight: 600,
            fontSize: "0.82rem",
            px: 2.75,
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: "primary.light",
              transform: "translateY(-1px)",
            },
            transition: "background 0.2s, transform 0.1s",
          }}
        >
          Subscribe →
        </Button>
      </Box>
    </Paper>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ hasPosts: boolean }> = ({ hasPosts }) => (
  <Box sx={{ textAlign: "center", py: 10 }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        bgcolor: "#F2EBE3",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      <ArticleIcon sx={{ color: "primary.main", fontSize: 22 }} />
    </Box>
    <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.5 }}>
      No articles found
    </Typography>
    <Typography sx={{ fontSize: "0.85rem", color: "text.disabled" }}>
      {hasPosts ? "Try a different search term." : "No posts published yet."}
    </Typography>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BuildBlogs: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Sync bookmarks from localStorage when auth state changes
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

  // Fetch posts from Firestore
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

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        htmlToExcerpt(p.content).toLowerCase().includes(q) ||
        (p.authorName ?? "").toLowerCase().includes(q),
    );
  }, [posts, searchQuery]);

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`}</style>

      {/* <Navbar query={searchQuery} onQueryChange={setSearchQuery} /> */}

      {/* Loading */}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: "primary.main" }} />
            <Typography variant="body2" color="text.secondary">
              Loading articles…
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {featured && <Hero featured={featured} totalCount={posts.length} />}

          <Container maxWidth="lg" sx={{ py: 6, px: { xs: 3, md: 6 } }}>
            {filtered.length === 0 ? (
              <EmptyState hasPosts={posts.length > 0} />
            ) : (
              <>
                {rest.length > 0 && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3.5,
                      }}
                    >
                      <SectionLabel>All Articles</SectionLabel>
                      <Chip
                        label={`${rest.length} article${rest.length !== 1 ? "s" : ""}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.78rem",
                          color: "text.disabled",
                          borderColor: "#E0DCD6",
                          bgcolor: "#F2EBE3",
                          height: 26,
                        }}
                      />
                    </Box>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      {rest.map((post) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                          <ArticleCard
                            post={post}
                            saved={bookmarks.includes(post.id)}
                            onToggleSave={() => toggleBookmark(post.id)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </>
            )}

            <Newsletter />
          </Container>
        </>
      )}
    </ThemeProvider>
  );
};

export default BuildBlogs;
