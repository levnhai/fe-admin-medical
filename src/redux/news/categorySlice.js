import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// Fetch all category news
export const fetchAllCategoryNews = createAsyncThunk(
  'categoryNews/fetchAll',
  async () => {
    try {
      const response = await axios.get('categorynews/get-all');
      
      return response || [];
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Create a new category
export const fetchCreateCategoryNews = createAsyncThunk(
  'categoryNews/create',
  async (formData) => {
    try {
      const response = await axios.post('categorynews/create', formData);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Update an existing category
export const fetchUpdateCategoryNews = createAsyncThunk(
  'categoryNews/update',
  async ({ id, formData }) => {
    try {
      const response = await axios.put(`categorynews/update/${id}`, formData);
      return { id, ...response };
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Delete a category
export const fetchDeleteCategoryNews = createAsyncThunk(
  'categoryNews/delete',
  async (id) => {
    try {
      await axios.delete(`categorynews/delete/${id}`);
      return id;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const categoryNewsSlice = createSlice({
  name: 'categoryNews',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchAllCategoryNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategoryNews.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAllCategoryNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.categories = [];
      })
      
      // Create category
      .addCase(fetchCreateCategoryNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreateCategoryNews.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(fetchCreateCategoryNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update category
      .addCase(fetchUpdateCategoryNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdateCategoryNews.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex((item) => item._id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...action.payload };
        }
        state.error = null;
      })
      .addCase(fetchUpdateCategoryNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete category
      .addCase(fetchDeleteCategoryNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteCategoryNews.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter((item) => item._id !== action.payload);
        state.error = null;
      })
      .addCase(fetchDeleteCategoryNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categoryNewsSlice.reducer;