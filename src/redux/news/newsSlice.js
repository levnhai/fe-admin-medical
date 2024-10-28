import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

export const fetchAllNews = createAsyncThunk('docter/fetchAllNews', async () => {
  try {
    const response = await axios.get('/news');
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
});

const newSlice = createSlice({
  name: 'news',
  initialState: {
    newsData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all news
    builder
      .addCase(fetchAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsData = action.payload;
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default newSlice.reducer;
