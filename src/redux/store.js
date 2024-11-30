import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../redux/user/authSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';

import userSlice from './user/userSlice';
import newsSlice from './news/newsSlice';
import locationSlice from './location/locationSlice';
import docterSlice from './docter/docterSlice';
import hospitalSlice from './hospital/hospitalSlice';
import authSlide from './auth/authSlice';
import contactSlice from './contact/contactSlice';
import categorySlice from './news/categorySlice';

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
    news: newsSlice,
    location: locationSlice,
    docter: docterSlice,
    hospital: hospitalSlice,
    auth: persistedReducer,
    contact: contactSlice,
    categoryNews: categorySlice,
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
