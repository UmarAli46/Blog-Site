import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useState } from "react";
import { saveBlogToFirebase } from "../redux/features/blogService";

import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Snackbar,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTheme } from "@mui/material/styles";

interface BlogEditorProps {
  onSave?: (data: { title: string; content: string }) => void;
}

const Heropage: React.FC<BlogEditorProps> = ({ onSave }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both the title and content.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const id = await saveBlogToFirebase({ title, content });
      console.log("Blog saved with ID:", id);
      onSave?.({ title, content });
      setTitle("");
      setContent("");
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to save blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>
      <Box sx={{ mb: 4 }}>
        {/* <Typography
          variant="overline"
          sx={{
            letterSpacing: 3,
            color: "#1a6fd4",
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700,
          }}
        >
          Editor
        </Typography> */}
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ letterSpacing: "-0.5px", color: "text.primary", mt: 1 }}
        >
          Create a New Blog
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: "#888", fontFamily: '"DM Sans", sans-serif' }}
        >
          Write and publish your blog.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid #dde3ee",
          bgcolor: "background.paper",
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #0d1b3e, #1a6fd4)",
          },
        }}
      >
        <TextField
          fullWidth
          label="Blog Title"
          placeholder="Enter your blog title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          variant="outlined"
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
              color: "text.primary",
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "text.secondary" },
            },
            "& .MuiInputBase-input": { color: "text.primary" },
            "& .MuiInputBase-input::placeholder": {
              color: "text.secondary",
              opacity: 1,
            },
            "& .MuiInputLabel-root": { color: "text.secondary" },
            "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
          }}
        />

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
            borderColor: error ? "error.main" : "#dde3ee",
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
            transition: "border-color 0.2s",
            "&:focus-within": { borderColor: "#1a6fd4" },

            "& .ck-editor__editable": {
              minHeight: "300px !important",
              backgroundColor: isDark
                ? "#1e1e1e !important"
                : "#fff !important",
              color: isDark ? "#f5f5f5 !important" : "#0a0a0a !important",
              fontSize: "1rem",
              lineHeight: "1.8",
            },
            "& .ck-editor__editable_inline": {
              minHeight: "300px !important",
            },
            "& .ck.ck-toolbar": {
              backgroundColor: isDark
                ? "#2a2a2a !important"
                : "#f5f5f5 !important",
              borderColor: isDark ? "#444 !important" : "#ccc !important",
              borderBottom: isDark
                ? "1px solid #444 !important"
                : "1px solid #dde3ee !important",
            },
            "& .ck.ck-button": {
              color: isDark ? "#f5f5f5 !important" : "#0a0a0a !important",
            },
            "& .ck.ck-icon": {
              color: isDark ? "#f5f5f5 !important" : "#0a0a0a !important",
            },
            "& .ck.ck-dropdown__panel": {
              backgroundColor: isDark
                ? "#2a2a2a !important"
                : "#fff !important",
              borderColor: isDark ? "#444 !important" : "#ccc !important",
            },
            "& .ck.ck-list__item .ck-button": {
              color: isDark ? "#f5f5f5 !important" : "#0a0a0a !important",
            },
            "& .ck.ck-heading_heading1": { fontSize: "1.8rem !important" },
            "& .ck.ck-heading_heading2": { fontSize: "1.5rem !important" },
            "& .ck.ck-heading_heading3": { fontSize: "1.2rem !important" },
          }}
        >
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onReady={(editor: any) => {
              editor.plugins.get("FileRepository").createUploadAdapter = (
                loader: any,
              ) => {
                return {
                  upload() {
                    return loader.file.then((file: File) => {
                      return new Promise<{ default: string }>(
                        (resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            resolve({ default: reader.result as string });
                          };
                          reader.onerror = (err) => reject(err);
                          reader.readAsDataURL(file);
                        },
                      );
                    });
                  },
                  abort() {},
                };
              };
            }}
            config={{
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
              setContent(editor.getData());
            }}
          />
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.75rem",
            }}
          >
            {
              content
                .replace(/<[^>]+>/g, "")
                .trim()
                .split(/\s+/)
                .filter(Boolean).length
            }{" "}
            words
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving}
            endIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <PublishIcon />
              )
            }
            sx={{
              px: 4,
              py: 1.25,
              fontSize: "1rem",
              borderRadius: 2,
              bgcolor: "#1a6fd4",
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#1558b0" },
              "&.Mui-disabled": { bgcolor: "#b5d4f4", color: "#fff" },
            }}
          >
            {saving ? "Publishing..." : "Publish Blog"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          onClose={() => setSuccessOpen(false)}
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(26,111,212,0.15)",
            border: "1px solid #b5d4f4",
          }}
        >
          Blog published! ✦
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Heropage;
