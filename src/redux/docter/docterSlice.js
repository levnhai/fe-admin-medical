import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// get all docter
export const fetchAllDocter = createAsyncThunk('docter/fetchAllDocter', async () => {
  try {
    const response = await axios.get('/docter/get-all-docter', { withCredentials: true });
    console.log('check response docter', response);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all docter
export const fetchDocterByHospital = createAsyncThunk('docter/fetchDocterByHospital', async (hospitalId) => {
  try {
    console.log('check hospitalid', hospitalId);
    const response = await axios.post('/docter/get-docter-by-hospital', { hospitalId }, { withCredentials: true });
    console.log('check response docter', response);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// create docter
export const fetchCreateDocter = createAsyncThunk('docter/fetchCreateDocter', async (formData) => {
  try {
    const response = await axios.post('/docter/create-docter', { formData });

    console.log('check response docter', response);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});
// update doctor
export const fetchUpdateDoctor = createAsyncThunk('doctor/fetchUpdateDoctor', async ({ doctorId, formData }) => {
  try {
    const response = await axios.put(`/docter/update-docter/${doctorId}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete doctor
export const fetchDeleteDoctor = createAsyncThunk('doctor/fetchDeleteDoctor', async (doctorId) => {
  try {
    const response = await axios.delete(`/docter/delete-docter/${doctorId}`);

    if (response.result && response.result.status === true) {
      return {
        status: true,
        doctorId,
        message: response.result.message,
        code: response.result.code,
      };
    }

    throw new Error(response.result?.message || 'Không thể xóa bác sĩ');
  } catch (error) {
    throw new Error(error.message);
  }
});

const docterSlice = createSlice({
  name: 'docter',
  initialState: {
    docterData: null,
    docterByHospitalData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // get all docter
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
      })

      // get docter by hospital
      .addCase(fetchDocterByHospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocterByHospital.fulfilled, (state, action) => {
        state.loading = false;
        state.docterByHospitalData = action.payload;
      })
      .addCase(fetchDocterByHospital.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update doctor
      .addCase(fetchUpdateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdateDoctor.fulfilled, (state, action) => {
        state.loading = false;
        if (state.doctorData?.data) {
          const index = state.doctorData.data.findIndex((doctor) => doctor._id === action.payload.data._id);
          if (index !== -1) {
            state.doctorData.data[index] = action.payload.data;
          }
        }
      })
      .addCase(fetchUpdateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete doctor
      .addCase(fetchDeleteDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteDoctor.fulfilled, (state, action) => {
        state.loading = false;
        if (state.docterData?.data) {
          state.docterData.data = state.docterData.data.filter((doctor) => doctor._id !== action.payload.doctorId);
        }
      })
      .addCase(fetchDeleteDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default docterSlice.reducer;
