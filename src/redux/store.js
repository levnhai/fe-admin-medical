import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../redux/user/authSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';

import userSlice from './user/userSlice';
import newSlice from './news/newsSlice';
import locationSlice from './location/locationSlice';
import doctorSlice from './doctor/doctorSlice';
import hospitalSlice from './hospital/hospitalSlice';
import authSlice from './auth/authSlice';
import specialtySlice from './specialty/specialtySlice';
import scheduleSlice from './schedule/scheduleSlice';

import contactSlice from './contact/contactSlice';

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isLoggedIn', 'user', 'phoneNumber'],
  transforms: [encryptTransform({ secretKey: 'lvhai-16072002' })],
};

const persistedReducer = persistReducer(persistConfig, authSlice);

const Store = configureStore({
  reducer: {
    user: userSlice,
    news: newSlice,
    location: locationSlice,
    doctor: doctorSlice,
    hospital: hospitalSlice,
    auth: persistedReducer,
    contact: contactSlice,
    specialty: specialtySlice,
    schedule: scheduleSlice,
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
