import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// Lấy tất cả tin tức
export const fetchAllNews = createAsyncThunk(
  'news/fetchAllNews',
  async () => {
    try {
      const response = await axios.get('news/get-all-admin');
      return response.result?.news;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Tạo mới tin tức
export const fetchCreateNews = createAsyncThunk(
  'news/fetchCreateNews',
  async ({ formData }) => {
    try {
      const response = await axios.post('news/create', formData);
      return response.result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Sửa tin tức
export const fetchUpdateNews = createAsyncThunk(
  'news/fetchUpdateNews',
  async ({ id, formData }) => {
    try {
      const response = await axios.put(`news/update/${id}`, formData);
      return { id, ...response.result };
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Xóa tin tức
export const fetchDeleteNews = createAsyncThunk(
  'news/fetchDeleteNews',
  async (id) => {
    try {
      await axios.delete(`news/delete/${id}`);
      return id; // Trả về ID đã xóa
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    newsData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý fetchAllNews
      .addCase(fetchAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsData = action.payload;
        state.error = null;
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.newsData = [];
      })

      // Xử lý fetchCreateNews
      .addCase(fetchCreateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreateNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsData.push(action.payload);
        state.error = null;
      })
      .addCase(fetchCreateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Xử lý fetchUpdateNews
      .addCase(fetchUpdateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdateNews.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.newsData.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.newsData[index] = action.payload; 
        }
        state.error = null;
      })
      .addCase(fetchUpdateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Xử lý fetchDeleteNews
      .addCase(fetchDeleteNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsData = state.newsData.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(fetchDeleteNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default newsSlice.reducer;
