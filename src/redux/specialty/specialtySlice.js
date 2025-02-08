import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

export const fetchAllSpecialty = createAsyncThunk('docter/fetchAllSpecialty', async () => {
  try {
    const response = await axios.get('/specialty/get-all-specialty');
    console.log('check response', response.result);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

const specialtySlice = createSlice({
  name: 'specialty',
  initialState: {
    specialtyData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all specialty
    builder
      .addCase(fetchAllSpecialty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSpecialty.fulfilled, (state, action) => {
        state.loading = false;
        state.specialtyData = action.payload;
      })
      .addCase(fetchAllSpecialty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default specialtySlice.reducer;
