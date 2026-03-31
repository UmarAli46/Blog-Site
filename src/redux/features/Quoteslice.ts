// src/redux/features/quoteSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Quote {
  content: string;
  author: string;
}

interface QuoteState {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuoteState = {
  quote: null,
  loading: false,
  error: null,
};

const quoteSlice = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    fetchQuoteRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchQuoteSuccess(state, action: PayloadAction<Quote>) {
      state.loading = false;
      state.quote = action.payload;
    },
    fetchQuoteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;

      state.quote = {
        content: "The best products are built by people who care deeply about the craft — not just the outcome, but every decision along the way.",
        author: "BuildLogs Editorial",
      };
    },
  },
});

export const { fetchQuoteRequest, fetchQuoteSuccess, fetchQuoteFailure } =
  quoteSlice.actions;
export default quoteSlice.reducer;