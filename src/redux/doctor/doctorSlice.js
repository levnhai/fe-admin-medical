import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// get all doctor
export const fetchAllDoctor = createAsyncThunk('doctor/fetchAllDoctor', async () => {
  try {
    const response = await axios.get('/doctor/get-all-doctor', { withCredentials: true });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all doctor by hospital
export const fetchDoctorByHospital = createAsyncThunk('doctor/fetchDoctorByHospital', async (hospitalId) => {
  try {
    const response = await axios.post('/doctor/get-doctor-by-hospital', { hospitalId }, { withCredentials: true });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// create doctor
export const fetchCreateDoctor = createAsyncThunk('doctor/fetchCreateDoctor', async (formData) => {
  try {
    const response = await axios.post('/doctor/create-doctor', { formData });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// create doctor
export const fetchCreateAdmin = createAsyncThunk('doctor/fetchCreateAdmin', async (formData) => {
  try {
    const response = await axios.post('/admin/create-admin', { formData });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});
// update doctor
export const fetchUpdateDoctor = createAsyncThunk('doctor/fetchUpdateDoctor', async ({ doctorId, formData }) => {
  try {
    const response = await axios.put(`/doctor/update-doctor/${doctorId}`, formData);
    console.log('check resp slice', response);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete doctor
export const fetchDeleteDoctor = createAsyncThunk('doctor/fetchDeleteDoctor', async (doctorId) => {
  try {
    const response = await axios.delete(`/doctor/delete-doctor/${doctorId}`);

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

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: {
    docterData: null,
    doctorByHospitalData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // get all docter
      .addCase(fetchAllDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.docterData = action.payload;
      })
      .addCase(fetchAllDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // get docter by hospital
      .addCase(fetchDoctorByHospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorByHospital.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorByHospitalData = action.payload;
      })
      .addCase(fetchDoctorByHospital.rejected, (state, action) => {
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

export default doctorSlice.reducer;
