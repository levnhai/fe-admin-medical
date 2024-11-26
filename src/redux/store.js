import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../redux/user/authSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';

import userSlice from './user/userSlice';
import newSlice from './news/newsSlice';
import locationSlice from './location/locationSlice';
import docterSlice from './docter/docterSlice';
import hospitalSlice from './hospital/hospitalSlice';
import authSlide from './auth/authSlice';

import contactSlice from './contact/contactSlice';

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isLoggedIn', 'user', 'phoneNumber'],
  transforms: [encryptTransform({ secretKey: 'lvhai-16072002' })],
};

const persistedReducer = persistReducer(persistConfig, authSlide);

const Store = configureStore({
  reducer: {
    user: userSlice,
    news: newSlice,
    location: locationSlice,
    docter: docterSlice,
    hospital: hospitalSlice,
    auth: persistedReducer,
    contact: contactSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default Store;
export const persistor = persistStore(Store);
