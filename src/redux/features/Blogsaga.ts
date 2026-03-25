import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchBlogsRequest, fetchBlogsSuccess, fetchBlogsFailure,
  createBlogRequest, createBlogSuccess, createBlogFailure,
  updateBlogRequest, updateBlogSuccess, updateBlogFailure,
  deleteBlogRequest, deleteBlogSuccess, deleteBlogFailure,
} from '../features/Blogslice';
import type { Blog } from '../features/Blogslice';
import {
  fetchBlogsFromFirebase,
  saveBlogToFirebase,
  updateBlogInFirebase,
  deleteBlogFromFirebase,
} from '../features/blogService';

function* fetchBlogsSaga() {
  try {
    const blogs: Blog[] = yield call(fetchBlogsFromFirebase);
    yield put(fetchBlogsSuccess(blogs));
  } catch (error: any) {
    yield put(fetchBlogsFailure(error.message || 'Failed to fetch blogs'));
  }
}

function* createBlogSaga(
  action: PayloadAction<{ title: string; content: string }>
) {
  try {
    const blog: Blog = yield call(saveBlogToFirebase, action.payload);
    yield put(createBlogSuccess(blog));
  } catch (error: any) {
    yield put(createBlogFailure(error.message || 'Failed to create blog'));
  }
}


function* updateBlogSaga(
  action: PayloadAction<{ id: string; title: string; content: string }>
) {
  try {
    yield call(updateBlogInFirebase, action.payload.id, {
      title: action.payload.title,
      content: action.payload.content,
    });
    yield put(updateBlogSuccess(action.payload));
  } catch (error: any) {
    yield put(updateBlogFailure(error.message || 'Failed to update blog'));
  }
}
const COLLECTION = 'blogs';




function* deleteBlogSaga(action: PayloadAction<string>) {
  try {
    yield call(deleteBlogFromFirebase, action.payload);
    yield put(deleteBlogSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteBlogFailure(error.message || 'Failed to delete blog'));
  }
}

export default function* blogSaga() {
  yield all([
    takeLatest(fetchBlogsRequest.type, fetchBlogsSaga),
    takeLatest(createBlogRequest.type, createBlogSaga),
    takeLatest(updateBlogRequest.type, updateBlogSaga),
    takeLatest(deleteBlogRequest.type, deleteBlogSaga),
  ]);
}