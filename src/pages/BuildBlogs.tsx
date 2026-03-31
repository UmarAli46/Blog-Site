import React, { useState, useMemo, useEffect } from "react";
import {
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
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Skeleton,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArticleIcon from "@mui/icons-material/Article";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
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
import { useAppDispatch, useAppSelector } from "../redux/Bloghooks";
import { fetchQuoteRequest } from "../redux/features/Quoteslice";

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
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function estimateReadTime(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return `${Math.max(1, Math.round((div.textContent || "").trim().split(/\s+/).length / 200))} min`;
}
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
const GRADIENTS = [
  "linear-gradient(140deg,#1e1008 0%,#7A3E1E 55%,#C26E3E 100%)",
  "linear-gradient(140deg,#08151e 0%,#1E5A7A 55%,#3E9EC2 100%)",
  "linear-gradient(140deg,#0e1e08 0%,#2A6B3E 55%,#3EAA63 100%)",
  "linear-gradient(140deg,#18081e 0%,#5A1E7A 55%,#9A3EC2 100%)",
  "linear-gradient(140deg,#1e1608 0%,#6B5A1E 55%,#C2A43E 100%)",
];
function getGradient(id: string) {
  return GRADIENTS[
    id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length
  ];
}

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

// ─── Quote Card ───────────────────────────────────────────────────────────────
const QuoteCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { quote, loading } = useAppSelector((s: any) => s.quote);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    dispatch(fetchQuoteRequest());
  }, [dispatch]);

  return (
    <Paper
      elevation={0}
      sx={{
        // ✅ Theme-aware: dark grey in dark mode, light grey surface in light mode
        bgcolor: isDark ? "#1A1A1A" : "grey.100",
        borderRadius: 3,
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        // ✅ Theme-aware border
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,#C26E3E,#E58D5B,#C26E3E)",
          borderRadius: "3px 3px 0 0",
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          mt: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "6px",
              bgcolor: "rgba(194,110,62,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FormatQuoteIcon sx={{ fontSize: 16, color: "#C26E3E" }} />
          </Box>
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C26E3E",
            }}
          >
            Quote of the moment
          </Typography>
        </Box>
        <Tooltip title="New quote">
          <IconButton
            size="small"
            onClick={() => dispatch(fetchQuoteRequest())}
            disabled={loading}
            sx={{
              // ✅ Theme-aware icon color
              color: isDark ? "rgba(255,255,255,0.3)" : "text.secondary",
              "&:hover": { color: "#C26E3E", bgcolor: "rgba(194,110,62,0.08)" },
            }}
          >
            <RefreshIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ mb: 2 }}>
          {[100, 85, 70].map((w, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={`${w}%`}
              sx={{
                // ✅ Theme-aware skeleton
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
                borderRadius: 1,
                mb: 0.5,
              }}
            />
          ))}
        </Box>
      ) : (
        <Typography
          sx={{
            fontFamily: `'Playfair Display',serif`,
            fontStyle: "italic",
            fontSize: { xs: "1rem", md: "1.1rem" },
            lineHeight: 1.7,
            // ✅ Theme-aware text: dark in light mode, light in dark mode
            color: isDark ? "rgba(255,255,255,0.88)" : "text.primary",
            mb: 2.5,
            minHeight: 80,
          }}
        >
          "{quote?.content}"
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // ✅ Theme-aware divider
          borderTop: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "divider",
          pt: 1.5,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
              }}
            />
            <Skeleton
              variant="text"
              width={100}
              sx={{
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
              }}
            />
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#C26E3E",
                fontSize: "0.65rem",
                fontWeight: 700,
                border: "1.5px solid rgba(194,110,62,0.4)",
              }}
            >
              {initials(quote?.author ?? "?")}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  // ✅ Theme-aware author name
                  color: isDark ? "rgba(255,255,255,0.85)" : "text.primary",
                  lineHeight: 1.2,
                }}
              >
                {quote?.author}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  // ✅ Theme-aware secondary text
                  color: isDark ? "rgba(255,255,255,0.35)" : "text.disabled",
                }}
              >
                via Quotable
              </Typography>
            </Box>
          </Box>
        )}
        <Chip
          label="Inspire"
          size="small"
          sx={{
            bgcolor: "rgba(194,110,62,0.12)",
            color: "#C26E3E",
            border: "1px solid rgba(194,110,62,0.25)",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            height: 22,
            borderRadius: "4px",
          }}
        />
      </Box>
    </Paper>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero: React.FC<{ totalCount: number }> = ({ totalCount }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        // ✅ Theme-aware hero background: white/light in light mode, #111 in dark mode
        bgcolor: isDark ? "#111111" : "background.paper",
        borderBottom: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "divider",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle light-mode background texture */}
      {!isDark && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(194,110,62,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
      )}
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
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid",
                borderColor: isDark
                  ? "rgba(194,110,62,0.35)"
                  : "rgba(194,110,62,0.4)",
                borderRadius: "20px",
                px: 1.75,
                py: 0.625,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#C26E3E",
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  // ✅ Theme-aware tag text
                  color: isDark ? "rgba(255,255,255,0.55)" : "text.secondary",
                }}
              >
                Engineering · Design · Product
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                // ✅ Theme-aware heading: black in light mode, white in dark
                color: isDark ? "white" : "text.primary",
                mb: 1.5,
              }}
            >
              Ideas worth
              <br />
              <Box
                component="em"
                sx={{
                  fontStyle: "italic",
                  color: "#C26E3E",
                  fontFamily: `'Playfair Display',serif`,
                }}
              >
                building.
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: "0.95rem",
                // ✅ Theme-aware body text
                color: isDark ? "rgba(255,255,255,0.5)" : "text.secondary",
                lineHeight: 1.8,
                maxWidth: 400,
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
                  <Box
                    key={i}
                    sx={{
                      width: "1px",
                      height: 36,
                      // ✅ Theme-aware divider
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.12)",
                    }}
                  />
                ) : (
                  <Box key={i}>
                    <Typography
                      sx={{
                        fontFamily: `'Playfair Display',serif`,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        // ✅ Theme-aware stat number
                        color: isDark ? "white" : "text.primary",
                        lineHeight: 1,
                      }}
                    >
                      {item.num}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        // ✅ Theme-aware stat label
                        color: isDark
                          ? "rgba(255,255,255,0.3)"
                          : "text.disabled",
                        mt: 0.5,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>

            <Box
              sx={{
                width: 80,
                height: 2,
                background: "linear-gradient(90deg,#C26E3E,transparent)",
                mt: 3,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <QuoteCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ─── Latest Post ──────────────────────────────────────────────────────────────
const LatestPostCard: React.FC<{
  post: BlogPost;
  saved: boolean;
  onToggleSave: () => void;
}> = ({ post, saved, onToggleSave }) => {
  const navigate = useNavigate();
  const image = extractFirstImage(post.content);
  const gradient = getGradient(post.id);
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        transition: "box-shadow 0.25s,border-color 0.25s",
        "&:hover": {
          boxShadow: "0 16px 48px rgba(194,110,62,0.10)",
          borderColor: "primary.light",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: 280 },
          minHeight: { xs: 180, md: "auto" },
          background: image ? `url(${image}) center/cover no-repeat` : gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Chip
          label="Latest"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            bgcolor: "#C26E3E",
            color: "white",
            fontWeight: 700,
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            height: 22,
            borderRadius: "4px",
          }}
        />
        <Tooltip title={saved ? "Remove bookmark" : "Bookmark"}>
          <IconButton
            size="small"
            onClick={onToggleSave}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: "rgba(255,255,255,0.92)",
              width: 30,
              height: 30,
              borderRadius: "6px",
              "&:hover": { bgcolor: "white" },
            }}
          >
            {saved ? (
              <BookmarkIcon sx={{ fontSize: 13, color: "#C26E3E" }} />
            ) : (
              <BookmarkBorderIcon
                sx={{ fontSize: 13, color: "text.secondary" }}
              />
            )}
          </IconButton>
        </Tooltip>
        {!image && (
          <Typography
            sx={{
              fontFamily: `'Playfair Display',serif`,
              fontSize: "5rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.07)",
            }}
          >
            {initials(post.title)}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 3.5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <SectionLabel sx={{ mb: 1.5 }}>Latest Post</SectionLabel>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.3rem", md: "1.6rem" },
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              mb: 1,
              cursor: "pointer",
              "&:hover": { color: "primary.main" },
              transition: "color 0.2s",
            }}
            onClick={() => navigate(`/blogview/${post.id}`)}
          >
            {post.title}
          </Typography>
          {post.authorName && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}
            >
              <Avatar
                sx={{
                  width: 22,
                  height: 22,
                  fontSize: "0.52rem",
                  bgcolor: "#C26E3E",
                }}
              >
                {initials(post.authorName)}
              </Avatar>
              <Typography
                sx={{
                  fontSize: "0.8rem",
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
              fontSize: "0.9rem",
              color: "text.secondary",
              lineHeight: 1.75,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {htmlToExcerpt(post.content, 200)}
          </Typography>
        </Box>
        <Box>
          <Divider sx={{ my: 2 }} />
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
                  text: formatDate(post.createdAt),
                },
                {
                  icon: <AccessTimeIcon sx={{ fontSize: 12 }} />,
                  text: `${estimateReadTime(post.content)} read`,
                },
              ].map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "text.disabled",
                  }}
                >
                  {m.icon}
                  <Typography variant="caption">{m.text}</Typography>
                </Box>
              ))}
            </Box>
            <Button
              variant="contained"
              disableElevation
              endIcon={
                <ArrowForwardIcon sx={{ fontSize: "13px !important" }} />
              }
              onClick={() => navigate(`/blogview/${post.id}`)}
              sx={{
                bgcolor: "#C26E3E",
                color: "white",
                fontWeight: 600,
                fontSize: "0.78rem",
                px: 2.5,
                py: 0.875,
                borderRadius: "8px",
                "&:hover": {
                  bgcolor: "#E58D5B",
                  transform: "translateY(-1px)",
                },
                transition: "background 0.2s,transform 0.15s",
              }}
            >
              Read Article
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// ─── Article Card ─────────────────────────────────────────────────────────────
const ArticleCard: React.FC<{
  post: BlogPost;
  saved: boolean;
  onToggleSave: () => void;
}> = ({ post, saved, onToggleSave }) => {
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
        transition: "transform 0.22s,box-shadow 0.22s,border-color 0.22s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 20px 48px rgba(194,110,62,0.13)",
          borderColor: "primary.light",
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
                fontFamily: `'Playfair Display',serif`,
                fontSize: "3.8rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.07)",
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
                fontSize: "0.48rem",
                bgcolor: "#C26E3E",
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

// ─── Creator Section ──────────────────────────────────────────────────────────
const CreatorSection: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        // ✅ Theme-aware: dark in dark mode, subtle grey in light mode
        bgcolor: isDark ? "#111111" : "grey.50",
        borderRadius: 4,
        p: { xs: 3, md: 5 },
        mt: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 4,
        border: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "divider",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#C26E3E",
            mb: 1.5,
          }}
        >
          By the creator
        </Typography>
        <Typography
          sx={{
            fontFamily: `'Playfair Display',serif`,
            fontStyle: "italic",
            fontSize: { xs: "1.1rem", md: "1.3rem" },
            lineHeight: 1.65,
            // ✅ Theme-aware quote text
            color: isDark ? "rgba(255,255,255,0.85)" : "text.primary",
            mb: 2.5,
          }}
        >
          "I built BuildLogs because I wanted a space where builders share what
          they actually learned — not just what worked, but what didn't."
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg,#C26E3E,#E58D5B)",
              fontSize: "1.1rem",
              fontWeight: 700,
              border: "2px solid rgba(194,110,62,0.4)",
              fontFamily: `'Playfair Display',serif`,
            }}
          >
            HK
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                // ✅ Theme-aware name
                color: isDark ? "white" : "text.primary",
                mb: 0.25,
              }}
            >
              Haris Khan
            </Typography>
            <Typography
              sx={{
                fontSize: "0.78rem",
                // ✅ Theme-aware subtitle
                color: isDark ? "rgba(255,255,255,0.4)" : "text.secondary",
              }}
            >
              Founder · Full-Stack Developer · Pakistan
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          borderLeft: { md: "1px solid" },
          borderColor: isDark
            ? { md: "rgba(255,255,255,0.07)" }
            : { md: "divider" },
          pl: { md: 4 },
        }}
      >
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          {[
            {
              label: "React · TypeScript · Redux",
              sub: "Frontend architecture",
              icon: "</>",
            },
            {
              label: "Firebase · Firestore",
              sub: "Backend & database",
              icon: "DB",
            },
            { label: "MUI · Tailwind", sub: "UI & design systems", icon: "UI" },
          ].map((skill) => (
            <Box
              key={skill.label}
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  // ✅ Theme-aware skill icon bg
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  border: "1px solid",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    color: "#C26E3E",
                  }}
                >
                  {skill.icon}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    // ✅ Theme-aware skill label
                    color: isDark ? "rgba(255,255,255,0.75)" : "text.primary",
                  }}
                >
                  {skill.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    // ✅ Theme-aware skill sub
                    color: isDark ? "rgba(255,255,255,0.3)" : "text.secondary",
                  }}
                >
                  {skill.sub}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            borderTop: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.07)" : "divider",
            pt: 2,
          }}
        >
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#C26E3E",
              color: "white",
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 2.5,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#E58D5B" },
            }}
          >
            Read my story ↗
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: isDark ? "rgba(255,255,255,0.55)" : "text.secondary",
              borderColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.2)",
              fontSize: "0.8rem",
              borderRadius: "8px",
              "&:hover": {
                borderColor: isDark ? "rgba(255,255,255,0.4)" : "text.primary",
                color: isDark ? "white" : "text.primary",
                bgcolor: "transparent",
              },
            }}
          >
            View profile
          </Button>
        </Box>
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
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
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

