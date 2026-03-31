import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useAppDispatch, useAppSelector } from "../redux/Bloghooks";
import {
  fetchBlogsRequest,
  updateBlogRequest,
  deleteBlogRequest,
  clearMessages,
} from "../redux/features/Blogslice";
import type { Blog } from "../redux/features/Blogslice";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Skeleton,
  Tooltip,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { useTheme } from "@mui/material/styles";

const BlogCardSkeleton = () => (
  <Card elevation={0} sx={{ borderRadius: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Skeleton
        variant="rounded"
        width={80}
        height={22}
        sx={{ mb: 2, borderRadius: 10 }}
      />
      <Skeleton variant="text" sx={{ fontSize: "1.4rem", mb: 0.5 }} />
      <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
);

const Pages = () => {
  const dispatch = useAppDispatch();
  const { blogs, loading, saving, deleting, error, successMessage } =
    useAppSelector((s) => s.blogs);

  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editErrors, setEditErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    dispatch(fetchBlogsRequest());
  }, [dispatch]);
  useEffect(() => {
    if (successMessage && editBlog) setEditBlog(null);
  }, [successMessage]);

  const handleEditOpen = (blog: Blog) => {
    setEditBlog(blog);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setEditErrors({});
  };

  const validateEdit = () => {
    const e: { title?: string; content?: string } = {};
    if (!editTitle.trim()) e.title = "Title is required";
    if (!editContent.replace(/<[^>]+>/g, "").trim())
      e.content = "Content cannot be empty";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEditSave = () => {
    if (!editBlog || !validateEdit()) return;
    dispatch(
      updateBlogRequest({
        id: editBlog.id,
        title: editTitle,
        content: editContent,
      }),
    );
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const wordCount = (html: string) =>
    html
      .replace(/<[^>]+>/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

  // Shared CKEditor style block
  const ckStyles = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    overflow: "hidden",
    mb: 3,
    transition: "border-color 0.2s",
    "&:focus-within": { borderColor: "primary.main" },
    "& .ck-editor__editable": {
      minHeight: "300px !important",
      backgroundColor: `${isDark ? "#1e1b18" : "#fff"} !important`,
      color: `${isDark ? "#f0ebe4" : "#1a1a1a"} !important`,
      fontSize: "1rem",
      lineHeight: "1.8",
    },
    "& .ck-editor__editable_inline": { minHeight: "300px !important" },
    "& .ck.ck-toolbar": {
      backgroundColor: `${isDark ? "#2a241f" : "#faf6f2"} !important`,
      borderColor: `${isDark ? "#3a342e" : "#e0dcd6"} !important`,
    },
    "& .ck.ck-button, & .ck.ck-icon": {
      color: `${isDark ? "#f0ebe4" : "#1a1a1a"} !important`,
    },
    "& .ck.ck-dropdown__panel": {
      backgroundColor: `${isDark ? "#2a241f" : "#fff"} !important`,
      borderColor: `${isDark ? "#3a342e" : "#e0dcd6"} !important`,
    },
    "& .ck.ck-list__item .ck-button": {
      color: `${isDark ? "#f0ebe4" : "#1a1a1a"} !important`,
    },
  };

  const ckConfig = {
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "link",
      "blockQuote",
      "imageUpload",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "undo",
      "redo",
    ],
  };
  const ckUploadAdapter = (editor: any) => {
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any,
    ) => ({
      upload: () =>
        loader.file.then(
          (file: File) =>
            new Promise<{ default: string }>((res, rej) => {
              const r = new FileReader();
              r.onload = () => res({ default: r.result as string });
              r.onerror = rej;
              r.readAsDataURL(file);
            }),
        ),
      abort: () => {},
    });
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 3, color: "primary.main", fontWeight: 700 }}
          >
            Manage
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ letterSpacing: "-0.5px", color: "text.primary" }}
          >
            Published Blogs
          </Typography>
        </Box>
        <Chip
          label={`${blogs.length} post${blogs.length !== 1 ? "s" : ""}`}
          size="small"
          sx={{
            bgcolor: "primary.light",
            color: "primary.dark",
            fontWeight: 700,
            border: "1px solid",
            borderColor: "primary.main",
            opacity: 0.85,
          }}
        />
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearMessages())}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {loading ? (
          [1, 2, 3].map((i) => <BlogCardSkeleton key={i} />)
        ) : blogs.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 12,
              border: "1px dashed",
              borderColor: "primary.light",
              borderRadius: 3,
              bgcolor: "background.default",
            }}
          >
            <ArticleOutlinedIcon
              sx={{ fontSize: 56, mb: 2, color: "primary.main", opacity: 0.4 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No blogs published yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Head to Create Blogs and publish your first post.
            </Typography>
          </Box>
        ) : (
          blogs.map((blog) => (
            <Card
              key={blog.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                transition:
                  "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 24px rgba(194,110,62,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                    {formatDate(blog.createdAt)} · {wordCount(blog.content)}{" "}
                    words
                  </Typography>
                </Stack>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{
                    letterSpacing: "-0.3px",
                    mb: 1,
                    lineHeight: 1.2,
                    color: "text.primary",
                  }}
                >
                  {blog.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {blog.content.replace(/<[^>]+>/g, "")}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions
                sx={{
                  px: 3,
                  py: 1.5,
                  justifyContent: "flex-end",
                  gap: 1,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                <Tooltip title="Edit blog">
                  <IconButton
                    size="small"
                    onClick={() => handleEditOpen(blog)}
                    sx={{
                      color: "text.disabled",
                      "&:hover": {
                        color: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete blog">
                  <IconButton
                    size="small"
                    onClick={() => setDeleteId(blog.id)}
                    disabled={deleting === blog.id}
                    sx={{
                      color: "text.disabled",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    {deleting === blog.id ? (
                      <CircularProgress size={16} color="error" />
                    ) : (
                      <DeleteOutlineIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleEditOpen(blog)}
                  sx={{
                    ml: 1,
                    borderRadius: 2,
                    fontSize: "0.8rem",
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "primary.dark",
                      color: "primary.dark",
                    },
                  }}
                >
                  Edit Post
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Stack>

      <Dialog
        open={!!editBlog}
        onClose={() => !saving && setEditBlog(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #C26E3E, #E58D5B)",
          }}
        />
        <DialogTitle
          sx={{
            fontFamily: `'Playfair Display', serif`,
            fontSize: "1.6rem",
            fontWeight: 700,
            pb: 1,
            color: "text.primary",
          }}
        >
          Edit Blog Post
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Blog Title"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (editErrors.title)
                  setEditErrors((p) => ({ ...p, title: undefined }));
              }}
              error={!!editErrors.title}
              helperText={editErrors.title}
              inputProps={{ style: { fontSize: "1.15rem", fontWeight: 600 } }}
            />
            <Box>
              <Typography
                variant="overline"
                sx={{
                  mb: 1,
                  display: "block",
                  letterSpacing: 2,
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                Content
              </Typography>
              <Box sx={ckStyles}>
                <CKEditor
                  editor={ClassicEditor}
                  data={editContent}
                  onReady={ckUploadAdapter}
                  config={ckConfig}
                  onChange={(_e, editor) => {
                    setEditContent(editor.getData());
                    if (editErrors.content)
                      setEditErrors((p) => ({ ...p, content: undefined }));
                  }}
                />
              </Box>
              {editErrors.content && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 1.5, display: "block" }}
                >
                  {editErrors.content}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setEditBlog(null)}
            disabled={saving}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={saving}
            endIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{
              px: 3,
              borderRadius: 2,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #b91c1c, #ef4444)",
          }}
        />
        <DialogTitle
          sx={{
            fontFamily: `'Playfair Display', serif`,
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          Delete this blog?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove the blog from Firebase. This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteId(null)}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (deleteId) {
                dispatch(deleteBlogRequest(deleteId));
                setDeleteId(null);
              }
            }}
            sx={{
              bgcolor: "error.main",
              color: "#fff",
              borderRadius: 2,
              "&:hover": { bgcolor: "#c62828" },
            }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => dispatch(clearMessages())}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          onClose={() => dispatch(clearMessages())}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pages;
