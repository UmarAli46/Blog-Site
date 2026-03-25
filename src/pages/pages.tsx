import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FirebaseUploadAdapterPlugin } from "../firebase/uploadAdopter";
import { useAppDispatch, useAppSelector } from "../redux/Bloghooks";
import {
  fetchBlogsRequest,
  updateBlogRequest,
  deleteBlogRequest,
  clearMessages,
} from "../redux/features/Blogslice";
import type { Blog } from "../redux/features/Blogslice";
// import { useTheme } from "@mui/material/styles";
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

const BlogCardSkeleton = () => (
  <Card
    elevation={0}
    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
  >
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

  useEffect(() => {
    dispatch(fetchBlogsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage && editBlog) {
      setEditBlog(null);
    }
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
    const plain = editContent.replace(/<[^>]+>/g, "").trim();
    if (!plain) e.content = "Content cannot be empty";
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

  const handleDeleteConfirm = () => {
    if (deleteId) {
      dispatch(deleteBlogRequest(deleteId));
      setDeleteId(null);
    }
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

  // const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 3,
              color: "#1a6fd4",
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
            }}
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
            bgcolor: "#e8f0fd",
            color: "#1a6fd4",
            fontWeight: 700,
            fontFamily: '"DM Sans", sans-serif',
            border: "1px solid",
            borderColor: "#b5d4f4",
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
              border: "1px dashed #b5d4f4",
              borderRadius: 3,
              bgcolor: "#f5f8fe",
            }}
          >
            <ArticleOutlinedIcon
              sx={{ fontSize: 56, mb: 2, color: "#1a6fd4", opacity: 0.4 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No blogs published yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Head to the Editor tab and publish your first post.
            </Typography>
          </Box>
        ) : (
          blogs.map((blog) => (
            <Card
              key={blog.id}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "#dde3ee",
                borderRadius: 3,
                bgcolor: "background.default",
                transition:
                  "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: "#1a6fd4",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 24px rgba(26,111,212,0.10)",
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
                      bgcolor: "#1a6fd4",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      color: "#888",
                    }}
                  >
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

              <Divider sx={{ borderColor: "text.primary" }} />

              <CardActions
                sx={{
                  px: 3,
                  py: 1.5,
                  justifyContent: "flex-end",
                  gap: 1,
                  bgcolor: "background.default",
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                <Tooltip title="Edit blog">
                  <IconButton
                    size="small"
                    onClick={() => handleEditOpen(blog)}
                    sx={{
                      color: "#888",
                      "&:hover": {
                        color: "#1a6fd4",
                        bgcolor: "rgba(26,111,212,0.08)",
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
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "rgba(255,107,107,0.1)",
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
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.8rem",
                    borderColor: "#1a6fd4",
                    color: "#1a6fd4",
                    "&:hover": {
                      bgcolor: "#e8f0fd",
                      borderColor: "#1558b0",
                      color: "#1558b0",
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
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: "1px solid #dde3ee",
            bgcolor: "#fff",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #0d1b3e, #1a6fd4)",
          }}
        />
        <DialogTitle
          sx={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: "1.6rem",
            fontWeight: 700,
            pb: 1,
            color: "#0a0a0a",
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#1a6fd4" },
                },
                "& label.Mui-focused": { color: "#1a6fd4" },
              }}
            />

            <Box>
              <Typography
                variant="overline"
                sx={{
                  mb: 1,
                  display: "block",
                  letterSpacing: 2,
                  color: "#1a6fd4",
                  fontWeight: 700,
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                Content
              </Typography>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: editErrors.content ? "error.main" : "#dde3ee",
                  borderRadius: 2,
                  overflow: "hidden",
                  "& .ck-editor__editable": {
                    minHeight: 280,
                    fontSize: "1rem",
                    lineHeight: 1.8,
                  },
                  "& .ck.ck-toolbar": {
                    borderBottom: "1px solid #dde3ee",
                  },
                }}
              >
                <CKEditor
                  editor={ClassicEditor}
                  data={editContent}
                  config={{
                    extraPlugins: [FirebaseUploadAdapterPlugin],
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
                  }}
                  onChange={(_event, editor) => {
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
                  sx={{ ml: 1.5, mt: 0.5, display: "block" }}
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
              fontFamily: '"DM Sans", sans-serif',
              "&:hover": { color: "#0a0a0a", bgcolor: "#f5f7fa" },
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
              fontFamily: '"DM Sans", sans-serif',
              bgcolor: "#1a6fd4",
              "&:hover": { bgcolor: "#1558b0" },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid #dde3ee",
            bgcolor: "#fff",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #b91c1c, #ef4444)",
          }}
        />
        <DialogTitle
          sx={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#0a0a0a",
          }}
        >
          Delete this blog?
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            This will permanently remove the blog from Firebase. This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteId(null)}
            sx={{
              color: "text.secondary",
              fontFamily: '"DM Sans", sans-serif',
              "&:hover": { color: "#0a0a0a", bgcolor: "background.default" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            sx={{
              bgcolor: "error.main",
              color: "#fff",
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif',
              "&:hover": { bgcolor: "#e53935" },
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
          severity="warning"
          icon={<CheckCircleOutlineIcon />}
          onClose={() => dispatch(clearMessages())}
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(26,111,212,0.15)",
            border: "1px solid #f16a6a",
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pages;
