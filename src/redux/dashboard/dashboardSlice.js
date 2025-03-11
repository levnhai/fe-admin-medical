import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

export const fetchAllDashboardStats = createAsyncThunk('dashboard/fetchAllDashboardStats', async () => {
  try {
    const response = await axios.get('/dashboard-stats');
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

const dashboard = createSlice({
  name: 'dashboard',
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export default dashboard.reducer;
