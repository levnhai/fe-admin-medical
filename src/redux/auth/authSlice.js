import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// login
export const fetchLogin = createAsyncThunk('auth/fetchLogin', async ({ phoneNumber, password }) => {
  try {
    const response = await axios.post('auth/login-admin', { phoneNumber, password });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginUser: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    // get all provinces
    // builder
    //   .addCase(fetchLogin.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchLogin.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.user = action.payload;
    //   })
    //   .addCase(fetchLogin.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.error.message;
    //   });
  },
});
export const { loginUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
