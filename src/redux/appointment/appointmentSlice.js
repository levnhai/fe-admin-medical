import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

export const fetchAllAppointmentByhospital = createAsyncThunk('appointment/fetchAllAppointmentByhospital', async () => {
  try {
    const response = await axios.get('/appointment/get-all-appointment-by-hospital');
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

export const fetchUpdateStatus = createAsyncThunk('appointment/fetchUpdateStatus', async ({ status, id }) => {
  try {
    const response = await axios.put(`/appointment/update-status/${id}`, { status });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

export const fetchDeleteAppointment = createAsyncThunk('appointment/fetchDeleteAppointment', async (id) => {
    try {
      const response = await axios.delete(`/appointment/delete-appointment/${id}`);
      return response.result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);


const appointment = createSlice({
  name: 'appointment',
  initialState: {
    contactData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all user
    builder
      .addCase(fetchAllAppointmentByhospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAppointmentByhospital.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchAllAppointmentByhospital.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      //delete
      .addCase(fetchDeleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchDeleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default appointment.reducer;
