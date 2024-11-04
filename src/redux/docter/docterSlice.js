import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// get all docter
export const fetchAllDocter = createAsyncThunk('docter/fetchAllDocter', async () => {
  try {
    const response = await axios.get('/docter/get-all-docter');
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// create docter
export const fetchCreateDocter = createAsyncThunk('docter/fetchCreateDocter', async (formData) => {
  try {
    console.log('chekc form data', formData);
    const response = await axios.post('/docter/create-docter', { formData });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

const docterSlice = createSlice({
  name: 'docter',
  initialState: {
    docterData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all provinces
    builder
      .addCase(fetchAllDocter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDocter.fulfilled, (state, action) => {
        state.loading = false;
        state.docterData = action.payload;
      })
      .addCase(fetchAllDocter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default docterSlice.reducer;
