import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: { seconds: number } | null;
}

interface Props {
  blogId: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function Comments({ blogId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, "blogs", blogId, "comments"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment));
      setLoading(false);
    });
    return () => unsub();
  }, [blogId]);

  const handleSubmit = async () => {
    if (!text.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const { firstName, lastName } = userDoc.exists()
        ? (userDoc.data() as { firstName: string; lastName: string })
        : { firstName: "", lastName: "" };

      const userName =
        `${firstName} ${lastName}`.trim() || currentUser.email || "Anonymous";

      await addDoc(collection(db, "blogs", blogId, "comments"), {
        userId: currentUser.uid,
        userName,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "blogs", blogId, "comments", commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatDate = (ts: { seconds: number } | null) => {
    if (!ts) return "";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 4 }} />

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 3, fontFamily: `'Playfair Display', serif` }}
      >
        Comments ({comments.length})
      </Typography>

      {currentUser ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          <TextField
            multiline
            minRows={2}
            fullWidth
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            sx={{ alignSelf: "flex-end", px: 3 }}
          >
            {submitting ? (
              <CircularProgress size={18} sx={{ color: "white" }} />
            ) : (
              "Post Comment"
            )}
          </Button>
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{ mb: 4, color: "text.secondary", fontStyle: "italic" }}
        >
          Please log in to leave a comment.
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {comments.map((c) => (
            <Box key={c.id}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: "0.75rem" }}>
                  {getInitials(c.userName)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {c.userName}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDate(c.createdAt)}
                      </Typography>
                    </Box>

                    {currentUser?.uid === c.userId && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(c.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ mt: 0.75, color: "text.secondary", lineHeight: 1.7 }}
                  >
                    {c.text}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
