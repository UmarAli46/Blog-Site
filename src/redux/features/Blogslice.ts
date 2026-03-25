import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Blog {
  id: string;
  userId?: string;
  authorName?: string;
  title: string;
  content: string;
  createdAt: number;
}

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  saving: boolean;
  deleting: string | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: BlogState = {
  blogs: [],
  loading: false,
  saving: false,
  deleting: null,
  error: null,
  successMessage: null,
};

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    fetchBlogsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchBlogsSuccess(state, action: PayloadAction<Blog[]>) {
      state.loading = false;
      state.blogs = action.payload;
    },
    fetchBlogsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchAllBlogsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllBlogsSuccess(state, action: PayloadAction<Blog[]>) {
      state.loading = false;
      state.blogs = action.payload;
    },
    fetchAllBlogsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    createBlogRequest(state, _action: PayloadAction<{ title: string; content: string }>) {
      state.saving = true;
      state.error = null;
      state.successMessage = null;
    },
    createBlogSuccess(state, action: PayloadAction<Blog>) {
      state.saving = false;
      state.blogs.unshift(action.payload);
      state.successMessage = 'Blog published successfully!';
    },
    createBlogFailure(state, action: PayloadAction<string>) {
      state.saving = false;
      state.error = action.payload;
    },

    updateBlogRequest(state, _action: PayloadAction<{ id: string; title: string; content: string }>) {
      state.saving = true;
      state.error = null;
      state.successMessage = null;
    },
    updateBlogSuccess(state, action: PayloadAction<{ id: string; title: string; content: string }>) {
      state.saving = false;
      const index = state.blogs.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.blogs[index] = { ...state.blogs[index], ...action.payload };
      }
      state.successMessage = 'Blog updated successfully!';
    },
    updateBlogFailure(state, action: PayloadAction<string>) {
      state.saving = false;
      state.error = action.payload;
    },

    deleteBlogRequest(state, action: PayloadAction<string>) {
      state.deleting = action.payload;
      state.error = null;
    },
    deleteBlogSuccess(state, action: PayloadAction<string>) {
      state.deleting = null;
      state.blogs = state.blogs.filter((b) => b.id !== action.payload);
      state.successMessage = 'Blog deleted successfully!';
    },
    deleteBlogFailure(state, action: PayloadAction<string>) {
      state.deleting = null;
      state.error = action.payload;
    },

    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
});

export const {
  fetchBlogsRequest, fetchBlogsSuccess, fetchBlogsFailure,
  fetchAllBlogsRequest, fetchAllBlogsSuccess, fetchAllBlogsFailure,
  createBlogRequest, createBlogSuccess, createBlogFailure,
  updateBlogRequest, updateBlogSuccess, updateBlogFailure,
  deleteBlogRequest, deleteBlogSuccess, deleteBlogFailure,
  clearMessages,
} = blogSlice.actions;

export default blogSlice.reducer;