import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import interviewReducer from './interviewSlice';
import authReducer from './authSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['candidates', 'currentCandidate'], // Only persist these fields
  migrate: (state: any) => {
    // Handle migration and corrupted state
    try {
      if (state && state._persist) {
        return Promise.resolve(state);
      }
      return Promise.resolve(state);
    } catch (error) {
      console.error('Migration error, clearing state:', error);
      return Promise.resolve(undefined);
    }
  },
};

const authPersistConfig = {
  key: 'auth',
  version: 1,
  storage,
  whitelist: ['currentUser', 'isAuthenticated'], // Persist auth state
  migrate: (state: any) => {
    try {
      if (state && state._persist) {
        return Promise.resolve(state);
      }
      return Promise.resolve(state);
    } catch (error) {
      console.error('Auth migration error, clearing state:', error);
      return Promise.resolve(undefined);
    }
  },
};

const persistedInterviewReducer = persistReducer(persistConfig, interviewReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    interview: persistedInterviewReducer,
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['interview.currentCandidate.resumeFile'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
