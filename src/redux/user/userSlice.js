import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

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
      });
  },
});

export default userSlice.reducer;
