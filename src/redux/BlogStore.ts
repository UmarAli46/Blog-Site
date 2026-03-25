import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import blogReducer from './features/Blogslice';
import blogSaga from './features/Blogsaga';

const sagaMiddleware = createSagaMiddleware();


export const store = configureStore({
  reducer: {
    blogs: blogReducer,  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }) 
      .concat(sagaMiddleware),
});


function* rootSaga() {
  yield all([
    blogSaga(),           
  ]);
}

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
