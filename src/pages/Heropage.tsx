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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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

  const ckStyles = {
    border: "1px solid",
    borderColor: error ? "error.main" : "divider",
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
      borderBottom: `1px solid ${isDark ? "#3a342e" : "#e0dcd6"} !important`,
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

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ letterSpacing: "-0.5px", color: "text.primary", mt: 1 }}
        >
          Create a New Blog
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.disabled" }}>
          Write and publish your blog.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
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
            background: "linear-gradient(90deg, #C26E3E, #E58D5B)",
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
          sx={{ mb: 3 }}
        />

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
            data={content}
            onReady={(editor: any) => {
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
            onChange={(_e, editor) => setContent(editor.getData())}
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
            sx={{ color: "text.disabled", fontSize: "0.75rem" }}
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
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <PublishIcon />
              )
            }
            sx={{
              px: 3,
              py: 1.25,
              fontSize: "1rem",
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: "primary.light", color: "white" },
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
          variant="filled"
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          onClose={() => setSuccessOpen(false)}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          Blog published successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Heropage;