// ─── Main ─────────────────────────────────────────────────────────────────────
const BuildBlogs = ({ searchQuery = "" }: { searchQuery?: string }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        const saved = localStorage.getItem(`bookmarks_${user.uid}`);
        setBookmarks(saved ? JSON.parse(saved) : []);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data: BlogPost[] = await Promise.all(
          snap.docs.map(async (blogDoc) => {
            const d = blogDoc.data();
            let authorName: string | null = d.authorName ?? null;
            if (!authorName && d.userEmail) {
              try {
                const us = await getDoc(doc(db, "users", d.userEmail));
                if (us.exists()) {
                  const { firstName, lastName } = us.data();
                  authorName =
                    `${firstName ?? ""} ${lastName ?? ""}`.trim() ||
                    d.userEmail;
                } else authorName = d.userEmail;
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
      } catch {
        setError("Failed to load articles.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleBookmark = (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    localStorage.setItem(`bookmarks_${user.uid}`, JSON.stringify(updated));
    setBookmarks(updated);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return q
      ? posts.filter((p) =>
          [p.title, htmlToExcerpt(p.content), p.authorName ?? ""].some((f) =>
            f.toLowerCase().includes(q),
          ),
        )
      : posts;
  }, [posts, searchQuery]);

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary">
              Loading articles…
            </Typography>
          </Stack>
        </Box>
      )}
      {!loading && error && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}
      {!loading && !error && (
        <>
          <Hero totalCount={posts.length} />
          <Container maxWidth="lg" sx={{ py: 5, px: { xs: 3, md: 6 } }}>
            {filtered.length === 0 ? (
              <EmptyState hasPosts={posts.length > 0} />
            ) : (
              <>
                {featured && (
                  <Box sx={{ mb: 5 }}>
                    <LatestPostCard
                      post={featured}
                      saved={bookmarks.includes(featured.id)}
                      onToggleSave={() => toggleBookmark(featured.id)}
                    />
                  </Box>
                )}
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
            <CreatorSection />
          </Container>
        </>
      )}
    </Box>
  );
};

export default BuildBlogs;
