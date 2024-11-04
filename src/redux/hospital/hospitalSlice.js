import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// get all hospital
export const fetchAllHospital = createAsyncThunk('hospital/fetchAllHospital', async () => {
  try {
    const response = await axios.get('/hospital/get-all-hospital');
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// create hospital
export const fetchCreateHospital = createAsyncThunk('hospital/fetchCreateHospital', async (formData) => {
  try {
    const response = await axios.post('/hospital/create-hospital', { formData });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState: {
    hospitalData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all provinces
    builder
      .addCase(fetchAllHospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHospital.fulfilled, (state, action) => {
        state.loading = false;
        state.hospitalData = action.payload;
      })
      .addCase(fetchAllHospital.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default hospitalSlice.reducer;
