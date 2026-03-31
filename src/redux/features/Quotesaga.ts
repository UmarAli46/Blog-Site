
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchQuoteRequest,
  fetchQuoteSuccess,
  fetchQuoteFailure,
  type Quote,
} from '../features/Quoteslice';

async function fetchRandomQuote(): Promise<Quote> {
  const res = await fetch('https://api.quotable.io/random?maxLength=180');
  if (!res.ok) throw new Error('Failed to fetch quote');
  const data = await res.json();
  return { content: data.content, author: data.author };
}

function* fetchQuoteSaga() {
  try {
    const quote: Quote = yield call(fetchRandomQuote);
    yield put(fetchQuoteSuccess(quote));
  } catch (error: any) {
    yield put(fetchQuoteFailure(error.message || 'Failed to fetch quote'));
  }
}

export default function* quoteSaga() {
  yield takeLatest(fetchQuoteRequest.type, fetchQuoteSaga);
}