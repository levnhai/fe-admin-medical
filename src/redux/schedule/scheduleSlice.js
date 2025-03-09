import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// get all schedule
export const fetchAllScheduleByHospital = createAsyncThunk('schedule/fetchAllScheduleByHospital', async () => {
  try {
    const response = await axios.get('/schedule/get-schedule-by-hospital');
    console.log('check response docter', response);
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

// create schedule
export const fetchCreateSchedule = createAsyncThunk('schedule/fetchCreateSchedule', async (formData) => {
  try {
    console.log('check response docter slice', formData);
    const response = await axios.post('/schedule/create-schedule', { formData });
    return response.result;
  } catch (error) {
    throw new Error(error.message);
  }
});

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export default scheduleSlice.reducer;
