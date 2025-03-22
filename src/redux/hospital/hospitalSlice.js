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

// edit hospital
export const fetchEditHospital = createAsyncThunk('hospital/fetchEditHospital', async ({ hospitalId, formData }) => {
  try {
    const response = await axios.post(`/hospital/edit-hospital/${hospitalId}`, formData);

    console.log('check response 1', response);
    return response.result;
  } catch (error) {
    throw error;
  }
});
export const fetchDeleteHospital = createAsyncThunk('hospital/fetchDeleteHospital', async (hospitalId) => {
  const response = await axios.delete(`/hospital/delete-hospital/${hospitalId}`);

  if (response.result && response.result.status === true) {
    return {
      status: true,
      hospitalId,
      message: response.result.message,
      code: response.result.code,
    };
  }

  throw new Error(response.result?.message || 'Không thể xóa bệnh viện');
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
      })
      .addCase(fetchEditHospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEditHospital.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchEditHospital.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDeleteHospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteHospital.fulfilled, (state, action) => {
        state.loading = false;
        if (state.hospitalData?.data) {
          state.hospitalData.data = state.hospitalData.data.filter(
            (hospital) => hospital._id !== action.payload.hospitalId,
          );
        }
      })
      .addCase(fetchDeleteHospital.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Có lỗi xảy ra';
      });
  },
});

export default hospitalSlice.reducer;
