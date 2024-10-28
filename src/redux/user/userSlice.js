import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// check phone number
export const fetchCheckPhone = createAsyncThunk('authSlice/fetchCheckPhone', async (phoneNumber) => {
  try {
    const response = await axios.post('auth/check-phone', { phoneNumber });
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
});

export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async () => {
  try {
    const response = await axios.get('/user/get-all');
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

export const fetchDeleteUser = createAsyncThunk('user/fetchDeleteUser', async (id) => {
  try {
    console.log('check id', id);
    const response = await axios.post('/user/delete-user', { id });
    console.log('check response', response);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// Create user
export const fetchCreateUser = createAsyncThunk(
  'user/fetchCreateUser',
  async (userData) => {
    try {
      const response = await axios.post('/user/create', userData);
      return response.result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Edit user
export const fetchEditUser = createAsyncThunk(
  'user/fetchEditUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/user/edit-user/${userId}`, userData);
      return response.result;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all user
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Edit user
      .addCase(fetchEditUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEditUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchEditUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create user
      .addCase(fetchCreateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreateUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchCreateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
